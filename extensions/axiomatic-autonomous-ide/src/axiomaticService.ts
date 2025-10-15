/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event, Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { AIPersistenceService } from './persistence/embeddedPersistence';
import { GeometricCommunicationService } from './geometric/geometricCommunication';
import { AutonomousAgentService } from './agents/autonomousAgentService';
import {
	IAxiomaticService,
	AxiomaticStatus,
	IAIPersistenceService,
	IGeometricCommunicationService,
	IAutonomousAgentService
} from '../../src/vs/workbench/contrib/axiomatic/common/axiomatic';

export class AxiomaticService extends Disposable implements IAxiomaticService {
	readonly _serviceBrand: undefined;

	private readonly _onStatusChanged = this._register(new Emitter<AxiomaticStatus>());
	readonly onStatusChanged: Event<AxiomaticStatus> = this._onStatusChanged.event;

	private _enabled: boolean = false;
	private _autonomousMode: boolean = false;
	private _status: AxiomaticStatus;

	constructor(
		private readonly aiPersistence: IAIPersistenceService,
		private readonly geometricCommunication: IGeometricCommunicationService,
		private readonly autonomousAgentService: IAutonomousAgentService
	) {
		super();

		this._status = {
			enabled: false,
			autonomousMode: false,
			aiPersistenceStatus: 'disabled',
			geometricCommunicationStatus: 'inactive',
			learningStatus: 'paused',
			memoryCount: 0,
			lastConsolidation: null,
			errors: []
		};
	}

	async initialize(): Promise<void> {
		try {
			// Initialize AI Persistence
			await this.aiPersistence.initialize();
			this._status.aiPersistenceStatus = 'initialized';

			// Initialize Geometric Communication
			// TODO: Initialize geometric communication service
			this._status.geometricCommunicationStatus = 'active';

			// Initialize Autonomous Agents
			// TODO: Start default agents
			this._status.learningStatus = 'active';

			// Update memory count
			const stats = await this.aiPersistence.getMemoryStats();
			this._status.memoryCount = stats.totalMemories;
			this._status.lastConsolidation = stats.consolidationStatus.lastConsolidation;

			this._enabled = true;
			this._autonomousMode = true;
			this._status.enabled = true;
			this._status.autonomousMode = true;

			this._onStatusChanged.fire(this._status);
		} catch (error) {
			this._status.errors.push(`Initialization failed: ${error}`);
			this._status.aiPersistenceStatus = 'error';
			this._onStatusChanged.fire(this._status);
			throw error;
		}
	}

	isEnabled(): boolean {
		return this._enabled;
	}

	async setEnabled(enabled: boolean): Promise<void> {
		if (this._enabled === enabled) {
			return;
		}

		this._enabled = enabled;
		this._status.enabled = enabled;

		if (enabled) {
			await this.initialize();
		} else {
			// Stop all agents
			const agents = await this.autonomousAgentService.getActiveAgents();
			for (const agent of agents) {
				await this.autonomousAgentService.stopAgent(agent.id);
			}

			this._status.learningStatus = 'paused';
			this._status.geometricCommunicationStatus = 'inactive';
		}

		this._onStatusChanged.fire(this._status);
	}

	async getStatus(): Promise<AxiomaticStatus> {
		// Update dynamic status
		if (this._enabled) {
			try {
				const stats = await this.aiPersistence.getMemoryStats();
				this._status.memoryCount = stats.totalMemories;
				this._status.lastConsolidation = stats.consolidationStatus.lastConsolidation;
			} catch (error) {
				this._status.errors.push(`Status update failed: ${error}`);
			}
		}

		return { ...this._status };
	}

	getAIPersistence(): IAIPersistenceService {
		return this.aiPersistence;
	}

	getGeometricCommunication(): IGeometricCommunicationService {
		return this.geometricCommunication;
	}

	getAutonomousAgentService(): IAutonomousAgentService {
		return this.autonomousAgentService;
	}
}
