import { Observable } from 'rxjs';
/**
 * Unified Storage Manager for HyperDev IDE
 *
 * Supports multiple storage backends:
 * - Redis: Fast caching and real-time data
 * - Local Filesystem: Development and offline usage
 * - IPFS: Decentralized, immutable storage for Web3
 *
 * Enables seamless transition between centralized and decentralized architectures
 */
export type StorageBackend = 'redis' | 'filesystem' | 'ipfs';
export type StorageMode = 'hybrid' | 'decentralized' | 'centralized';
export interface StorageConfig {
    mode: StorageMode;
    primary: StorageBackend;
    fallback?: StorageBackend;
    redis?: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
    filesystem?: {
        basePath: string;
        enableCache: boolean;
    };
    ipfs?: {
        repo?: string;
        config?: any;
    };
}
export interface StorageMetadata {
    backend: StorageBackend;
    timestamp: Date;
    size: number;
    hash?: string;
    version: number;
    signature?: string;
    encrypted: boolean;
}
export interface StorageResult<T> {
    data: T;
    metadata: StorageMetadata;
    cached: boolean;
}
export interface RegenerativeDataPoint {
    id: string;
    type: 'carbon_sequestration' | 'water_retention' | 'biodiversity_index' | 'soil_health' | 'energy_efficiency';
    value: number;
    unit: string;
    location: {
        coordinates: [number, number];
        region: string;
        ecosystem: string;
    };
    timestamp: Date;
    verification: {
        method: 'sensor' | 'satellite' | 'field_observation' | 'smart_contract';
        confidence: number;
        verifier: string;
        signature?: string;
    };
    impact: {
        baseline: number;
        improvement: number;
        regenerativeScore: number;
    };
}
export interface SupplyChainNode {
    id: string;
    type: 'producer' | 'processor' | 'distributor' | 'consumer' | 'recycler';
    name: string;
    location: {
        coordinates: [number, number];
        address: string;
    };
    ethAddress?: string;
    certifications: string[];
    regenerativeData: RegenerativeDataPoint[];
    hyperbolicEmbedding?: number[];
    connections: {
        nodeId: string;
        type: 'material_flow' | 'information_flow' | 'value_flow';
        weight: number;
        distance: number;
    }[];
}
export declare class StorageManager {
    private config;
    private redis?;
    private ipfs?;
    private cache;
    private connectionState$;
    constructor(config: StorageConfig);
    private initialize;
    private updateConnectionState;
    get connectionState(): Observable<{
        redis: boolean;
        ipfs: boolean;
        filesystem: boolean;
    }>;
    store<T>(key: string, data: T, options?: {
        backend?: StorageBackend;
        ttl?: number;
        encrypt?: boolean;
        replicate?: boolean;
    }): Promise<StorageMetadata>;
    retrieve<T>(key: string, options?: {
        backend?: StorageBackend;
        useCache?: boolean;
    }): Promise<StorageResult<T> | null>;
    delete(key: string, options?: {
        backend?: StorageBackend;
        deleteFromAll?: boolean;
    }): Promise<boolean>;
    private storeRedis;
    private retrieveRedis;
    private deleteRedis;
    private storeFilesystem;
    private retrieveFilesystem;
    private deleteFilesystem;
    private storeIPFS;
    private retrieveIPFS;
    private storeReference;
    private retrieveReference;
    private deleteReference;
    storeRegenerativeData(data: RegenerativeDataPoint): Promise<StorageMetadata>;
    getRegenerativeData(id: string): Promise<RegenerativeDataPoint | null>;
    queryRegenerativeData(filters: {
        type?: RegenerativeDataPoint['type'];
        location?: {
            center: [number, number];
            radius: number;
        };
        timeRange?: {
            start: Date;
            end: Date;
        };
        minScore?: number;
    }): Promise<RegenerativeDataPoint[]>;
    storeSupplyChainNode(node: SupplyChainNode): Promise<StorageMetadata>;
    getSupplyChainNetwork(): Promise<SupplyChainNode[]>;
    getStorageStats(): Promise<{
        totalKeys: number;
        totalSize: number;
        byBackend: Record<StorageBackend, {
            keys: number;
            size: number;
        }>;
    }>;
    migrateToDecentralized(): Promise<void>;
    cleanup(): Promise<void>;
}
export declare function createStorageManager(mode?: StorageMode): StorageManager;
//# sourceMappingURL=StorageManager.d.ts.map