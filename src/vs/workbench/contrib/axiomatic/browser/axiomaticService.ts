/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IStorageService, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IAxiomaticService, IAIPersistenceService, IGeometricCommunicationService, IAutonomousAgentService } from '../common/axiomatic';

export const IAxiomaticService = createDecorator<IAxiomaticService>('axiomaticService');

export class AxiomaticService extends Disposable implements IAxiomaticService {
	declare readonly _serviceBrand: undefined;

	private _aiPersistenceService: IAIPersistenceService | undefined;
	private _geometricCommunicationService: IGeometricCommunicationService | undefined;
	private _autonomousAgentService: IAutonomousAgentService | undefined;
	private _initialized: boolean = false;

	constructor(
		@IStorageService private readonly storageService: IStorageService,
		@ILogService private readonly logService: ILogService,
		@IConfigurationService private readonly configurationService: IConfigurationService
	) {
		super();
	}

	async initialize(): Promise<void> {
		if (this._initialized) {
			return;
		}

		this.logService.info('AxiomaticService: Initializing...');

		try {
			// Check if Axiomatic is enabled
			const enabled = this.configurationService.getValue<boolean>('axiomatic.enabled');
			if (!enabled) {
				this.logService.info('AxiomaticService: Disabled by configuration');
				return;
			}

			// Initialize AI Persistence Service
			await this.initializeAIPersistenceService();

			// Initialize Geometric Communication Service
			await this.initializeGeometricCommunicationService();

			// Initialize Autonomous Agent Service
			await this.initializeAutonomousAgentService();

			this._initialized = true;
			this.logService.info('AxiomaticService: Initialized successfully');

		} catch (error) {
			this.logService.error('AxiomaticService: Failed to initialize', error);
			throw error;
		}
	}

	async shutdown(): Promise<void> {
		if (!this._initialized) {
			return;
		}

		this.logService.info('AxiomaticService: Shutting down...');

		try {
			// Shutdown services in reverse order
			if (this._autonomousAgentService) {
				await this._autonomousAgentService.shutdown?.();
			}

			if (this._geometricCommunicationService) {
				await this._geometricCommunicationService.shutdown?.();
			}

			if (this._aiPersistenceService) {
				await this._aiPersistenceService.shutdown?.();
			}

			this._initialized = false;
			this.logService.info('AxiomaticService: Shut down successfully');

		} catch (error) {
			this.logService.error('AxiomaticService: Error during shutdown', error);
		}
	}

	getAIPersistenceService(): IAIPersistenceService {
		if (!this._aiPersistenceService) {
			throw new Error('AxiomaticService: AI Persistence Service not initialized');
		}
		return this._aiPersistenceService;
	}

	getGeometricCommunicationService(): IGeometricCommunicationService {
		if (!this._geometricCommunicationService) {
			throw new Error('AxiomaticService: Geometric Communication Service not initialized');
		}
		return this._geometricCommunicationService;
	}

	getAutonomousAgentService(): IAutonomousAgentService {
		if (!this._autonomousAgentService) {
			throw new Error('AxiomaticService: Autonomous Agent Service not initialized');
		}
		return this._autonomousAgentService;
	}

	private async initializeAIPersistenceService(): Promise<void> {
		this.logService.info('AxiomaticService: Initializing AI Persistence Service...');

		// Get persistence mode from configuration
		const persistenceMode = this.configurationService.getValue<string>('axiomatic.persistenceMode', 'embedded');

		if (persistenceMode === 'docker') {
			// Initialize Docker-based AI Persistence
			const { DockerAIPersistence } = await import('../../../../extensions/axiomatic-autonomous-ide/src/persistence/dockerPersistence');
			this._aiPersistenceService = new DockerAIPersistence();
		} else {
			// Initialize embedded AI Persistence
			const { EmbeddedAIPersistence } = await import('../../../../extensions/axiomatic-autonomous-ide/src/persistence/embeddedPersistence');
			const storagePath = this.storageService.get('axiomatic.storagePath', StorageScope.GLOBAL) || 'axiomatic';
			this._aiPersistenceService = new EmbeddedAIPersistence(storagePath);
		}

		await this._aiPersistenceService.initialize();
		this.logService.info('AxiomaticService: AI Persistence Service initialized');
	}

	private async initializeGeometricCommunicationService(): Promise<void> {
		this.logService.info('AxiomaticService: Initializing Geometric Communication Service...');

		const { GeometricCommunicationService } = await import('../../../../extensions/axiomatic-autonomous-ide/src/geometric/geometricCommunication');
		this._geometricCommunicationService = new GeometricCommunicationService();

		await this._geometricCommunicationService.initialize();
		this.logService.info('AxiomaticService: Geometric Communication Service initialized');
	}

	private async initializeAutonomousAgentService(): Promise<void> {
		this.logService.info('AxiomaticService: Initializing Autonomous Agent Service...');

		const { AutonomousAgentService } = await import('../../../../extensions/axiomatic-autonomous-ide/src/agents/autonomousAgentService');
		this._autonomousAgentService = new AutonomousAgentService();

		await this._autonomousAgentService.initialize();
		this.logService.info('AxiomaticService: Autonomous Agent Service initialized');
	}

	// Public methods for status and health checks
	public isInitialized(): boolean {
		return this._initialized;
	}

	public async getStatus(): Promise<any> {
		if (!this._initialized) {
			return { status: 'not_initialized' };
		}

		const status = {
			status: 'initialized',
			services: {
				aiPersistence: !!this._aiPersistenceService,
				geometricCommunication: !!this._geometricCommunicationService,
				autonomousAgents: !!this._autonomousAgentService
			},
			configuration: {
				enabled: this.configurationService.getValue<boolean>('axiomatic.enabled'),
				autonomousMode: this.configurationService.getValue<boolean>('axiomatic.autonomousMode'),
				persistenceMode: this.configurationService.getValue<string>('axiomatic.persistenceMode'),
				geometricConsciousness: this.configurationService.getValue<boolean>('axiomatic.geometricConsciousness'),
				sacredMathematics: this.configurationService.getValue<boolean>('axiomatic.sacredMathematics')
			}
		};

		// Get detailed status from services if available
		if (this._aiPersistenceService) {
			try {
				status.services.aiPersistence = await this._aiPersistenceService.getStatus();
			} catch (error) {
				this.logService.warn('AxiomaticService: Failed to get AI Persistence status', error);
			}
		}

		return status;
	}

	public async getHealth(): Promise<any> {
		if (!this._initialized) {
			return { healthy: false, message: 'Service not initialized' };
		}

		const health = {
			healthy: true,
			components: [] as any[],
			message: 'All services healthy'
		};

		// Check AI Persistence health
		if (this._aiPersistenceService) {
			try {
				const aiHealth = await this._aiPersistenceService.getHealth();
				health.components.push({
					name: 'aiPersistence',
					status: aiHealth.healthy ? 'healthy' : 'unhealthy',
					details: aiHealth
				});
				if (!aiHealth.healthy) {
					health.healthy = false;
					health.message = 'AI Persistence service unhealthy';
				}
			} catch (error) {
				health.components.push({
					name: 'aiPersistence',
					status: 'error',
					error: error.message
				});
				health.healthy = false;
				health.message = 'AI Persistence service error';
			}
		}

		// Check other services health
		health.components.push({
			name: 'geometricCommunication',
			status: this._geometricCommunicationService ? 'healthy' : 'not_initialized'
		});

		health.components.push({
			name: 'autonomousAgents',
			status: this._autonomousAgentService ? 'healthy' : 'not_initialized'
		});

		return health;
	}
}
