/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IAIPersistenceService } from '../../../src/vs/workbench/contrib/axiomatic/common/axiomatic';

export interface LearningEvent {
	type: 'code_edit' | 'build_success' | 'build_failure' | 'debug_session' | 'refactoring' | 'pattern_detected';
	content: any;
	timestamp: Date;
	context: {
		fileName?: string;
		language?: string;
		project?: string;
		userAction?: string;
	};
}

export interface LearningPattern {
	id: string;
	type: string;
	confidence: number;
	frequency: number;
	lastSeen: Date;
	examples: string[];
	context: any;
}

export class LearningManager {
	private aiPersistence: IAIPersistenceService;
	private learningEvents: LearningEvent[] = [];
	private patterns: Map<string, LearningPattern> = new Map();
	private consolidationTimer: NodeJS.Timeout | undefined;

	constructor(aiPersistence: IAIPersistenceService) {
		this.aiPersistence = aiPersistence;
		this.setupEventListeners();
		this.startConsolidationTimer();
	}

	private setupEventListeners(): void {
		// Listen to VSCode events for learning triggers
		vscode.workspace.onDidChangeTextDocument((event) => {
			this.handleCodeEdit(event);
		});

		vscode.tasks.onDidStartTask((event) => {
			this.handleTaskStart(event);
		});

		vscode.tasks.onDidEndTask((event) => {
			this.handleTaskEnd(event);
		});

		vscode.debug.onDidStartDebugSession((session) => {
			this.handleDebugStart(session);
		});

		vscode.debug.onDidTerminateDebugSession((session) => {
			this.handleDebugEnd(session);
		});

		// Listen for file saves (potential build triggers)
		vscode.workspace.onDidSaveTextDocument((document) => {
			this.handleFileSave(document);
		});
	}

	private async handleCodeEdit(event: vscode.TextDocumentChangeEvent): Promise<void> {
		const learningEvent: LearningEvent = {
			type: 'code_edit',
			content: {
				changes: event.contentChanges.map(change => ({
					range: change.range,
					text: change.text,
					rangeLength: change.rangeLength
				})),
				document: {
					fileName: event.document.fileName,
					language: event.document.languageId,
					lineCount: event.document.lineCount
				}
			},
			timestamp: new Date(),
			context: {
				fileName: event.document.fileName,
				language: event.document.languageId,
				userAction: 'edit'
			}
		};

		await this.processLearningEvent(learningEvent);
	}

	private async handleTaskStart(event: vscode.TaskStartEvent): Promise<void> {
		const learningEvent: LearningEvent = {
			type: 'build_success', // We'll update this when task ends
			content: {
				task: {
					name: event.execution.task.name,
					source: event.execution.task.source,
					type: event.execution.task.definition.type
				}
			},
			timestamp: new Date(),
			context: {
				userAction: 'task_start'
			}
		};

		await this.processLearningEvent(learningEvent);
	}

	private async handleTaskEnd(event: vscode.TaskEndEvent): Promise<void> {
		const learningEvent: LearningEvent = {
			type: event.exitCode === 0 ? 'build_success' : 'build_failure',
			content: {
				task: {
					name: event.execution.task.name,
					source: event.execution.task.source,
					type: event.execution.task.definition.type
				},
				exitCode: event.exitCode,
				duration: event.execution.task.source
			},
			timestamp: new Date(),
			context: {
				userAction: 'task_end'
			}
		};

		await this.processLearningEvent(learningEvent);
	}

	private async handleDebugStart(session: vscode.DebugSession): Promise<void> {
		const learningEvent: LearningEvent = {
			type: 'debug_session',
			content: {
				session: {
					name: session.name,
					type: session.type,
					configuration: session.configuration
				}
			},
			timestamp: new Date(),
			context: {
				userAction: 'debug_start'
			}
		};

		await this.processLearningEvent(learningEvent);
	}

	private async handleDebugEnd(session: vscode.DebugSession): Promise<void> {
		const learningEvent: LearningEvent = {
			type: 'debug_session',
			content: {
				session: {
					name: session.name,
					type: session.type,
					configuration: session.configuration
				},
				ended: true
			},
			timestamp: new Date(),
			context: {
				userAction: 'debug_end'
			}
		};

		await this.processLearningEvent(learningEvent);
	}

	private async handleFileSave(document: vscode.TextDocument): Promise<void> {
		// File save might indicate a build or compilation
		const learningEvent: LearningEvent = {
			type: 'code_edit',
			content: {
				action: 'save',
				document: {
					fileName: document.fileName,
					language: document.languageId,
					lineCount: document.lineCount
				}
			},
			timestamp: new Date(),
			context: {
				fileName: document.fileName,
				language: document.languageId,
				userAction: 'save'
			}
		};

		await this.processLearningEvent(learningEvent);
	}

	private async processLearningEvent(event: LearningEvent): Promise<void> {
		// Store the learning event
		this.learningEvents.push(event);

		// Store as episodic memory in AI Persistence
		await this.aiPersistence.storeMemory({
			identityId: 'main-agent',
			type: 'episodic',
			content: {
				eventType: event.type,
				content: event.content,
				context: event.context,
				timestamp: event.timestamp.toISOString()
			}
		});

		// Detect patterns in the event
		const detectedPatterns = this.detectPatterns(event);
		for (const pattern of detectedPatterns) {
			await this.updatePattern(pattern);
		}

		// Learn from the event
		await this.learnFromEvent(event);
	}

	private detectPatterns(event: LearningEvent): LearningPattern[] {
		const patterns: LearningPattern[] = [];

		switch (event.type) {
			case 'code_edit':
				patterns.push(...this.detectCodePatterns(event));
				break;
			case 'build_success':
				patterns.push(...this.detectBuildPatterns(event));
				break;
			case 'build_failure':
				patterns.push(...this.detectFailurePatterns(event));
				break;
			case 'debug_session':
				patterns.push(...this.detectDebugPatterns(event));
				break;
		}

		return patterns;
	}

	private detectCodePatterns(event: LearningEvent): LearningPattern[] {
		const patterns: LearningPattern[] = [];
		const content = event.content;

		if (content.changes) {
			for (const change of content.changes) {
				// Detect function patterns
				if (change.text.includes('function') || change.text.includes('=>')) {
					patterns.push({
						id: `function_pattern_${Date.now()}`,
						type: 'function_declaration',
						confidence: 0.8,
						frequency: 1,
						lastSeen: new Date(),
						examples: [change.text],
						context: { language: event.context.language }
					});
				}

				// Detect class patterns
				if (change.text.includes('class ')) {
					patterns.push({
						id: `class_pattern_${Date.now()}`,
						type: 'class_definition',
						confidence: 0.9,
						frequency: 1,
						lastSeen: new Date(),
						examples: [change.text],
						context: { language: event.context.language }
					});
				}

				// Detect import patterns
				if (change.text.includes('import ') || change.text.includes('require(')) {
					patterns.push({
						id: `import_pattern_${Date.now()}`,
						type: 'module_import',
						confidence: 0.95,
						frequency: 1,
						lastSeen: new Date(),
						examples: [change.text],
						context: { language: event.context.language }
					});
				}

				// Detect variable patterns
				if (change.text.match(/\b(const|let|var)\s+\w+/)) {
					patterns.push({
						id: `variable_pattern_${Date.now()}`,
						type: 'variable_declaration',
						confidence: 0.7,
						frequency: 1,
						lastSeen: new Date(),
						examples: [change.text],
						context: { language: event.context.language }
					});
				}
			}
		}

		return patterns;
	}

	private detectBuildPatterns(event: LearningEvent): LearningPattern[] {
		const patterns: LearningPattern[] = [];
		const content = event.content;

		if (content.task) {
			patterns.push({
				id: `build_success_${content.task.type}_${Date.now()}`,
				type: 'build_success',
				confidence: 1.0,
				frequency: 1,
				lastSeen: new Date(),
				examples: [content.task.name],
				context: { 
					taskType: content.task.type,
					taskSource: content.task.source
				}
			});
		}

		return patterns;
	}

	private detectFailurePatterns(event: LearningEvent): LearningPattern[] {
		const patterns: LearningPattern[] = [];
		const content = event.content;

		if (content.task) {
			patterns.push({
				id: `build_failure_${content.task.type}_${Date.now()}`,
				type: 'build_failure',
				confidence: 1.0,
				frequency: 1,
				lastSeen: new Date(),
				examples: [content.task.name],
				context: { 
					taskType: content.task.type,
					exitCode: content.exitCode
				}
			});
		}

		return patterns;
	}

	private detectDebugPatterns(event: LearningEvent): LearningPattern[] {
		const patterns: LearningPattern[] = [];
		const content = event.content;

		if (content.session) {
			patterns.push({
				id: `debug_${content.session.type}_${Date.now()}`,
				type: 'debug_session',
				confidence: 0.9,
				frequency: 1,
				lastSeen: new Date(),
				examples: [content.session.name],
				context: { 
					debugType: content.session.type,
					configuration: content.session.configuration
				}
			});
		}

		return patterns;
	}

	private async updatePattern(pattern: LearningPattern): Promise<void> {
		const existingPattern = this.patterns.get(pattern.type);
		
		if (existingPattern) {
			// Update existing pattern
			existingPattern.frequency++;
			existingPattern.lastSeen = new Date();
			existingPattern.examples.push(...pattern.examples);
			
			// Update confidence based on frequency
			existingPattern.confidence = Math.min(1.0, existingPattern.confidence + 0.1);
		} else {
			// Add new pattern
			this.patterns.set(pattern.type, pattern);
		}

		// Store pattern as semantic memory
		await this.aiPersistence.storeMemory({
			identityId: 'main-agent',
			type: 'semantic',
			content: {
				patternType: pattern.type,
				confidence: pattern.confidence,
				frequency: pattern.frequency,
				examples: pattern.examples,
				context: pattern.context,
				lastSeen: pattern.lastSeen.toISOString()
			}
		});
	}

	private async learnFromEvent(event: LearningEvent): Promise<void> {
		// Learn concepts from the event
		await this.aiPersistence.learnConcept({
			identityId: 'main-agent',
			conceptType: event.type,
			conceptName: `${event.type}_${event.context.language || 'general'}`,
			data: {
				event: event.content,
				context: event.context,
				timestamp: event.timestamp.toISOString()
			}
		});
	}

	private startConsolidationTimer(): void {
		// Consolidate memories every 5 minutes during idle time
		this.consolidationTimer = setInterval(async () => {
			await this.consolidateMemories();
		}, 5 * 60 * 1000); // 5 minutes
	}

	private async consolidateMemories(): Promise<void> {
		console.log('LearningManager: Starting memory consolidation...');

		// Get recent learning events
		const recentEvents = this.learningEvents.filter(
			event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
		);

		// Consolidate patterns
		const consolidatedPatterns = this.consolidatePatterns();
		
		// Store consolidated knowledge as procedural memory
		await this.aiPersistence.storeMemory({
			identityId: 'main-agent',
			type: 'procedural',
			content: {
				consolidationType: 'daily_patterns',
				patterns: consolidatedPatterns,
				eventCount: recentEvents.length,
				timestamp: new Date().toISOString()
			}
		});

		// Clear old events to prevent memory bloat
		this.learningEvents = this.learningEvents.filter(
			event => Date.now() - event.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Keep last 7 days
		);

		console.log(`LearningManager: Consolidated ${consolidatedPatterns.length} patterns from ${recentEvents.length} events`);
	}

	private consolidatePatterns(): any[] {
		const consolidated: any[] = [];

		for (const [patternType, pattern] of this.patterns) {
			// Only consolidate patterns that have been seen multiple times
			if (pattern.frequency > 1) {
				consolidated.push({
					type: patternType,
					confidence: pattern.confidence,
					frequency: pattern.frequency,
					lastSeen: pattern.lastSeen,
					examples: pattern.examples.slice(-5), // Keep last 5 examples
					context: pattern.context
				});
			}
		}

		return consolidated;
	}

	// Public methods for external access
	public async getLearnedPatterns(): Promise<LearningPattern[]> {
		return Array.from(this.patterns.values());
	}

	public async getPatternByType(type: string): Promise<LearningPattern | undefined> {
		return this.patterns.get(type);
	}

	public async getLearningStatistics(): Promise<any> {
		return {
			totalEvents: this.learningEvents.length,
			totalPatterns: this.patterns.size,
			recentEvents: this.learningEvents.filter(
				event => Date.now() - event.timestamp.getTime() < 60 * 60 * 1000 // Last hour
			).length,
			patternTypes: Array.from(this.patterns.keys()),
			lastConsolidation: new Date().toISOString()
		};
	}

	public async forceConsolidation(): Promise<void> {
		await this.consolidateMemories();
	}

	public dispose(): void {
		if (this.consolidationTimer) {
			clearInterval(this.consolidationTimer);
		}
	}
}
