/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IWindowService } from 'vs/workbench/services/window/common/windowService';
import { IAxiomaticService } from './axiomaticService';
import { localize } from 'vs/nls';

// Axiomatic: Initialize System
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.initializeSystem',
			title: localize('axiomatic.initializeSystem', 'Initialize Axiomatic System'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const commandService = accessor.get(ICommandService);
		const instantiationService = accessor.get(IInstantiationService);
		const logService = accessor.get(ILogService);

		try {
			const axiomaticService = instantiationService.invokeFunction(accessor =>
				accessor.get(IAxiomaticService)
			);

			if (axiomaticService) {
				await axiomaticService.initialize();
				logService.info('Axiomatic system initialized successfully');
			}
		} catch (error) {
			logService.error('Failed to initialize Axiomatic system:', error);
		}
	}
});

// Axiomatic: Open Control Panel
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.openControlPanel',
			title: localize('axiomatic.openControlPanel', 'Open Axiomatic Control Panel'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const commandService = accessor.get(ICommandService);

		// Open the Axiomatic control panel webview
		await commandService.executeCommand('workbench.view.extension.axiomatic');
	}
});

// Axiomatic: Enable Autonomous Mode
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.enableAutonomousMode',
			title: localize('axiomatic.enableAutonomousMode', 'Enable Autonomous Mode'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const configurationService = accessor.get(IConfigurationService);
		const logService = accessor.get(ILogService);

		try {
			await configurationService.updateValue('axiomatic.autonomousMode', true);
			logService.info('Autonomous mode enabled');
		} catch (error) {
			logService.error('Failed to enable autonomous mode:', error);
		}
	}
});

// Axiomatic: Disable Autonomous Mode
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.disableAutonomousMode',
			title: localize('axiomatic.disableAutonomousMode', 'Disable Autonomous Mode'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const configurationService = accessor.get(IConfigurationService);
		const logService = accessor.get(ILogService);

		try {
			await configurationService.updateValue('axiomatic.autonomousMode', false);
			logService.info('Autonomous mode disabled');
		} catch (error) {
			logService.error('Failed to disable autonomous mode:', error);
		}
	}
});

// Axiomatic: Learn from Current File
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.learnFromCurrentFile',
			title: localize('axiomatic.learnFromCurrentFile', 'Learn from Current File'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const instantiationService = accessor.get(IInstantiationService);
		const logService = accessor.get(ILogService);

		try {
			const axiomaticService = instantiationService.invokeFunction(accessor =>
				accessor.get(IAxiomaticService)
			);

			if (axiomaticService) {
				// Trigger learning from current file
				await commandService.executeCommand('axiomatic.triggerLearning', 'current_file');
				logService.info('Learning triggered from current file');
			}
		} catch (error) {
			logService.error('Failed to learn from current file:', error);
		}
	}
});

// Axiomatic: Show Memory Statistics
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.showMemoryStatistics',
			title: localize('axiomatic.showMemoryStatistics', 'Show Memory Statistics'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const instantiationService = accessor.get(IInstantiationService);
		const logService = accessor.get(ILogService);

		try {
			const axiomaticService = instantiationService.invokeFunction(accessor =>
				accessor.get(IAxiomaticService)
			);

			if (axiomaticService) {
				const status = await axiomaticService.getStatus();
				logService.info('Axiomatic Memory Statistics:', status);
			}
		} catch (error) {
			logService.error('Failed to get memory statistics:', error);
		}
	}
});

// Axiomatic: Consolidate Memories
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.consolidateMemories',
			title: localize('axiomatic.consolidateMemories', 'Consolidate Memories'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const instantiationService = accessor.get(IInstantiationService);
		const logService = accessor.get(ILogService);

		try {
			const axiomaticService = instantiationService.invokeFunction(accessor =>
				accessor.get(IAxiomaticService)
			);

			if (axiomaticService) {
				// Trigger memory consolidation
				await commandService.executeCommand('axiomatic.triggerConsolidation');
				logService.info('Memory consolidation triggered');
			}
		} catch (error) {
			logService.error('Failed to consolidate memories:', error);
		}
	}
});

// Axiomatic: Export Knowledge Base
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.exportKnowledgeBase',
			title: localize('axiomatic.exportKnowledgeBase', 'Export Knowledge Base'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const instantiationService = accessor.get(IInstantiationService);
		const logService = accessor.get(ILogService);

		try {
			const axiomaticService = instantiationService.invokeFunction(accessor =>
				accessor.get(IAxiomaticService)
			);

			if (axiomaticService) {
				// Export knowledge base
				await commandService.executeCommand('axiomatic.exportKnowledge');
				logService.info('Knowledge base export triggered');
			}
		} catch (error) {
			logService.error('Failed to export knowledge base:', error);
		}
	}
});

// Axiomatic: Toggle Geometric Consciousness
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.toggleGeometricConsciousness',
			title: localize('axiomatic.toggleGeometricConsciousness', 'Toggle Geometric Consciousness'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const configurationService = accessor.get(IConfigurationService);
		const logService = accessor.get(ILogService);

		try {
			const currentValue = configurationService.getValue<boolean>('axiomatic.geometricConsciousness');
			await configurationService.updateValue('axiomatic.geometricConsciousness', !currentValue);
			logService.info(`Geometric consciousness ${!currentValue ? 'enabled' : 'disabled'}`);
		} catch (error) {
			logService.error('Failed to toggle geometric consciousness:', error);
		}
	}
});

// Axiomatic: Toggle Sacred Mathematics
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'axiomatic.toggleSacredMathematics',
			title: localize('axiomatic.toggleSacredMathematics', 'Toggle Sacred Mathematics'),
			category: localize('axiomatic.category', 'Axiomatic'),
			f1: true
		});
	}

	async run(accessor: any): Promise<void> {
		const configurationService = accessor.get(IConfigurationService);
		const logService = accessor.get(ILogService);

		try {
			const currentValue = configurationService.getValue<boolean>('axiomatic.sacredMathematics');
			await configurationService.updateValue('axiomatic.sacredMathematics', !currentValue);
			logService.info(`Sacred mathematics ${!currentValue ? 'enabled' : 'disabled'}`);
		} catch (error) {
			logService.error('Failed to toggle sacred mathematics:', error);
		}
	}
});
