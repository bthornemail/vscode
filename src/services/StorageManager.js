import { create as createIPFS } from 'ipfs';
import Redis from 'ioredis';
import { promises as fs } from 'fs';
import path from 'path';
import { BehaviorSubject } from 'rxjs';
export class StorageManager {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "redis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ipfs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "connectionState$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject({ redis: false, ipfs: false, filesystem: false })
        });
        this.config = config;
        this.initialize();
    }
    async initialize() {
        // Initialize Redis if configured
        if (this.config.redis) {
            try {
                this.redis = new Redis(this.config.redis);
                await this.redis.ping();
                this.updateConnectionState('redis', true);
                console.log('✅ Redis connected');
            }
            catch (error) {
                console.warn('⚠️ Redis connection failed:', error);
                this.updateConnectionState('redis', false);
            }
        }
        // Initialize IPFS if configured
        if (this.config.ipfs) {
            try {
                this.ipfs = await createIPFS({
                    repo: this.config.ipfs.repo || './ipfs-repo',
                    config: this.config.ipfs.config || {
                        Addresses: {
                            Swarm: ['/ip4/0.0.0.0/tcp/4001', '/ip4/0.0.0.0/tcp/4002/ws']
                        }
                    }
                });
                this.updateConnectionState('ipfs', true);
                console.log('✅ IPFS node started');
            }
            catch (error) {
                console.warn('⚠️ IPFS initialization failed:', error);
                this.updateConnectionState('ipfs', false);
            }
        }
        // Initialize filesystem
        if (this.config.filesystem) {
            try {
                await fs.mkdir(this.config.filesystem.basePath, { recursive: true });
                this.updateConnectionState('filesystem', true);
                console.log('✅ Filesystem storage ready');
            }
            catch (error) {
                console.warn('⚠️ Filesystem initialization failed:', error);
                this.updateConnectionState('filesystem', false);
            }
        }
    }
    updateConnectionState(backend, connected) {
        const current = this.connectionState$.value;
        this.connectionState$.next({ ...current, [backend]: connected });
    }
    get connectionState() {
        return this.connectionState$.asObservable();
    }
    // Core Storage Operations
    async store(key, data, options = {}) {
        const backend = options.backend || this.config.primary;
        const serializedData = JSON.stringify(data);
        const metadata = {
            backend,
            timestamp: new Date(),
            size: new Blob([serializedData]).size,
            version: 1,
            encrypted: options.encrypt || false
        };
        try {
            switch (backend) {
                case 'redis':
                    await this.storeRedis(key, serializedData, options.ttl);
                    break;
                case 'filesystem':
                    await this.storeFilesystem(key, serializedData);
                    break;
                case 'ipfs':
                    const hash = await this.storeIPFS(serializedData);
                    metadata.hash = hash;
                    // Store IPFS hash reference in Redis/filesystem for quick lookup
                    await this.storeReference(key, hash, backend);
                    break;
            }
            // Store in local cache
            if (this.config.filesystem?.enableCache) {
                this.cache.set(key, { data, metadata });
            }
            // Replicate to secondary storage if requested
            if (options.replicate && this.config.fallback && this.config.fallback !== backend) {
                await this.store(key, data, { ...options, backend: this.config.fallback, replicate: false });
            }
            return metadata;
        }
        catch (error) {
            console.error(`Storage failed for backend ${backend}:`, error);
            // Try fallback backend
            if (this.config.fallback && this.config.fallback !== backend) {
                return this.store(key, data, { ...options, backend: this.config.fallback, replicate: false });
            }
            throw error;
        }
    }
    async retrieve(key, options = {}) {
        const backend = options.backend || this.config.primary;
        // Check cache first
        if (options.useCache !== false && this.cache.has(key)) {
            const cached = this.cache.get(key);
            return { ...cached, cached: true };
        }
        try {
            let serializedData = null;
            let metadata = { backend };
            switch (backend) {
                case 'redis':
                    serializedData = await this.retrieveRedis(key);
                    break;
                case 'filesystem':
                    serializedData = await this.retrieveFilesystem(key);
                    break;
                case 'ipfs':
                    const hash = await this.retrieveReference(key);
                    if (hash) {
                        serializedData = await this.retrieveIPFS(hash);
                        metadata.hash = hash;
                    }
                    break;
            }
            if (!serializedData) {
                // Try fallback backend
                if (this.config.fallback && this.config.fallback !== backend) {
                    return this.retrieve(key, { ...options, backend: this.config.fallback });
                }
                return null;
            }
            const data = JSON.parse(serializedData);
            const result = {
                data,
                metadata: {
                    backend,
                    timestamp: new Date(),
                    size: new Blob([serializedData]).size,
                    version: 1,
                    encrypted: false,
                    ...metadata
                },
                cached: false
            };
            // Update cache
            if (this.config.filesystem?.enableCache) {
                this.cache.set(key, result);
            }
            return result;
        }
        catch (error) {
            console.error(`Retrieval failed for backend ${backend}:`, error);
            // Try fallback backend
            if (this.config.fallback && this.config.fallback !== backend) {
                return this.retrieve(key, { ...options, backend: this.config.fallback });
            }
            return null;
        }
    }
    async delete(key, options = {}) {
        const backend = options.backend || this.config.primary;
        let success = false;
        try {
            switch (backend) {
                case 'redis':
                    await this.deleteRedis(key);
                    success = true;
                    break;
                case 'filesystem':
                    await this.deleteFilesystem(key);
                    success = true;
                    break;
                case 'ipfs':
                    // IPFS is immutable, but we can remove the reference
                    await this.deleteReference(key);
                    success = true;
                    break;
            }
            // Remove from cache
            this.cache.delete(key);
            // Delete from all backends if requested
            if (options.deleteFromAll) {
                const backends = ['redis', 'filesystem', 'ipfs'];
                for (const b of backends) {
                    if (b !== backend) {
                        await this.delete(key, { backend: b, deleteFromAll: false });
                    }
                }
            }
            return success;
        }
        catch (error) {
            console.error(`Deletion failed for backend ${backend}:`, error);
            return false;
        }
    }
    // Backend-specific implementations
    async storeRedis(key, data, ttl) {
        if (!this.redis)
            throw new Error('Redis not initialized');
        if (ttl) {
            await this.redis.setex(key, ttl, data);
        }
        else {
            await this.redis.set(key, data);
        }
    }
    async retrieveRedis(key) {
        if (!this.redis)
            throw new Error('Redis not initialized');
        return await this.redis.get(key);
    }
    async deleteRedis(key) {
        if (!this.redis)
            throw new Error('Redis not initialized');
        await this.redis.del(key);
    }
    async storeFilesystem(key, data) {
        if (!this.config.filesystem)
            throw new Error('Filesystem not configured');
        const filePath = path.join(this.config.filesystem.basePath, `${key}.json`);
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, data, 'utf-8');
    }
    async retrieveFilesystem(key) {
        if (!this.config.filesystem)
            throw new Error('Filesystem not configured');
        const filePath = path.join(this.config.filesystem.basePath, `${key}.json`);
        try {
            return await fs.readFile(filePath, 'utf-8');
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }
    async deleteFilesystem(key) {
        if (!this.config.filesystem)
            throw new Error('Filesystem not configured');
        const filePath = path.join(this.config.filesystem.basePath, `${key}.json`);
        await fs.unlink(filePath);
    }
    async storeIPFS(data) {
        if (!this.ipfs)
            throw new Error('IPFS not initialized');
        const result = await this.ipfs.add(data);
        return result.cid.toString();
    }
    async retrieveIPFS(hash) {
        if (!this.ipfs)
            throw new Error('IPFS not initialized');
        const chunks = [];
        for await (const chunk of this.ipfs.cat(hash)) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString('utf-8');
    }
    async storeReference(key, hash, originalBackend) {
        const referenceKey = `ipfs_ref:${key}`;
        const reference = { hash, originalBackend, timestamp: new Date().toISOString() };
        // Store reference in Redis or filesystem
        if (this.redis) {
            await this.redis.set(referenceKey, JSON.stringify(reference));
        }
        else if (this.config.filesystem) {
            await this.storeFilesystem(referenceKey, JSON.stringify(reference));
        }
    }
    async retrieveReference(key) {
        const referenceKey = `ipfs_ref:${key}`;
        let referenceData = null;
        if (this.redis) {
            referenceData = await this.redis.get(referenceKey);
        }
        else if (this.config.filesystem) {
            referenceData = await this.retrieveFilesystem(referenceKey);
        }
        if (referenceData) {
            const reference = JSON.parse(referenceData);
            return reference.hash;
        }
        return null;
    }
    async deleteReference(key) {
        const referenceKey = `ipfs_ref:${key}`;
        if (this.redis) {
            await this.redis.del(referenceKey);
        }
        else if (this.config.filesystem) {
            await this.deleteFilesystem(referenceKey);
        }
    }
    // Specialized Methods for Regenerative Data
    async storeRegenerativeData(data) {
        const key = `regenerative:${data.id}`;
        return this.store(key, data, {
            backend: this.config.mode === 'decentralized' ? 'ipfs' : this.config.primary,
            replicate: true,
            encrypt: false
        });
    }
    async getRegenerativeData(id) {
        const key = `regenerative:${id}`;
        const result = await this.retrieve(key);
        return result?.data || null;
    }
    async queryRegenerativeData(filters) {
        // This would need to be implemented with proper indexing
        // For now, return empty array as placeholder
        console.log('Querying regenerative data with filters:', filters);
        return [];
    }
    async storeSupplyChainNode(node) {
        const key = `supply_chain:${node.id}`;
        return this.store(key, node, {
            backend: this.config.mode === 'decentralized' ? 'ipfs' : this.config.primary,
            replicate: true
        });
    }
    async getSupplyChainNetwork() {
        // This would query all supply chain nodes
        // Implementation would depend on indexing strategy
        console.log('Fetching supply chain network');
        return [];
    }
    // Utility Methods
    async getStorageStats() {
        const stats = {
            totalKeys: 0,
            totalSize: 0,
            byBackend: {
                redis: { keys: 0, size: 0 },
                filesystem: { keys: 0, size: 0 },
                ipfs: { keys: 0, size: 0 }
            }
        };
        // Count cache
        stats.totalKeys += this.cache.size;
        // Count Redis keys
        if (this.redis) {
            const redisKeys = await this.redis.keys('*');
            stats.byBackend.redis.keys = redisKeys.length;
        }
        // Count filesystem files
        if (this.config.filesystem) {
            try {
                const files = await fs.readdir(this.config.filesystem.basePath);
                stats.byBackend.filesystem.keys = files.length;
            }
            catch (error) {
                // Directory might not exist yet
            }
        }
        return stats;
    }
    async migrateToDecentralized() {
        console.log('🌐 Migrating to decentralized storage...');
        if (!this.ipfs) {
            throw new Error('IPFS not available for migration');
        }
        // Migrate Redis data to IPFS
        if (this.redis) {
            const keys = await this.redis.keys('*');
            for (const key of keys) {
                const data = await this.redis.get(key);
                if (data) {
                    const hash = await this.storeIPFS(data);
                    await this.storeReference(key, hash, 'redis');
                    console.log(`✅ Migrated ${key} to IPFS: ${hash}`);
                }
            }
        }
        // Update configuration
        this.config.mode = 'decentralized';
        this.config.primary = 'ipfs';
        console.log('🎉 Migration to decentralized storage complete');
    }
    async cleanup() {
        if (this.redis) {
            await this.redis.disconnect();
        }
        if (this.ipfs) {
            await this.ipfs.stop();
        }
        this.cache.clear();
        this.connectionState$.complete();
    }
}
// Factory function for easy setup
export function createStorageManager(mode = 'hybrid') {
    const configs = {
        centralized: {
            mode: 'centralized',
            primary: 'redis',
            fallback: 'filesystem',
            redis: {
                host: 'localhost',
                port: 6379
            },
            filesystem: {
                basePath: './storage',
                enableCache: true
            }
        },
        decentralized: {
            mode: 'decentralized',
            primary: 'ipfs',
            fallback: 'filesystem',
            ipfs: {
                repo: './ipfs-repo'
            },
            filesystem: {
                basePath: './storage',
                enableCache: true
            }
        },
        hybrid: {
            mode: 'hybrid',
            primary: 'redis',
            fallback: 'ipfs',
            redis: {
                host: 'localhost',
                port: 6379
            },
            ipfs: {
                repo: './ipfs-repo'
            },
            filesystem: {
                basePath: './storage',
                enableCache: true
            }
        }
    };
    return new StorageManager(configs[mode]);
}
//# sourceMappingURL=StorageManager.js.map