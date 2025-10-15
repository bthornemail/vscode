/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { AxiomaticService } from '../axiomaticService';

export class ControlPanelProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;
	private axiomaticService: AxiomaticService;

	constructor(axiomaticService: AxiomaticService) {
		this.axiomaticService = axiomaticService;
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
		};

		webviewView.webview.html = this.getWebviewContent();

		// Handle messages from the webview
		webviewView.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'getStatus':
						const status = await this.getSystemStatus();
						webviewView.webview.postMessage({ command: 'status', data: status });
						break;
					case 'getHealth':
						const health = await this.getSystemHealth();
						webviewView.webview.postMessage({ command: 'health', data: health });
						break;
					case 'getMemories':
						const memories = await this.getMemories(message.query);
						webviewView.webview.postMessage({ command: 'memories', data: memories });
						break;
					case 'consolidateMemories':
						await this.consolidateMemories();
						webviewView.webview.postMessage({ command: 'consolidated', data: { success: true } });
						break;
					case 'exportKnowledge':
						await this.exportKnowledge();
						webviewView.webview.postMessage({ command: 'exported', data: { success: true } });
						break;
					case 'updateConfiguration':
						await this.updateConfiguration(message.config);
						webviewView.webview.postMessage({ command: 'configUpdated', data: { success: true } });
						break;
				}
			},
			undefined,
			[]
		);

		// Send initial data
		this.sendInitialData();
	}


	private async sendInitialData(): Promise<void> {
		if (!this._view) return;

		try {
			const [status, health, memories] = await Promise.all([
				this.getSystemStatus(),
				this.getSystemHealth(),
				this.getMemories({ limit: 10 })
			]);

			this._view.webview.postMessage({
				command: 'initialData',
				data: { status, health, memories }
			});
		} catch (error) {
			console.error('Failed to send initial data:', error);
		}
	}

	private async getSystemStatus(): Promise<any> {
		try {
			return await this.axiomaticService.getStatus();
		} catch (error) {
			return { status: 'error', error: error.message };
		}
	}

	private async getSystemHealth(): Promise<any> {
		try {
			return await this.axiomaticService.getHealth();
		} catch (error) {
			return { healthy: false, error: error.message };
		}
	}

	private async getMemories(query: any): Promise<any[]> {
		try {
			return await this.axiomaticService.getAIPersistence().getMemories(query);
		} catch (error) {
			return [];
		}
	}

	private async consolidateMemories(): Promise<void> {
		// Trigger memory consolidation
		await vscode.commands.executeCommand('axiomatic.consolidateMemories');
	}

	private async exportKnowledge(): Promise<void> {
		// Export knowledge base
		await vscode.commands.executeCommand('axiomatic.exportKnowledgeBase');
	}

	private async updateConfiguration(config: any): Promise<void> {
		const configuration = vscode.workspace.getConfiguration('axiomatic');
		for (const [key, value] of Object.entries(config)) {
			await configuration.update(key, value, vscode.ConfigurationTarget.Global);
		}
	}

	private getWebviewContent(): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Axiomatic Control Panel</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: var(--vscode-panel-background);
            border-radius: 8px;
        }
        
        .header h1 {
            margin: 0;
            color: var(--vscode-textLink-foreground);
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .status-card {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
        }
        
        .status-card h3 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-healthy { background-color: #4caf50; }
        .status-warning { background-color: #ff9800; }
        .status-error { background-color: #f44336; }
        
        .config-section {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .config-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
        }
        
        .config-item label {
            font-weight: 500;
        }
        
        .config-item input[type="checkbox"] {
            transform: scale(1.2);
        }
        
        .config-item select {
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            border: 1px solid var(--vscode-dropdown-border);
            padding: 4px 8px;
            border-radius: 4px;
        }
        
        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .button:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            cursor: not-allowed;
        }
        
        .memories-section {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
        }
        
        .memory-item {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .memory-type {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        
        .memory-content {
            margin-top: 8px;
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
        
        .loading {
            text-align: center;
            color: var(--vscode-descriptionForeground);
        }
        
        .error {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Axiomatic Autonomous IDE</h1>
            <p>Control Panel for AI Persistence, Learning, and Autonomous Agents</p>
        </div>
        
        <div class="status-grid">
            <div class="status-card">
                <h3>System Status</h3>
                <div id="systemStatus">
                    <div class="loading">Loading...</div>
                </div>
            </div>
            
            <div class="status-card">
                <h3>Health Check</h3>
                <div id="healthStatus">
                    <div class="loading">Loading...</div>
                </div>
            </div>
            
            <div class="status-card">
                <h3>Memory Statistics</h3>
                <div id="memoryStats">
                    <div class="loading">Loading...</div>
                </div>
            </div>
        </div>
        
        <div class="config-section">
            <h3>Configuration</h3>
            <div class="config-item">
                <label for="enabled">Enable Axiomatic</label>
                <input type="checkbox" id="enabled" onchange="updateConfig()">
            </div>
            <div class="config-item">
                <label for="autonomousMode">Autonomous Mode</label>
                <input type="checkbox" id="autonomousMode" onchange="updateConfig()">
            </div>
            <div class="config-item">
                <label for="learningRate">Learning Rate</label>
                <select id="learningRate" onchange="updateConfig()">
                    <option value="adaptive">Adaptive</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div class="config-item">
                <label for="persistenceMode">Persistence Mode</label>
                <select id="persistenceMode" onchange="updateConfig()">
                    <option value="embedded">Embedded</option>
                    <option value="docker">Docker</option>
                </select>
            </div>
            <div class="config-item">
                <label for="geometricConsciousness">Geometric Consciousness</label>
                <input type="checkbox" id="geometricConsciousness" onchange="updateConfig()">
            </div>
            <div class="config-item">
                <label for="sacredMathematics">Sacred Mathematics</label>
                <input type="checkbox" id="sacredMathematics" onchange="updateConfig()">
            </div>
        </div>
        
        <div class="config-section">
            <h3>Actions</h3>
            <button class="button" onclick="consolidateMemories()">Consolidate Memories</button>
            <button class="button" onclick="exportKnowledge()">Export Knowledge Base</button>
            <button class="button" onclick="refreshData()">Refresh Data</button>
        </div>
        
        <div class="memories-section">
            <h3>Recent Memories</h3>
            <div id="memoriesList">
                <div class="loading">Loading...</div>
            </div>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'initialData':
                    updateUI(message.data);
                    break;
                case 'status':
                    updateSystemStatus(message.data);
                    break;
                case 'health':
                    updateHealthStatus(message.data);
                    break;
                case 'memories':
                    updateMemoriesList(message.data);
                    break;
                case 'consolidated':
                    if (message.data.success) {
                        showMessage('Memories consolidated successfully', 'success');
                    }
                    break;
                case 'exported':
                    if (message.data.success) {
                        showMessage('Knowledge base exported successfully', 'success');
                    }
                    break;
                case 'configUpdated':
                    if (message.data.success) {
                        showMessage('Configuration updated successfully', 'success');
                    }
                    break;
            }
        });
        
        function updateUI(data) {
            updateSystemStatus(data.status);
            updateHealthStatus(data.health);
            updateMemoriesList(data.memories);
            updateConfiguration(data.config);
        }
        
        function updateSystemStatus(status) {
            const statusDiv = document.getElementById('systemStatus');
            if (status.status === 'error') {
                statusDiv.innerHTML = \`<div class="error">Error: \${status.error}</div>\`;
                return;
            }
            
            const statusIndicator = status.status === 'initialized' ? 'status-healthy' : 'status-warning';
            statusDiv.innerHTML = \`
                <div>
                    <span class="status-indicator \${statusIndicator}"></span>
                    <strong>Status:</strong> \${status.status}
                </div>
                <div><strong>Mode:</strong> \${status.configuration?.persistenceMode || 'unknown'}</div>
                <div><strong>Autonomous:</strong> \${status.configuration?.autonomousMode ? 'Enabled' : 'Disabled'}</div>
            \`;
        }
        
        function updateHealthStatus(health) {
            const healthDiv = document.getElementById('healthStatus');
            if (health.error) {
                healthDiv.innerHTML = \`<div class="error">Error: \${health.error}</div>\`;
                return;
            }
            
            const healthIndicator = health.healthy ? 'status-healthy' : 'status-error';
            healthDiv.innerHTML = \`
                <div>
                    <span class="status-indicator \${healthIndicator}"></span>
                    <strong>Health:</strong> \${health.healthy ? 'Healthy' : 'Unhealthy'}
                </div>
                <div><strong>Message:</strong> \${health.message}</div>
            \`;
        }
        
        function updateMemoriesList(memories) {
            const memoriesDiv = document.getElementById('memoriesList');
            if (!memories || memories.length === 0) {
                memoriesDiv.innerHTML = '<div class="loading">No memories found</div>';
                return;
            }
            
            const memoriesHtml = memories.map(memory => \`
                <div class="memory-item">
                    <div class="memory-type">\${memory.type || 'Unknown'}</div>
                    <div class="memory-content">\${JSON.stringify(memory.content, null, 2)}</div>
                </div>
            \`).join('');
            
            memoriesDiv.innerHTML = memoriesHtml;
        }
        
        function updateConfiguration(config) {
            if (!config) return;
            
            document.getElementById('enabled').checked = config.enabled || false;
            document.getElementById('autonomousMode').checked = config.autonomousMode || false;
            document.getElementById('learningRate').value = config.learningRate || 'adaptive';
            document.getElementById('persistenceMode').value = config.persistenceMode || 'embedded';
            document.getElementById('geometricConsciousness').checked = config.geometricConsciousness || false;
            document.getElementById('sacredMathematics').checked = config.sacredMathematics || false;
        }
        
        function updateConfig() {
            const config = {
                enabled: document.getElementById('enabled').checked,
                autonomousMode: document.getElementById('autonomousMode').checked,
                learningRate: document.getElementById('learningRate').value,
                persistenceMode: document.getElementById('persistenceMode').value,
                geometricConsciousness: document.getElementById('geometricConsciousness').checked,
                sacredMathematics: document.getElementById('sacredMathematics').checked
            };
            
            vscode.postMessage({
                command: 'updateConfiguration',
                config: config
            });
        }
        
        function consolidateMemories() {
            vscode.postMessage({
                command: 'consolidateMemories'
            });
        }
        
        function exportKnowledge() {
            vscode.postMessage({
                command: 'exportKnowledge'
            });
        }
        
        function refreshData() {
            vscode.postMessage({
                command: 'getStatus'
            });
            vscode.postMessage({
                command: 'getHealth'
            });
            vscode.postMessage({
                command: 'getMemories',
                query: { limit: 10 }
            });
        }
        
        function showMessage(message, type) {
            // Simple message display - could be enhanced with a proper notification system
            console.log(\`\${type.toUpperCase()}: \${message}\`);
        }
        
        // Request initial data
        vscode.postMessage({
            command: 'getStatus'
        });
    </script>
</body>
</html>`;
	}
}
