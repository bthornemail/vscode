/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import {
	IAIPersistenceService,
	IdentityConfig,
	Identity,
	Memory,
	MemoryQuery,
	ConceptLearning,
	MemoryStats
} from '../../../src/vs/workbench/contrib/axiomatic/common/axiomatic';

interface AIPersistenceConfig {
	storagePath: string;
	maxMemories: number;
	consolidationThreshold: number;
}

export class AIPersistenceService implements IAIPersistenceService {
	readonly _serviceBrand: undefined;

	private db: any; // SQLite database
	private config: AIPersistenceConfig;
	private initialized: boolean = false;

	constructor(config: AIPersistenceConfig) {
		this.config = config;
	}

	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		try {
			// Ensure storage directory exists
			await this.ensureStorageDirectory();

			// Initialize SQLite database
			await this.initializeDatabase();

			// Create default identity if none exists
			await this.ensureDefaultIdentity();

			this.initialized = true;
		} catch (error) {
			throw new Error(`Failed to initialize AI Persistence: ${error}`);
		}
	}

	private async ensureStorageDirectory(): Promise<void> {
		const mkdir = promisify(fs.mkdir);
		await mkdir(this.config.storagePath, { recursive: true });
	}

	private async initializeDatabase(): Promise<void> {
		const sqlite3 = require('sqlite3').verbose();
		const dbPath = path.join(this.config.storagePath, 'ai_persistence.db');

		return new Promise((resolve, reject) => {
			this.db = new sqlite3.Database(dbPath, (err: any) => {
				if (err) {
					reject(err);
					return;
				}

				// Create tables
				this.createTables()
					.then(() => resolve())
					.catch(reject);
			});
		});
	}

	private async createTables(): Promise<void> {
		const run = promisify(this.db.run.bind(this.db));

		// Identities table
		await run(`
			CREATE TABLE IF NOT EXISTS identities (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				type TEXT NOT NULL,
				capabilities TEXT NOT NULL,
				preferences TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// Memories table
		await run(`
			CREATE TABLE IF NOT EXISTS memories (
				id TEXT PRIMARY KEY,
				type TEXT NOT NULL,
				content TEXT NOT NULL,
				metadata TEXT NOT NULL,
				timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// Concepts table
		await run(`
			CREATE TABLE IF NOT EXISTS concepts (
				id TEXT PRIMARY KEY,
				concept TEXT NOT NULL,
				data TEXT NOT NULL,
				context TEXT NOT NULL,
				performance REAL NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// Learning progress table
		await run(`
			CREATE TABLE IF NOT EXISTS learning_progress (
				concept_id TEXT PRIMARY KEY,
				mastery REAL NOT NULL,
				confidence REAL NOT NULL,
				last_practiced DATETIME DEFAULT CURRENT_TIMESTAMP,
				practice_count INTEGER DEFAULT 0,
				improvement_rate REAL DEFAULT 0.0,
				FOREIGN KEY (concept_id) REFERENCES concepts (id)
			)
		`);

		// Create indexes
		await run(`CREATE INDEX IF NOT EXISTS idx_memories_type ON memories (type)`);
		await run(`CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories (timestamp)`);
		await run(`CREATE INDEX IF NOT EXISTS idx_concepts_concept ON concepts (concept)`);
	}

	private async ensureDefaultIdentity(): Promise<void> {
		const get = promisify(this.db.get.bind(this.db));
		const run = promisify(this.db.run.bind(this.db));

		const existingIdentity = await get('SELECT * FROM identities LIMIT 1');

		if (!existingIdentity) {
			const defaultIdentity: IdentityConfig = {
				name: 'VSCode AI Assistant',
				type: 'ai',
				capabilities: [
					'code_analysis',
					'pattern_detection',
					'learning',
					'suggestion_generation',
					'geometric_consciousness'
				],
				preferences: {
					learningStyle: 'adaptive',
					communicationStyle: 'technical',
					privacyLevel: 'private',
					interactionMode: 'autonomous'
				}
			};

			await this.createIdentity(defaultIdentity);
		}
	}

	async createIdentity(config: IdentityConfig): Promise<Identity> {
		if (!this.initialized) {
			throw new Error('AI Persistence not initialized');
		}

		const run = promisify(this.db.run.bind(this.db));
		const id = this.generateId();
		const now = new Date();

		const identity: Identity = {
			id,
			name: config.name,
			type: config.type,
			capabilities: config.capabilities,
			preferences: config.preferences,
			createdAt: now,
			updatedAt: now,
			lastAccessed: now
		};

		await run(
			`INSERT INTO identities (id, name, type, capabilities, preferences, created_at, updated_at, last_accessed)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				id,
				config.name,
				config.type,
				JSON.stringify(config.capabilities),
				JSON.stringify(config.preferences),
				now.toISOString(),
				now.toISOString(),
				now.toISOString()
			]
		);

		return identity;
	}

	async getIdentity(): Promise<Identity | null> {
		if (!this.initialized) {
			throw new Error('AI Persistence not initialized');
		}

		const get = promisify(this.db.get.bind(this.db));
		const run = promisify(this.db.run.bind(this.db));

		const row = await get('SELECT * FROM identities ORDER BY last_accessed DESC LIMIT 1');

		if (!row) {
			return null;
		}

		// Update last accessed
		await run('UPDATE identities SET last_accessed = ? WHERE id = ?', [new Date().toISOString(), row.id]);

		return {
			id: row.id,
			name: row.name,
			type: row.type,
			capabilities: JSON.parse(row.capabilities),
			preferences: JSON.parse(row.preferences),
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
			lastAccessed: new Date(row.last_accessed)
		};
	}

	async storeMemory(memory: Memory): Promise<void> {
		if (!this.initialized) {
			throw new Error('AI Persistence not initialized');
		}

		const run = promisify(this.db.run.bind(this.db));

		await run(
			`INSERT INTO memories (id, type, content, metadata, timestamp)
			 VALUES (?, ?, ?, ?, ?)`,
			[
				memory.id,
				memory.type,
				memory.content,
				JSON.stringify(memory.metadata),
				memory.timestamp.toISOString()
			]
		);

		// Check if consolidation is needed
		await this.checkConsolidation();
	}

	async getMemories(query: MemoryQuery): Promise<Memory[]> {
		if (!this.initialized) {
			throw new Error('AI Persistence not initialized');
		}

		const all = promisify(this.db.all.bind(this.db));

		let sql = 'SELECT * FROM memories WHERE 1=1';
		const params: any[] = [];

		if (query.content) {
			sql += ' AND content LIKE ?';
			params.push(`%${query.content}%`);
		}

		if (query.type) {
			sql += ' AND type = ?';
			params.push(query.type);
		}

		if (query.tags && query.tags.length > 0) {
			sql += ' AND metadata LIKE ?';
			params.push(`%"tags":%${query.tags.join('%')}%`);
		}

		sql += ' ORDER BY timestamp DESC';

		if (query.limit) {
			sql += ' LIMIT ?';
			params.push(query.limit);
		}

		if (query.offset) {
			sql += ' OFFSET ?';
			params.push(query.offset);
		}

		const rows = await all(sql, params);

		return rows.map(row => ({
			id: row.id,
			type: row.type,
			content: row.content,
			metadata: JSON.parse(row.metadata),
			timestamp: new Date(row.timestamp)
		}));
	}

	async learnConcept(concept: ConceptLearning): Promise<void> {
		if (!this.initialized) {
			throw new Error('AI Persistence not initialized');
		}

		const run = promisify(this.db.run.bind(this.db));
		const id = this.generateId();
		const now = new Date();

		await run(
			`INSERT OR REPLACE INTO concepts (id, concept, data, context, performance, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				id,
				concept.concept,
				JSON.stringify(concept.data),
				JSON.stringify(concept.context),
				concept.performance,
				now.toISOString(),
				now.toISOString()
			]
		);

		// Update learning progress
		await run(
			`INSERT OR REPLACE INTO learning_progress (concept_id, mastery, confidence, last_practiced, practice_count, improvement_rate)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[
				id,
				concept.performance,
				concept.performance * 0.9, // Initial confidence slightly lower than performance
				now.toISOString(),
				1,
				0.0
			]
		);
	}

	async consolidateMemories(): Promise<void> {
		if (!this.initialized) {
			throw new Error('AI Persistence not initialized');
		}

		const all = promisify(this.db.all.bind(this.db));
		const run = promisify(this.db.run.bind(this.db));

		// Get all memories
		const memories = await all('SELECT * FROM memories ORDER BY timestamp');

		// Simple consolidation: merge similar memories
		const consolidatedMemories = new Map<string, any>();

		for (const memory of memories) {
			const key = `${memory.type}:${memory.content.substring(0, 50)}`;

			if (consolidatedMemories.has(key)) {
				const existing = consolidatedMemories.get(key);
				// Merge metadata
				const existingMeta = JSON.parse(existing.metadata);
				const newMeta = JSON.parse(memory.metadata);

				existingMeta.importance = Math.max(existingMeta.importance, newMeta.importance);
				existingMeta.confidence = (existingMeta.confidence + newMeta.confidence) / 2;
				existingMeta.tags = [...new Set([...existingMeta.tags, ...newMeta.tags])];

				existing.metadata = JSON.stringify(existingMeta);
			} else {
				consolidatedMemories.set(key, memory);
			}
		}

		// Clear old memories and insert consolidated ones
		await run('DELETE FROM memories');

		for (const memory of consolidatedMemories.values()) {
			await run(
				`INSERT INTO memories (id, type, content, metadata, timestamp)
				 VALUES (?, ?, ?, ?, ?)`,
				[memory.id, memory.type, memory.content, memory.metadata, memory.timestamp]
			);
		}
	}

	async getMemoryStats(): Promise<MemoryStats> {
		if (!this.initialized) {
			throw new Error('AI Persistence not initialized');
		}

		const get = promisify(this.db.get.bind(this.db));
		const all = promisify(this.db.all.bind(this.db));

		// Total memories
		const totalResult = await get('SELECT COUNT(*) as count FROM memories');
		const totalMemories = totalResult.count;

		// Memories by type
		const typeResults = await all('SELECT type, COUNT(*) as count FROM memories GROUP BY type');
		const memoriesByType: Record<string, number> = {
			episodic: 0,
			semantic: 0,
			procedural: 0,
			working: 0,
			meta: 0
		};

		for (const result of typeResults) {
			memoriesByType[result.type] = result.count;
		}

		// Recent activity
		const now = new Date();
		const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		const last24Result = await get('SELECT COUNT(*) as count FROM memories WHERE timestamp > ?', [last24Hours.toISOString()]);
		const lastWeekResult = await get('SELECT COUNT(*) as count FROM memories WHERE timestamp > ?', [lastWeek.toISOString()]);
		const lastMonthResult = await get('SELECT COUNT(*) as count FROM memories WHERE timestamp > ?', [lastMonth.toISOString()]);

		// Last consolidation
		const lastConsolidationResult = await get('SELECT MAX(timestamp) as last_consolidation FROM memories');
		const lastConsolidation = lastConsolidationResult.last_consolidation ? new Date(lastConsolidationResult.last_consolidation) : null;

		return {
			totalMemories,
			memoriesByType,
			recentActivity: {
				last24Hours: last24Result.count,
				lastWeek: lastWeekResult.count,
				lastMonth: lastMonthResult.count
			},
			consolidationStatus: {
				lastConsolidation,
				pendingConsolidation: totalMemories > this.config.consolidationThreshold ? totalMemories - this.config.consolidationThreshold : 0
			}
		};
	}

	private async checkConsolidation(): Promise<void> {
		const stats = await this.getMemoryStats();
		if (stats.consolidationStatus.pendingConsolidation > 0) {
			await this.consolidateMemories();
		}
	}

	private generateId(): string {
		return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
	}

	dispose(): void {
		if (this.db) {
			this.db.close();
		}
	}
}
