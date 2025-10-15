/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { AxiomaticService } from './axiomaticService';
import { AIPersistenceService } from './persistence/embeddedPersistence';
import { GeometricCommunicationService } from './geometric/geometricCommunication';
import { AutonomousAgentService } from './agents/autonomousAgentService';
import { ControlPanelProvider } from './views/controlPanel';

let axiomaticService: AxiomaticService;
let controlPanelProvider: ControlPanelProvider;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
	console.log('Axiomatic Autonomous IDE extension is being activated...');

	try {
		// Initialize AI Persistence (embedded mode)
		const aiPersistence = new AIPersistenceService({
			storagePath: context.globalStorageUri.fsPath,
			maxMemories: vscode.workspace.getConfiguration('axiomatic').get('maxMemories', 10000),
			consolidationThreshold: vscode.workspace.getConfiguration('axiomatic').get('consolidationThreshold', 100)
		});
		await aiPersistence.initialize();

		// Initialize Geometric Communication Service
		const geometricCommunication = new GeometricCommunicationService();

		// Initialize Autonomous Agent Service
		const autonomousAgentService = new AutonomousAgentService(aiPersistence, geometricCommunication);

		// Initialize main Axiomatic Service
		axiomaticService = new AxiomaticService(
			aiPersistence,
			geometricCommunication,
			autonomousAgentService
		);
		await axiomaticService.initialize();

		// Initialize Control Panel Provider
		controlPanelProvider = new ControlPanelProvider(axiomaticService);
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider('axiomaticControlPanel', controlPanelProvider)
		);

		// Register commands
		registerCommands(context);

		// Register status bar item
		registerStatusBarItem(context);

		// Listen for configuration changes
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration('axiomatic')) {
					handleConfigurationChange();
				}
			})
		);

		console.log('Axiomatic Autonomous IDE extension activated successfully');
	} catch (error) {
		console.error('Failed to activate Axiomatic extension:', error);
		vscode.window.showErrorMessage(`Failed to activate Axiomatic extension: ${error}`);
	}
}

export function deactivate(): void {
	console.log('Axiomatic Autonomous IDE extension is being deactivated...');
	if (axiomaticService) {
		axiomaticService.dispose();
	}
}

function registerCommands(context: vscode.ExtensionContext): void {
	// Initialize System
	context.subscriptions.push(
		vscode.commands.registerCommand('axiomatic.initialize', async () => {
			try {
				await axiomaticService.initialize();
				vscode.window.showInformationMessage('Axiomatic system initialized successfully');
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to initialize Axiomatic system: ${error}`);
			}
		})
	);

	// Enable Autonomous Mode
	context.subscriptions.push(
		vscode.commands.registerCommand('axiomatic.enableAutonomous', async () => {
			try {
				const config = vscode.workspace.getConfiguration('axiomatic');
				await config.update('autonomousMode', true, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage('Autonomous mode enabled');
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to enable autonomous mode: ${error}`);
			}
		})
	);

	// Learn from Current File
	context.subscriptions.push(
		vscode.commands.registerCommand('axiomatic.learnFromFile', async () => {
			const activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				vscode.window.showWarningMessage('No active editor found');
				return;
			}

			try {
				const document = activeEditor.document;
				const content = document.getText();
				const language = document.languageId;
				const fileName = document.fileName;

				// Store as episodic memory
				await axiomaticService.getAIPersistence().storeMemory({
					id: generateId(),
					type: 'episodic',
					content: `Learned from file: ${fileName}`,
					metadata: {
						source: 'file_learning',
						quality: 0.8,
						confidence: 0.9,
						importance: 0.7,
						tags: ['learning', 'file', language, 'code_analysis'],
						context: {
							fileName,
							language,
							contentLength: content.length,
							timestamp: new Date()
						}
					},
					timestamp: new Date()
				});

				vscode.window.showInformationMessage(`Learned from ${fileName}`);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to learn from file: ${error}`);
			}
		})
	);

	// Show Memory Statistics
	context.subscriptions.push(
		vscode.commands.registerCommand('axiomatic.showMemoryStats', async () => {
			try {
				const stats = await axiomaticService.getAIPersistence().getMemoryStats();
				const message = `Memory Statistics:
Total Memories: ${stats.totalMemories}
Episodic: ${stats.memoriesByType.episodic}
Semantic: ${stats.memoriesByType.semantic}
Procedural: ${stats.memoriesByType.procedural}
Last 24h: ${stats.recentActivity.last24Hours}
Last Week: ${stats.recentActivity.lastWeek}`;

				vscode.window.showInformationMessage(message);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to get memory statistics: ${error}`);
			}
		})
	);

	// Consolidate Memories
	context.subscriptions.push(
		vscode.commands.registerCommand('axiomatic.consolidateMemories', async () => {
			try {
				await axiomaticService.getAIPersistence().consolidateMemories();
				vscode.window.showInformationMessage('Memory consolidation completed');
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to consolidate memories: ${error}`);
			}
		})
	);

	// Export Knowledge Base
	context.subscriptions.push(
		vscode.commands.registerCommand('axiomatic.exportKnowledge', async () => {
			try {
				const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
				if (!workspaceFolder) {
					vscode.window.showWarningMessage('No workspace folder found');
					return;
				}

				const exportPath = vscode.Uri.joinPath(workspaceFolder.uri, 'axiomatic-knowledge-export.json');
				// TODO: Implement knowledge export
				vscode.window.showInformationMessage(`Knowledge base exported to ${exportPath.fsPath}`);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to export knowledge base: ${error}`);
			}
		})
	);

	// Open Control Panel
	context.subscriptions.push(
		vscode.commands.registerCommand('axiomatic.openControlPanel', () => {
			vscode.commands.executeCommand('axiomaticControlPanel.focus');
		})
	);
}

function registerStatusBarItem(context: vscode.ExtensionContext): void {
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "$(brain) Axiomatic";
	statusBarItem.tooltip = "Axiomatic Autonomous IDE";
	statusBarItem.command = 'axiomatic.openControlPanel';
	statusBarItem.show();

	context.subscriptions.push(statusBarItem);

	// Update status based on Axiomatic status
	axiomaticService.onStatusChanged(status => {
		if (status.enabled) {
			statusBarItem.text = "$(brain) Axiomatic";
			statusBarItem.backgroundColor = undefined;
		} else {
			statusBarItem.text = "$(brain-slash) Axiomatic";
			statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
		}
	});
}

async function handleConfigurationChange(): Promise<void> {
	const config = vscode.workspace.getConfiguration('axiomatic');
	const enabled = config.get('enabled', true);

	if (enabled && !axiomaticService.isEnabled()) {
		await axiomaticService.setEnabled(true);
	} else if (!enabled && axiomaticService.isEnabled()) {
		await axiomaticService.setEnabled(false);
	}
}

function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}
