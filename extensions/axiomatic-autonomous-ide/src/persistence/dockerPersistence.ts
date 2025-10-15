/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	IAIPersistenceService,
	IdentityConfig,
	Identity,
	Memory,
	MemoryQuery,
	ConceptLearning,
	MemoryStats
} from '../../../src/vs/workbench/contrib/axiomatic/common/axiomatic';

interface DockerPersistenceConfig {
	serviceUrl: string;
	timeout: number;
	retryAttempts: number;
}

export class DockerPersistenceService implements IAIPersistenceService {
	readonly _serviceBrand: undefined;

	private config: DockerPersistenceConfig;
	private initialized: boolean = false;

	constructor(config: DockerPersistenceConfig) {
		this.config = config;
	}

	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		try {
			// Test connection to Docker service
			await this.testConnection();
			this.initialized = true;
		} catch (error) {
			throw new Error(`Failed to initialize Docker AI Persistence: ${error}`);
		}
	}

	private async testConnection(): Promise<void> {
		const response = await this.makeRequest('GET', '/health');
		if (!response.ok) {
			throw new Error(`Docker service not healthy: ${response.statusText}`);
		}
	}

	private async makeRequest(method: string, endpoint: string, body?: any): Promise<Response> {
		const url = `${this.config.serviceUrl}${endpoint}`;
		const options: RequestInit = {
			method,
			headers: {
				'Content-Type': 'application/json',
			},
			signal: AbortSignal.timeout(this.config.timeout)
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
			try {
				const response = await fetch(url, options);
				return response;
			} catch (error) {
				lastError = error as Error;
				if (attempt < this.config.retryAttempts) {
					// Exponential backoff
					await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
				}
			}
		}

		throw lastError || new Error('Request failed after all retry attempts');
	}

	async createIdentity(config: IdentityConfig): Promise<Identity> {
		if (!this.initialized) {
			throw new Error('Docker AI Persistence not initialized');
		}

		const response = await this.makeRequest('POST', '/api/identities', config);

		if (!response.ok) {
			throw new Error(`Failed to create identity: ${response.statusText}`);
		}

		return await response.json();
	}

	async getIdentity(): Promise<Identity | null> {
		if (!this.initialized) {
			throw new Error('Docker AI Persistence not initialized');
		}

		const response = await this.makeRequest('GET', '/api/identities');

		if (!response.ok) {
			throw new Error(`Failed to get identity: ${response.statusText}`);
		}

		const identities = await response.json();
		return identities.length > 0 ? identities[0] : null;
	}

	async storeMemory(memory: Memory): Promise<void> {
		if (!this.initialized) {
			throw new Error('Docker AI Persistence not initialized');
		}

		const response = await this.makeRequest('POST', '/api/memories', memory);

		if (!response.ok) {
			throw new Error(`Failed to store memory: ${response.statusText}`);
		}
	}

	async getMemories(query: MemoryQuery): Promise<Memory[]> {
		if (!this.initialized) {
			throw new Error('Docker AI Persistence not initialized');
		}

		const params = new URLSearchParams();

		if (query.content) {
			params.append('content', query.content);
		}
		if (query.type) {
			params.append('type', query.type);
		}
		if (query.tags) {
			params.append('tags', query.tags.join(','));
		}
		if (query.limit) {
			params.append('limit', query.limit.toString());
		}
		if (query.offset) {
			params.append('offset', query.offset.toString());
		}

		const response = await this.makeRequest('GET', `/api/memories?${params.toString()}`);

		if (!response.ok) {
			throw new Error(`Failed to get memories: ${response.statusText}`);
		}

		return await response.json();
	}

	async learnConcept(concept: ConceptLearning): Promise<void> {
		if (!this.initialized) {
			throw new Error('Docker AI Persistence not initialized');
		}

		const response = await this.makeRequest('POST', '/api/learn', concept);

		if (!response.ok) {
			throw new Error(`Failed to learn concept: ${response.statusText}`);
		}
	}

	async consolidateMemories(): Promise<void> {
		if (!this.initialized) {
			throw new Error('Docker AI Persistence not initialized');
		}

		const response = await this.makeRequest('POST', '/api/memories/consolidate');

		if (!response.ok) {
			throw new Error(`Failed to consolidate memories: ${response.statusText}`);
		}
	}

	async getMemoryStats(): Promise<MemoryStats> {
		if (!this.initialized) {
			throw new Error('Docker AI Persistence not initialized');
		}

		const response = await this.makeRequest('GET', '/api/memories/stats');

		if (!response.ok) {
			throw new Error(`Failed to get memory stats: ${response.statusText}`);
		}

		return await response.json();
	}

	dispose(): void {
		// No cleanup needed for HTTP client
	}
}
