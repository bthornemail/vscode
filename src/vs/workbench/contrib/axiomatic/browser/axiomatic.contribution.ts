/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IWorkbenchContribution, IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { LifecyclePhase } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IAxiomaticService, AxiomaticService } from './axiomaticService';
import { AxiomaticStatusBarItem } from './axiomaticStatusBarItem';

// Register Axiomatic service as singleton
registerSingleton(IAxiomaticService, AxiomaticService, true);

// Register workbench contributions
class AxiomaticWorkbenchContribution implements IWorkbenchContribution {
	constructor(
		@IAxiomaticService axiomaticService: IAxiomaticService
	) {
		// Initialize Axiomatic service when workbench starts
		axiomaticService.initialize().catch(error => {
			console.error('Failed to initialize Axiomatic service:', error);
		});
	}
}

// Register contributions
Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
	AxiomaticWorkbenchContribution,
	LifecyclePhase.Restored
);

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
	AxiomaticStatusBarItem,
	LifecyclePhase.Restored
);
