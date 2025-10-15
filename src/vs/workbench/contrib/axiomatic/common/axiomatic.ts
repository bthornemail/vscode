/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const IAxiomaticService = createDecorator<IAxiomaticService>('axiomaticService');

export interface IAxiomaticService {
	readonly _serviceBrand: undefined;

	/**
	 * Initialize the Axiomatic system
	 */
	initialize(): Promise<void>;

	/**
	 * Check if Axiomatic is enabled
	 */
	isEnabled(): boolean;

	/**
	 * Enable or disable Axiomatic features
	 */
	setEnabled(enabled: boolean): Promise<void>;

	/**
	 * Get the current status of the Axiomatic system
	 */
	getStatus(): Promise<AxiomaticStatus>;

	/**
	 * Event fired when the status changes
	 */
	readonly onStatusChanged: Event<AxiomaticStatus>;
}

export interface AxiomaticStatus {
	enabled: boolean;
	autonomousMode: boolean;
	aiPersistenceStatus: 'initialized' | 'initializing' | 'error' | 'disabled';
	geometricCommunicationStatus: 'active' | 'inactive' | 'error';
	learningStatus: 'active' | 'paused' | 'error';
	memoryCount: number;
	lastConsolidation: Date | null;
	errors: string[];
}

export const IAIPersistenceService = createDecorator<IAIPersistenceService>('aiPersistenceService');

export interface IAIPersistenceService {
	readonly _serviceBrand: undefined;

	/**
	 * Initialize the AI Persistence system
	 */
	initialize(): Promise<void>;

	/**
	 * Create a new AI identity
	 */
	createIdentity(config: IdentityConfig): Promise<Identity>;

	/**
	 * Get the current identity
	 */
	getIdentity(): Promise<Identity | null>;

	/**
	 * Store a memory
	 */
	storeMemory(memory: Memory): Promise<void>;

	/**
	 * Retrieve memories based on query
	 */
	getMemories(query: MemoryQuery): Promise<Memory[]>;

	/**
	 * Learn a new concept
	 */
	learnConcept(concept: ConceptLearning): Promise<void>;

	/**
	 * Consolidate memories
	 */
	consolidateMemories(): Promise<void>;

	/**
	 * Get memory statistics
	 */
	getMemoryStats(): Promise<MemoryStats>;
}

export interface IdentityConfig {
	name: string;
	type: 'ai' | 'human' | 'system';
	capabilities: string[];
	preferences: {
		learningStyle: string;
		communicationStyle: string;
		privacyLevel: string;
		interactionMode: string;
	};
}

export interface Identity {
	id: string;
	name: string;
	type: 'ai' | 'human' | 'system';
	capabilities: string[];
	preferences: IdentityConfig['preferences'];
	createdAt: Date;
	updatedAt: Date;
	lastAccessed: Date;
}

export interface Memory {
	id: string;
	type: 'episodic' | 'semantic' | 'procedural' | 'working' | 'meta';
	content: string;
	metadata: {
		source: string;
		quality: number;
		confidence: number;
		importance: number;
		tags: string[];
		context?: any;
	};
	timestamp: Date;
}

export interface MemoryQuery {
	content?: string;
	tags?: string[];
	type?: Memory['type'];
	limit?: number;
	offset?: number;
}

export interface ConceptLearning {
	concept: string;
	data: {
		description: string;
		examples: string[];
		relationships: string[];
		applications: string[];
	};
	context: {
		domain: string;
		complexity: string;
		source: string;
	};
	performance: number;
}

export interface MemoryStats {
	totalMemories: number;
	memoriesByType: Record<Memory['type'], number>;
	recentActivity: {
		last24Hours: number;
		lastWeek: number;
		lastMonth: number;
	};
	consolidationStatus: {
		lastConsolidation: Date | null;
		pendingConsolidation: number;
	};
}

export const IGeometricCommunicationService = createDecorator<IGeometricCommunicationService>('geometricCommunicationService');

export interface IGeometricCommunicationService {
	readonly _serviceBrand: undefined;

	/**
	 * Create a geometric group
	 */
	createGroup(type: GeometricGroupType, agents: string[]): Promise<string>;

	/**
	 * Send a geometric message
	 */
	sendMessage(from: string, to: string, content: any, groupId: string): Promise<void>;

	/**
	 * Get group status
	 */
	getGroupStatus(groupId: string): Promise<GeometricGroupStatus>;

	/**
	 * Check consensus in a group
	 */
	checkConsensus(groupId: string): Promise<ConsensusResult>;
}

export type GeometricGroupType = 'tetrahedron' | 'cube' | 'octahedron' | 'icosahedron' | 'dodecahedron';

export interface GeometricGroup {
	id: string;
	type: GeometricGroupType;
	agents: string[];
	connections: Array<{ from: string; to: string; weight: number }>;
	createdAt: Date;
}

export interface GeometricGroupStatus {
	group: GeometricGroup;
	activeConnections: number;
	messageCount: number;
	consensusLevel: number;
	topologicalProperties: {
		betti0: number;
		betti1: number;
		betti2: number;
	};
}

export interface ConsensusResult {
	achieved: boolean;
	level: number;
	required: number;
	participants: string[];
	message: string;
}

export const IAutonomousAgentService = createDecorator<IAutonomousAgentService>('autonomousAgentService');

export interface IAutonomousAgentService {
	readonly _serviceBrand: undefined;

	/**
	 * Start an autonomous agent
	 */
	startAgent(type: AgentType, config: AgentConfig): Promise<string>;

	/**
	 * Stop an autonomous agent
	 */
	stopAgent(agentId: string): Promise<void>;

	/**
	 * Get agent status
	 */
	getAgentStatus(agentId: string): Promise<AgentStatus>;

	/**
	 * Get all active agents
	 */
	getActiveAgents(): Promise<AgentStatus[]>;

	/**
	 * Event fired when agent status changes
	 */
	readonly onAgentStatusChanged: Event<AgentStatus>;
}

export type AgentType = 'codeAnalysis' | 'suggestion' | 'learning' | 'refactoring' | 'debugging';

export interface AgentConfig {
	type: AgentType;
	name: string;
	enabled: boolean;
	learningRate: number;
	autonomousMode: boolean;
	geometricConsciousness: boolean;
}

export interface AgentStatus {
	id: string;
	config: AgentConfig;
	status: 'active' | 'inactive' | 'error' | 'learning';
	performance: {
		suggestionsGenerated: number;
		suggestionsAccepted: number;
		learningEvents: number;
		errorCount: number;
	};
	lastActivity: Date;
	errors: string[];
}
