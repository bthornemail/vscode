/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IAIPersistenceService } from '../../src/vs/workbench/contrib/axiomatic/common/axiomatic';
import { CodeAnalysisAgent, CodePattern } from './codeAnalysisAgent';

export interface CodeSuggestion {
	id: string;
	type: 'completion' | 'refactoring' | 'optimization' | 'pattern' | 'documentation';
	title: string;
	description: string;
	code: string;
	language: string;
	confidence: number;
	geometricScore: number;
	priority: 'low' | 'medium' | 'high' | 'critical';
	metadata: {
		lineNumber: number;
		columnNumber: number;
		context: string;
		tags: string[];
		relatedPatterns: string[];
	};
}

export interface SuggestionContext {
	document: vscode.TextDocument;
	position: vscode.Position;
	triggerCharacter?: string;
	patterns: CodePattern[];
	userHistory: any[];
	workspaceContext: any;
}

export class SuggestionAgent {
	private aiPersistence: IAIPersistenceService;
	private codeAnalysisAgent: CodeAnalysisAgent;
	private suggestionCache: Map<string, CodeSuggestion[]> = new Map();
	private userPreferences: Map<string, number> = new Map();

	constructor(aiPersistence: IAIPersistenceService, codeAnalysisAgent: CodeAnalysisAgent) {
		this.aiPersistence = aiPersistence;
		this.codeAnalysisAgent = codeAnalysisAgent;
	}

	async generateSuggestions(context: SuggestionContext): Promise<CodeSuggestion[]> {
		const cacheKey = this.generateCacheKey(context);

		// Check cache first
		if (this.suggestionCache.has(cacheKey)) {
			return this.suggestionCache.get(cacheKey)!;
		}

		const suggestions: CodeSuggestion[] = [];

		// Generate different types of suggestions
		const completionSuggestions = await this.generateCompletionSuggestions(context);
		suggestions.push(...completionSuggestions);

		const refactoringSuggestions = await this.generateRefactoringSuggestions(context);
		suggestions.push(...refactoringSuggestions);

		const optimizationSuggestions = await this.generateOptimizationSuggestions(context);
		suggestions.push(...optimizationSuggestions);

		const patternSuggestions = await this.generatePatternSuggestions(context);
		suggestions.push(...patternSuggestions);

		// Apply geometric consciousness ranking
		const rankedSuggestions = this.rankSuggestions(suggestions, context);

		// Cache results
		this.suggestionCache.set(cacheKey, rankedSuggestions);

		// Learn from context
		await this.learnFromContext(context, rankedSuggestions);

		return rankedSuggestions;
	}

	private async generateCompletionSuggestions(context: SuggestionContext): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const { document, position, patterns } = context;

		// Get current line and surrounding context
		const currentLine = document.lineAt(position.line).text;
		const beforeCursor = currentLine.substring(0, position.character);
		const afterCursor = currentLine.substring(position.character);

		// Analyze context to determine what kind of completion is needed
		const contextAnalysis = this.analyzeCompletionContext(beforeCursor, afterCursor, patterns);

		// Generate completions based on context
		if (contextAnalysis.needsFunctionCall) {
			const functionCompletions = await this.generateFunctionCallCompletions(context, patterns);
			suggestions.push(...functionCompletions);
		}

		if (contextAnalysis.needsVariable) {
			const variableCompletions = await this.generateVariableCompletions(context, patterns);
			suggestions.push(...variableCompletions);
		}

		if (contextAnalysis.needsImport) {
			const importCompletions = await this.generateImportCompletions(context, patterns);
			suggestions.push(...importCompletions);
		}

		if (contextAnalysis.needsClassMember) {
			const memberCompletions = await this.generateClassMemberCompletions(context, patterns);
			suggestions.push(...memberCompletions);
		}

		return suggestions;
	}

	private async generateRefactoringSuggestions(context: SuggestionContext): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const { document, position, patterns } = context;

		// Analyze current code for refactoring opportunities
		const refactoringOpportunities = this.identifyRefactoringOpportunities(document, patterns);

		for (const opportunity of refactoringOpportunities) {
			const suggestion = await this.createRefactoringSuggestion(opportunity, context);
			if (suggestion) {
				suggestions.push(suggestion);
			}
		}

		return suggestions;
	}

	private async generateOptimizationSuggestions(context: SuggestionContext): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const { document, patterns } = context;

		// Analyze patterns for optimization opportunities
		for (const pattern of patterns) {
			if (pattern.metadata.cyclomaticComplexity > 10) {
				const suggestion = await this.createComplexityOptimizationSuggestion(pattern, context);
				if (suggestion) {
					suggestions.push(suggestion);
				}
			}

			if (pattern.metadata.maintainabilityIndex < 50) {
				const suggestion = await this.createMaintainabilityOptimizationSuggestion(pattern, context);
				if (suggestion) {
					suggestions.push(suggestion);
				}
			}
		}

		return suggestions;
	}

	private async generatePatternSuggestions(context: SuggestionContext): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const { patterns } = context;

		// Learn from user's coding patterns
		const userPatterns = await this.getUserPatterns();

		// Suggest common patterns based on current context
		const applicablePatterns = this.findApplicablePatterns(patterns, userPatterns);

		for (const pattern of applicablePatterns) {
			const suggestion = await this.createPatternSuggestion(pattern, context);
			if (suggestion) {
				suggestions.push(suggestion);
			}
		}

		return suggestions;
	}

	private analyzeCompletionContext(beforeCursor: string, afterCursor: string, patterns: CodePattern[]): any {
		const analysis = {
			needsFunctionCall: false,
			needsVariable: false,
			needsImport: false,
			needsClassMember: false,
			context: ''
		};

		// Analyze what's before the cursor
		if (beforeCursor.includes('import ') || beforeCursor.includes('from ')) {
			analysis.needsImport = true;
			analysis.context = 'import';
		} else if (beforeCursor.includes('new ') || beforeCursor.includes('(')) {
			analysis.needsFunctionCall = true;
			analysis.context = 'function_call';
		} else if (beforeCursor.includes('this.') || beforeCursor.includes('.')) {
			analysis.needsClassMember = true;
			analysis.context = 'class_member';
		} else if (beforeCursor.match(/\b(const|let|var)\s+$/)) {
			analysis.needsVariable = true;
			analysis.context = 'variable_declaration';
		}

		return analysis;
	}

	private async generateFunctionCallCompletions(context: SuggestionContext, patterns: CodePattern[]): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const functionPatterns = patterns.filter(p => p.type === 'function');

		for (const pattern of functionPatterns) {
			// Calculate geometric score based on context similarity
			const geometricScore = this.calculateGeometricScore(pattern, context);

			if (geometricScore > 0.3) { // Threshold for relevance
				const suggestion: CodeSuggestion = {
					id: this.generateSuggestionId('function_call', pattern.name),
					type: 'completion',
					title: `Call ${pattern.name}()`,
					description: `Call the ${pattern.name} function`,
					code: `${pattern.name}()`,
					language: context.document.languageId,
					confidence: geometricScore,
					geometricScore,
					priority: geometricScore > 0.7 ? 'high' : 'medium',
					metadata: {
						lineNumber: context.position.line,
						columnNumber: context.position.character,
						context: 'function_call',
						tags: ['completion', 'function', pattern.language],
						relatedPatterns: [pattern.id]
					}
				};

				suggestions.push(suggestion);
			}
		}

		return suggestions;
	}

	private async generateVariableCompletions(context: SuggestionContext, patterns: CodePattern[]): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const variablePatterns = patterns.filter(p => p.type === 'variable');

		for (const pattern of variablePatterns) {
			const geometricScore = this.calculateGeometricScore(pattern, context);

			if (geometricScore > 0.3) {
				const suggestion: CodeSuggestion = {
					id: this.generateSuggestionId('variable', pattern.name),
					type: 'completion',
					title: `Use ${pattern.name}`,
					description: `Use the ${pattern.name} variable`,
					code: pattern.name,
					language: context.document.languageId,
					confidence: geometricScore,
					geometricScore,
					priority: geometricScore > 0.7 ? 'high' : 'medium',
					metadata: {
						lineNumber: context.position.line,
						columnNumber: context.position.character,
						context: 'variable_usage',
						tags: ['completion', 'variable', pattern.language],
						relatedPatterns: [pattern.id]
					}
				};

				suggestions.push(suggestion);
			}
		}

		return suggestions;
	}

	private async generateImportCompletions(context: SuggestionContext, patterns: CodePattern[]): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const importPatterns = patterns.filter(p => p.type === 'import');

		// Get common imports for the language
		const commonImports = this.getCommonImports(context.document.languageId);

		for (const importName of commonImports) {
			const suggestion: CodeSuggestion = {
				id: this.generateSuggestionId('import', importName),
				type: 'completion',
				title: `Import ${importName}`,
				description: `Import ${importName} module`,
				code: this.generateImportCode(importName, context.document.languageId),
				language: context.document.languageId,
				confidence: 0.6,
				geometricScore: 0.6,
				priority: 'medium',
				metadata: {
					lineNumber: context.position.line,
					columnNumber: context.position.character,
					context: 'import',
					tags: ['completion', 'import', context.document.languageId],
					relatedPatterns: []
				}
			};

			suggestions.push(suggestion);
		}

		return suggestions;
	}

	private async generateClassMemberCompletions(context: SuggestionContext, patterns: CodePattern[]): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];
		const classPatterns = patterns.filter(p => p.type === 'class');

		for (const classPattern of classPatterns) {
			// Extract class members from the pattern
			const members = this.extractClassMembers(classPattern.content);

			for (const member of members) {
				const suggestion: CodeSuggestion = {
					id: this.generateSuggestionId('class_member', member),
					type: 'completion',
					title: `Access ${member}`,
					description: `Access the ${member} member`,
					code: member,
					language: context.document.languageId,
					confidence: 0.7,
					geometricScore: 0.7,
					priority: 'medium',
					metadata: {
						lineNumber: context.position.line,
						columnNumber: context.position.character,
						context: 'class_member',
						tags: ['completion', 'class_member', context.document.languageId],
						relatedPatterns: [classPattern.id]
					}
				};

				suggestions.push(suggestion);
			}
		}

		return suggestions;
	}

	private identifyRefactoringOpportunities(document: vscode.TextDocument, patterns: CodePattern[]): any[] {
		const opportunities: any[] = [];

		// Look for long functions
		for (const pattern of patterns) {
			if (pattern.type === 'function' && pattern.metadata.lineCount > 50) {
				opportunities.push({
					type: 'extract_method',
					pattern,
					reason: 'Function is too long',
					priority: 'high'
				});
			}

			// Look for high complexity functions
			if (pattern.type === 'function' && pattern.metadata.cyclomaticComplexity > 10) {
				opportunities.push({
					type: 'simplify_conditionals',
					pattern,
					reason: 'High cyclomatic complexity',
					priority: 'high'
				});
			}

			// Look for duplicate code
			const duplicates = this.findDuplicateCode(patterns);
			for (const duplicate of duplicates) {
				opportunities.push({
					type: 'extract_common',
					pattern: duplicate,
					reason: 'Duplicate code detected',
					priority: 'medium'
				});
			}
		}

		return opportunities;
	}

	private async createRefactoringSuggestion(opportunity: any, context: SuggestionContext): Promise<CodeSuggestion | null> {
		const { type, pattern, reason, priority } = opportunity;

		let suggestion: CodeSuggestion | null = null;

		switch (type) {
			case 'extract_method':
				suggestion = {
					id: this.generateSuggestionId('refactor', 'extract_method'),
					type: 'refactoring',
					title: 'Extract Method',
					description: `Extract method from ${pattern.name}: ${reason}`,
					code: this.generateExtractMethodCode(pattern),
					language: context.document.languageId,
					confidence: 0.8,
					geometricScore: 0.8,
					priority: priority as any,
					metadata: {
						lineNumber: context.position.line,
						columnNumber: context.position.character,
						context: 'refactoring',
						tags: ['refactoring', 'extract_method', pattern.language],
						relatedPatterns: [pattern.id]
					}
				};
				break;

			case 'simplify_conditionals':
				suggestion = {
					id: this.generateSuggestionId('refactor', 'simplify_conditionals'),
					type: 'refactoring',
					title: 'Simplify Conditionals',
					description: `Simplify conditionals in ${pattern.name}: ${reason}`,
					code: this.generateSimplifiedConditionalsCode(pattern),
					language: context.document.languageId,
					confidence: 0.7,
					geometricScore: 0.7,
					priority: priority as any,
					metadata: {
						lineNumber: context.position.line,
						columnNumber: context.position.character,
						context: 'refactoring',
						tags: ['refactoring', 'simplify', pattern.language],
						relatedPatterns: [pattern.id]
					}
				};
				break;

			case 'extract_common':
				suggestion = {
					id: this.generateSuggestionId('refactor', 'extract_common'),
					type: 'refactoring',
					title: 'Extract Common Code',
					description: `Extract common code: ${reason}`,
					code: this.generateExtractCommonCode(pattern),
					language: context.document.languageId,
					confidence: 0.6,
					geometricScore: 0.6,
					priority: priority as any,
					metadata: {
						lineNumber: context.position.line,
						columnNumber: context.position.character,
						context: 'refactoring',
						tags: ['refactoring', 'extract_common', pattern.language],
						relatedPatterns: [pattern.id]
					}
				};
				break;
		}

		return suggestion;
	}

	private async createComplexityOptimizationSuggestion(pattern: CodePattern, context: SuggestionContext): Promise<CodeSuggestion> {
		return {
			id: this.generateSuggestionId('optimization', 'complexity'),
			type: 'optimization',
			title: 'Reduce Complexity',
			description: `Reduce complexity of ${pattern.name} (current: ${pattern.metadata.cyclomaticComplexity})`,
			code: this.generateComplexityOptimizationCode(pattern),
			language: context.document.languageId,
			confidence: 0.7,
			geometricScore: 0.7,
			priority: 'high',
			metadata: {
				lineNumber: context.position.line,
				columnNumber: context.position.character,
				context: 'optimization',
				tags: ['optimization', 'complexity', pattern.language],
				relatedPatterns: [pattern.id]
			}
		};
	}

	private async createMaintainabilityOptimizationSuggestion(pattern: CodePattern, context: SuggestionContext): Promise<CodeSuggestion> {
		return {
			id: this.generateSuggestionId('optimization', 'maintainability'),
			type: 'optimization',
			title: 'Improve Maintainability',
			description: `Improve maintainability of ${pattern.name} (current: ${pattern.metadata.maintainabilityIndex})`,
			code: this.generateMaintainabilityOptimizationCode(pattern),
			language: context.document.languageId,
			confidence: 0.6,
			geometricScore: 0.6,
			priority: 'medium',
			metadata: {
				lineNumber: context.position.line,
				columnNumber: context.position.character,
				context: 'optimization',
				tags: ['optimization', 'maintainability', pattern.language],
				relatedPatterns: [pattern.id]
			}
		};
	}

	private async getUserPatterns(): Promise<CodePattern[]> {
		// Get user's coding patterns from AI persistence
		const memories = await this.aiPersistence.getMemories({
			tags: ['code_pattern', 'user_style'],
			limit: 100
		});

		return memories.map(memory => memory.metadata.context?.pattern).filter(Boolean);
	}

	private findApplicablePatterns(currentPatterns: CodePattern[], userPatterns: CodePattern[]): CodePattern[] {
		const applicable: CodePattern[] = [];

		for (const userPattern of userPatterns) {
			// Find similar patterns in current context
			const similar = currentPatterns.find(p =>
				p.type === userPattern.type &&
				this.calculatePatternSimilarity(p, userPattern) > 0.5
			);

			if (similar) {
				applicable.push(userPattern);
			}
		}

		return applicable;
	}

	private async createPatternSuggestion(pattern: CodePattern, context: SuggestionContext): Promise<CodeSuggestion> {
		return {
			id: this.generateSuggestionId('pattern', pattern.name),
			type: 'pattern',
			title: `Apply ${pattern.name} Pattern`,
			description: `Apply the ${pattern.name} pattern based on your coding style`,
			code: pattern.content,
			language: context.document.languageId,
			confidence: 0.8,
			geometricScore: 0.8,
			priority: 'medium',
			metadata: {
				lineNumber: context.position.line,
				columnNumber: context.position.character,
				context: 'pattern',
				tags: ['pattern', 'user_style', pattern.language],
				relatedPatterns: [pattern.id]
			}
		};
	}

	private rankSuggestions(suggestions: CodeSuggestion[], context: SuggestionContext): CodeSuggestion[] {
		// Apply geometric consciousness ranking using golden ratio
		const phi = (1 + Math.sqrt(5)) / 2;

		return suggestions
			.map(suggestion => {
				// Calculate geometric score based on multiple factors
				const geometricScore = this.calculateGeometricScore(suggestion, context);

				// Apply sacred mathematics weighting
				const sacredWeight = suggestion.confidence * phi;

				// Apply user preference weighting
				const userPreference = this.getUserPreference(suggestion.type);

				// Final score
				const finalScore = geometricScore * sacredWeight * userPreference;

				return { ...suggestion, geometricScore: finalScore };
			})
			.sort((a, b) => b.geometricScore - a.geometricScore)
			.slice(0, 10); // Limit to top 10 suggestions
	}

	private calculateGeometricScore(suggestion: CodeSuggestion | CodePattern, context: SuggestionContext): number {
		// Calculate geometric distance between suggestion and context
		const contextPosition = this.getContextPosition(context);
		const suggestionPosition = this.getSuggestionPosition(suggestion);

		const distance = this.calculateDistance(contextPosition, suggestionPosition);

		// Convert distance to score (closer = higher score)
		return Math.max(0, 1 - distance);
	}

	private getContextPosition(context: SuggestionContext): { x: number, y: number, z: number } {
		// Use document position and language as geometric coordinates
		const phi = (1 + Math.sqrt(5)) / 2;
		const x = (context.position.line * phi) % 1;
		const y = (context.document.languageId.length * phi) % 1;
		const z = (context.document.uri.toString().length * phi) % 1;

		return { x, y, z };
	}

	private getSuggestionPosition(suggestion: CodeSuggestion | CodePattern): { x: number, y: number, z: number } {
		if ('geometricPosition' in suggestion) {
			return suggestion.geometricPosition;
		}

		// Calculate position for CodeSuggestion
		const phi = (1 + Math.sqrt(5)) / 2;
		const x = (suggestion.metadata.lineNumber * phi) % 1;
		const y = (suggestion.language.length * phi) % 1;
		const z = (suggestion.title.length * phi) % 1;

		return { x, y, z };
	}

	private calculateDistance(pos1: { x: number, y: number, z: number }, pos2: { x: number, y: number, z: number }): number {
		const dx = pos1.x - pos2.x;
		const dy = pos1.y - pos2.y;
		const dz = pos1.z - pos2.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	private getUserPreference(suggestionType: string): number {
		return this.userPreferences.get(suggestionType) || 1.0;
	}

	private async learnFromContext(context: SuggestionContext, suggestions: CodeSuggestion[]): Promise<void> {
		// Store learning data in AI persistence
		await this.aiPersistence.storeMemory({
			id: this.generateSuggestionId('learning', 'context'),
			type: 'episodic',
			content: `Suggestion context: ${context.document.languageId} at line ${context.position.line}`,
			metadata: {
				source: 'suggestion_learning',
				quality: 0.8,
				confidence: 0.9,
				importance: 0.7,
				tags: ['learning', 'suggestions', context.document.languageId],
				context: {
					context,
					suggestions,
					timestamp: new Date()
				}
			},
			timestamp: new Date()
		});
	}

	// Helper methods for code generation
	private getCommonImports(language: string): string[] {
		const commonImports: Record<string, string[]> = {
			'typescript': ['React', 'lodash', 'moment', 'axios', 'express'],
			'javascript': ['lodash', 'moment', 'axios', 'express'],
			'python': ['os', 'sys', 'json', 'datetime', 'requests'],
			'java': ['java.util.*', 'java.io.*', 'java.lang.*'],
			'csharp': ['System', 'System.Collections.Generic', 'System.Linq']
		};

		return commonImports[language] || [];
	}

	private generateImportCode(importName: string, language: string): string {
		const importTemplates: Record<string, string> = {
			'typescript': `import { ${importName} } from '${importName.toLowerCase()}';`,
			'javascript': `import { ${importName} } from '${importName.toLowerCase()}';`,
			'python': `import ${importName}`,
			'java': `import ${importName};`,
			'csharp': `using ${importName};`
		};

		return importTemplates[language] || `import ${importName}`;
	}

	private extractClassMembers(classContent: string): string[] {
		// Simple class member extraction
		const members: string[] = [];
		const lines = classContent.split('\n');

		for (const line of lines) {
			const match = line.match(/(?:public|private|protected)?\s*(?:static\s+)?\w+\s+(\w+)/);
			if (match) {
				members.push(match[1]);
			}
		}

		return members;
	}

	private findDuplicateCode(patterns: CodePattern[]): CodePattern[] {
		// Simple duplicate detection based on content similarity
		const duplicates: CodePattern[] = [];
		const processed = new Set<string>();

		for (let i = 0; i < patterns.length; i++) {
			if (processed.has(patterns[i].id)) continue;

			for (let j = i + 1; j < patterns.length; j++) {
				if (this.calculatePatternSimilarity(patterns[i], patterns[j]) > 0.8) {
					duplicates.push(patterns[i], patterns[j]);
					processed.add(patterns[i].id);
					processed.add(patterns[j].id);
				}
			}
		}

		return duplicates;
	}

	private calculatePatternSimilarity(pattern1: CodePattern, pattern2: CodePattern): number {
		// Simple similarity calculation based on content and structure
		const contentSimilarity = this.calculateStringSimilarity(pattern1.content, pattern2.content);
		const structureSimilarity = pattern1.type === pattern2.type ? 1.0 : 0.0;

		return (contentSimilarity + structureSimilarity) / 2;
	}

	private calculateStringSimilarity(str1: string, str2: string): number {
		// Simple Levenshtein distance-based similarity
		const maxLength = Math.max(str1.length, str2.length);
		if (maxLength === 0) return 1.0;

		const distance = this.levenshteinDistance(str1, str2);
		return 1 - (distance / maxLength);
	}

	private levenshteinDistance(str1: string, str2: string): number {
		const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

		for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
		for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

		for (let j = 1; j <= str2.length; j++) {
			for (let i = 1; i <= str1.length; i++) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[j][i] = Math.min(
					matrix[j][i - 1] + 1,
					matrix[j - 1][i] + 1,
					matrix[j - 1][i - 1] + indicator
				);
			}
		}

		return matrix[str2.length][str1.length];
	}

	// Code generation methods (simplified implementations)
	private generateExtractMethodCode(pattern: CodePattern): string {
		return `// TODO: Extract method from ${pattern.name}\n// Consider breaking this function into smaller, more focused methods`;
	}

	private generateSimplifiedConditionalsCode(pattern: CodePattern): string {
		return `// TODO: Simplify conditionals in ${pattern.name}\n// Consider using early returns or guard clauses`;
	}

	private generateExtractCommonCode(pattern: CodePattern): string {
		return `// TODO: Extract common code\n// Consider creating a shared utility function`;
	}

	private generateComplexityOptimizationCode(pattern: CodePattern): string {
		return `// TODO: Reduce complexity of ${pattern.name}\n// Consider breaking down complex logic into smaller functions`;
	}

	private generateMaintainabilityOptimizationCode(pattern: CodePattern): string {
		return `// TODO: Improve maintainability of ${pattern.name}\n// Consider adding documentation and improving naming`;
	}

	private generateCacheKey(context: SuggestionContext): string {
		return `${context.document.uri.toString()}:${context.position.line}:${context.position.character}:${context.document.version}`;
	}

	private generateSuggestionId(type: string, name: string): string {
		return `suggestion_${type}_${name}_${Date.now()}`;
	}
}
