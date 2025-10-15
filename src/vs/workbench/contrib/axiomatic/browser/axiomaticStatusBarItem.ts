/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'vs/base/common/lifecycle';
import { IStatusbarService, StatusbarAlignment, IStatusbarEntryAccessor } from 'vs/workbench/services/statusbar/browser/statusbar';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IAxiomaticService } from './axiomaticService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class AxiomaticStatusBarItem extends Disposable implements IWorkbenchContribution {
	private statusBarEntry: IStatusbarEntryAccessor | undefined;
	private updateTimer: NodeJS.Timeout | undefined;

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ILogService private readonly logService: ILogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {
		super();
		this.initialize();
	}

	private async initialize(): Promise<void> {
		// Check if Axiomatic is enabled
		const enabled = this.configurationService.getValue<boolean>('axiomatic.enabled');
		if (!enabled) {
			return;
		}

		// Create status bar entry
		this.createStatusBarEntry();

		// Start periodic updates
		this.startPeriodicUpdates();

		// Listen for configuration changes
		this._register(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('axiomatic.enabled')) {
				const newEnabled = this.configurationService.getValue<boolean>('axiomatic.enabled');
				if (newEnabled && !this.statusBarEntry) {
					this.createStatusBarEntry();
					this.startPeriodicUpdates();
				} else if (!newEnabled && this.statusBarEntry) {
					this.disposeStatusBarEntry();
				}
			}
		}));
	}

	private createStatusBarEntry(): void {
		this.statusBarEntry = this.statusbarService.addEntry({
			text: '$(brain) Axiomatic',
			tooltip: 'Axiomatic Autonomous IDE - Click to open control panel',
			command: 'axiomatic.openControlPanel',
			ariaLabel: 'Axiomatic Autonomous IDE Status'
		}, 'axiomatic.status', StatusbarAlignment.RIGHT, 100);
	}

	private startPeriodicUpdates(): void {
		// Update status every 30 seconds
		this.updateTimer = setInterval(() => {
			this.updateStatus();
		}, 30000);

		// Initial update
		this.updateStatus();
	}

	private async updateStatus(): Promise<void> {
		if (!this.statusBarEntry) {
			return;
		}

		try {
			// Get Axiomatic service
			const axiomaticService = this.instantiationService.invokeFunction(accessor =>
				accessor.get(IAxiomaticService)
			);

			if (!axiomaticService) {
				return;
			}

			// Get status and health
			const [status, health] = await Promise.all([
				axiomaticService.getStatus(),
				axiomaticService.getHealth()
			]);

			// Update status bar based on health
			let text = '$(brain) Axiomatic';
			let tooltip = 'Axiomatic Autonomous IDE';

			if (health.healthy) {
				text = '$(brain) Axiomatic';
				tooltip = 'Axiomatic Autonomous IDE - All systems healthy';
			} else {
				text = '$(brain) Axiomatic $(warning)';
				tooltip = `Axiomatic Autonomous IDE - Issues detected: ${health.message}`;
			}

			// Add autonomous mode indicator
			if (status.configuration?.autonomousMode) {
				text += ' $(gear)';
				tooltip += ' - Autonomous mode enabled';
			}

			// Add learning indicator
			if (status.services?.aiPersistence?.status === 'running') {
				text += ' $(sync)';
				tooltip += ' - Learning active';
			}

			// Update the status bar entry
			this.statusBarEntry.update({
				text,
				tooltip,
				command: 'axiomatic.openControlPanel',
				ariaLabel: tooltip
			});

		} catch (error) {
			this.logService.warn('AxiomaticStatusBarItem: Failed to update status', error);

			// Show error state
			if (this.statusBarEntry) {
				this.statusBarEntry.update({
					text: '$(brain) Axiomatic $(error)',
					tooltip: 'Axiomatic Autonomous IDE - Error',
					command: 'axiomatic.openControlPanel',
					ariaLabel: 'Axiomatic Autonomous IDE - Error'
				});
			}
		}
	}

	private disposeStatusBarEntry(): void {
		if (this.statusBarEntry) {
			this.statusBarEntry.dispose();
			this.statusBarEntry = undefined;
		}

		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = undefined;
		}
	}

	dispose(): void {
		this.disposeStatusBarEntry();
		super.dispose();
	}
}
