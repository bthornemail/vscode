/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IAIPersistenceService } from '../../src/vs/workbench/contrib/axiomatic/common/axiomatic';

export interface CodePattern {
	id: string;
	type: 'function' | 'class' | 'interface' | 'variable' | 'import' | 'comment';
	name: string;
	content: string;
	language: string;
	complexity: number;
	relationships: string[];
	geometricPosition: {
		x: number;
		y: number;
		z: number;
	};
	metadata: {
		lineCount: number;
		cyclomaticComplexity: number;
		maintainabilityIndex: number;
		tags: string[];
	};
}

export interface AnalysisResult {
	patterns: CodePattern[];
	relationships: Array<{
		from: string;
		to: string;
		type: 'calls' | 'imports' | 'extends' | 'implements' | 'uses';
		strength: number;
	}>;
	metrics: {
		totalLines: number;
		functionCount: number;
		classCount: number;
		complexityScore: number;
		maintainabilityScore: number;
	};
	insights: string[];
}

export class CodeAnalysisAgent {
	private aiPersistence: IAIPersistenceService;
	private patterns: Map<string, CodePattern> = new Map();
	private analysisCache: Map<string, AnalysisResult> = new Map();

	constructor(aiPersistence: IAIPersistenceService) {
		this.aiPersistence = aiPersistence;
	}

	async analyzeDocument(document: vscode.TextDocument): Promise<AnalysisResult> {
		const cacheKey = `${document.uri.toString()}:${document.version}`;

		// Check cache first
		if (this.analysisCache.has(cacheKey)) {
			return this.analysisCache.get(cacheKey)!;
		}

		const content = document.getText();
		const language = document.languageId;
		const fileName = document.fileName;

		// Parse code patterns
		const patterns = await this.extractPatterns(content, language, fileName);

		// Analyze relationships
		const relationships = await this.analyzeRelationships(patterns);

		// Calculate metrics
		const metrics = this.calculateMetrics(patterns, content);

		// Generate insights
		const insights = await this.generateInsights(patterns, relationships, metrics);

		const result: AnalysisResult = {
			patterns,
			relationships,
			metrics,
			insights
		};

		// Cache result
		this.analysisCache.set(cacheKey, result);

		// Store patterns in AI persistence
		await this.storePatterns(patterns, fileName);

		return result;
	}

	private async extractPatterns(content: string, language: string, fileName: string): Promise<CodePattern[]> {
		const patterns: CodePattern[] = [];
		const lines = content.split('\n');

		// Extract functions
		const functionPatterns = this.extractFunctions(content, language, fileName);
		patterns.push(...functionPatterns);

		// Extract classes
		const classPatterns = this.extractClasses(content, language, fileName);
		patterns.push(...classPatterns);

		// Extract interfaces
		const interfacePatterns = this.extractInterfaces(content, language, fileName);
		patterns.push(...interfacePatterns);

		// Extract variables
		const variablePatterns = this.extractVariables(content, language, fileName);
		patterns.push(...variablePatterns);

		// Extract imports
		const importPatterns = this.extractImports(content, language, fileName);
		patterns.push(...importPatterns);

		return patterns;
	}

	private extractFunctions(content: string, language: string, fileName: string): CodePattern[] {
		const patterns: CodePattern[] = [];
		const lines = content.split('\n');

		// Language-specific function extraction
		const functionRegex = this.getFunctionRegex(language);
		if (!functionRegex) return patterns;

		let match;
		while ((match = functionRegex.exec(content)) !== null) {
			const functionName = match[1] || match[2] || 'anonymous';
			const functionContent = match[0];
			const startLine = content.substring(0, match.index).split('\n').length - 1;

			// Calculate geometric position using golden ratio
			const phi = (1 + Math.sqrt(5)) / 2;
			const x = (startLine * phi) % 1;
			const y = (functionName.length * phi) % 1;
			const z = (functionContent.length * phi) % 1;

			const pattern: CodePattern = {
				id: this.generatePatternId(fileName, functionName, 'function'),
				type: 'function',
				name: functionName,
				content: functionContent,
				language,
				complexity: this.calculateCyclomaticComplexity(functionContent),
				relationships: [],
				geometricPosition: { x, y, z },
				metadata: {
					lineCount: functionContent.split('\n').length,
					cyclomaticComplexity: this.calculateCyclomaticComplexity(functionContent),
					maintainabilityIndex: this.calculateMaintainabilityIndex(functionContent),
					tags: this.extractTags(functionContent, language)
				}
			};

			patterns.push(pattern);
		}

		return patterns;
	}

	private extractClasses(content: string, language: string, fileName: string): CodePattern[] {
		const patterns: CodePattern[] = [];
		const lines = content.split('\n');

		// Language-specific class extraction
		const classRegex = this.getClassRegex(language);
		if (!classRegex) return patterns;

		let match;
		while ((match = classRegex.exec(content)) !== null) {
			const className = match[1];
			const classContent = match[0];
			const startLine = content.substring(0, match.index).split('\n').length - 1;

			// Calculate geometric position
			const phi = (1 + Math.sqrt(5)) / 2;
			const x = (startLine * phi) % 1;
			const y = (className.length * phi) % 1;
			const z = (classContent.length * phi) % 1;

			const pattern: CodePattern = {
				id: this.generatePatternId(fileName, className, 'class'),
				type: 'class',
				name: className,
				content: classContent,
				language,
				complexity: this.calculateCyclomaticComplexity(classContent),
				relationships: [],
				geometricPosition: { x, y, z },
				metadata: {
					lineCount: classContent.split('\n').length,
					cyclomaticComplexity: this.calculateCyclomaticComplexity(classContent),
					maintainabilityIndex: this.calculateMaintainabilityIndex(classContent),
					tags: this.extractTags(classContent, language)
				}
			};

			patterns.push(pattern);
		}

		return patterns;
	}

	private extractInterfaces(content: string, language: string, fileName: string): CodePattern[] {
		const patterns: CodePattern[] = [];

		// Language-specific interface extraction
		const interfaceRegex = this.getInterfaceRegex(language);
		if (!interfaceRegex) return patterns;

		let match;
		while ((match = interfaceRegex.exec(content)) !== null) {
			const interfaceName = match[1];
			const interfaceContent = match[0];
			const startLine = content.substring(0, match.index).split('\n').length - 1;

			// Calculate geometric position
			const phi = (1 + Math.sqrt(5)) / 2;
			const x = (startLine * phi) % 1;
			const y = (interfaceName.length * phi) % 1;
			const z = (interfaceContent.length * phi) % 1;

			const pattern: CodePattern = {
				id: this.generatePatternId(fileName, interfaceName, 'interface'),
				type: 'interface',
				name: interfaceName,
				content: interfaceContent,
				language,
				complexity: 1, // Interfaces typically have low complexity
				relationships: [],
				geometricPosition: { x, y, z },
				metadata: {
					lineCount: interfaceContent.split('\n').length,
					cyclomaticComplexity: 1,
					maintainabilityIndex: 100, // Interfaces are highly maintainable
					tags: this.extractTags(interfaceContent, language)
				}
			};

			patterns.push(pattern);
		}

		return patterns;
	}

	private extractVariables(content: string, language: string, fileName: string): CodePattern[] {
		const patterns: CodePattern[] = [];

		// Language-specific variable extraction
		const variableRegex = this.getVariableRegex(language);
		if (!variableRegex) return patterns;

		let match;
		while ((match = variableRegex.exec(content)) !== null) {
			const variableName = match[1];
			const variableContent = match[0];
			const startLine = content.substring(0, match.index).split('\n').length - 1;

			// Calculate geometric position
			const phi = (1 + Math.sqrt(5)) / 2;
			const x = (startLine * phi) % 1;
			const y = (variableName.length * phi) % 1;
			const z = (variableContent.length * phi) % 1;

			const pattern: CodePattern = {
				id: this.generatePatternId(fileName, variableName, 'variable'),
				type: 'variable',
				name: variableName,
				content: variableContent,
				language,
				complexity: 1,
				relationships: [],
				geometricPosition: { x, y, z },
				metadata: {
					lineCount: 1,
					cyclomaticComplexity: 1,
					maintainabilityIndex: 100,
					tags: this.extractTags(variableContent, language)
				}
			};

			patterns.push(pattern);
		}

		return patterns;
	}

	private extractImports(content: string, language: string, fileName: string): CodePattern[] {
		const patterns: CodePattern[] = [];

		// Language-specific import extraction
		const importRegex = this.getImportRegex(language);
		if (!importRegex) return patterns;

		let match;
		while ((match = importRegex.exec(content)) !== null) {
			const importContent = match[0];
			const startLine = content.substring(0, match.index).split('\n').length - 1;

			// Calculate geometric position
			const phi = (1 + Math.sqrt(5)) / 2;
			const x = (startLine * phi) % 1;
			const y = (importContent.length * phi) % 1;
			const z = 0; // Imports are at the surface level

			const pattern: CodePattern = {
				id: this.generatePatternId(fileName, `import_${startLine}`, 'import'),
				type: 'import',
				name: `import_${startLine}`,
				content: importContent,
				language,
				complexity: 1,
				relationships: [],
				geometricPosition: { x, y, z },
				metadata: {
					lineCount: 1,
					cyclomaticComplexity: 1,
					maintainabilityIndex: 100,
					tags: ['import', 'dependency']
				}
			};

			patterns.push(pattern);
		}

		return patterns;
	}

	private getFunctionRegex(language: string): RegExp | null {
		const regexes: Record<string, RegExp> = {
			'typescript': /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g,
			'javascript': /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g,
			'python': /def\s+(\w+)\s*\([^)]*\)\s*:/g,
			'java': /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?\w+\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g,
			'csharp': /(?:public|private|protected)?\s*(?:static\s+)?(?:async\s+)?\w+\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g
		};
		return regexes[language] || null;
	}

	private getClassRegex(language: string): RegExp | null {
		const regexes: Record<string, RegExp> = {
			'typescript': /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{[^}]*\}/g,
			'javascript': /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{[^}]*\}/g,
			'python': /class\s+(\w+)(?:\([^)]*\))?\s*:/g,
			'java': /(?:public\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{[^}]*\}/g,
			'csharp': /(?:public\s+)?class\s+(\w+)(?:\s*:\s*[\w,\s]+)?\s*\{[^}]*\}/g
		};
		return regexes[language] || null;
	}

	private getInterfaceRegex(language: string): RegExp | null {
		const regexes: Record<string, RegExp> = {
			'typescript': /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*\{[^}]*\}/g,
			'java': /(?:public\s+)?interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*\{[^}]*\}/g,
			'csharp': /(?:public\s+)?interface\s+(\w+)(?:\s*:\s*[\w,\s]+)?\s*\{[^}]*\}/g
		};
		return regexes[language] || null;
	}

	private getVariableRegex(language: string): RegExp | null {
		const regexes: Record<string, RegExp> = {
			'typescript': /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*[:=]/g,
			'javascript': /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*[:=]/g,
			'python': /(\w+)\s*=\s*/g,
			'java': /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?\w+\s+(\w+)\s*[=;]/g,
			'csharp': /(?:public|private|protected)?\s*(?:static\s+)?(?:readonly\s+)?\w+\s+(\w+)\s*[=;]/g
		};
		return regexes[language] || null;
	}

	private getImportRegex(language: string): RegExp | null {
		const regexes: Record<string, RegExp> = {
			'typescript': /import\s+.*?from\s+['"][^'"]+['"]/g,
			'javascript': /import\s+.*?from\s+['"][^'"]+['"]/g,
			'python': /import\s+\w+/g,
			'java': /import\s+[\w.]+;/g,
			'csharp': /using\s+[\w.]+;/g
		};
		return regexes[language] || null;
	}

	private calculateCyclomaticComplexity(content: string): number {
		// Simple cyclomatic complexity calculation
		const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'];
		let complexity = 1; // Base complexity

		for (const keyword of complexityKeywords) {
			const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
			if (matches) {
				complexity += matches.length;
			}
		}

		return complexity;
	}

	private calculateMaintainabilityIndex(content: string): number {
		// Simple maintainability index calculation
		const lines = content.split('\n').length;
		const complexity = this.calculateCyclomaticComplexity(content);

		// Higher line count and lower complexity = higher maintainability
		const maintainability = Math.max(0, Math.min(100, 100 - (complexity * 5) + (lines * 0.1)));
		return Math.round(maintainability);
	}

	private extractTags(content: string, language: string): string[] {
		const tags: string[] = [];

		// Extract common patterns
		if (content.includes('async')) tags.push('async');
		if (content.includes('export')) tags.push('exported');
		if (content.includes('private')) tags.push('private');
		if (content.includes('public')) tags.push('public');
		if (content.includes('static')) tags.push('static');
		if (content.includes('@')) tags.push('decorated');
		if (content.includes('TODO') || content.includes('FIXME')) tags.push('needs_attention');

		return tags;
	}

	private async analyzeRelationships(patterns: CodePattern[]): Promise<Array<{ from: string, to: string, type: string, strength: number }>> {
		const relationships: Array<{ from: string, to: string, type: string, strength: number }> = [];

		for (const pattern of patterns) {
			// Find function calls
			const functionCalls = this.findFunctionCalls(pattern.content);
			for (const call of functionCalls) {
				const targetPattern = patterns.find(p => p.name === call && p.type === 'function');
				if (targetPattern) {
					relationships.push({
						from: pattern.id,
						to: targetPattern.id,
						type: 'calls',
						strength: 0.8
					});
				}
			}

			// Find variable usage
			const variableUsage = this.findVariableUsage(pattern.content);
			for (const variable of variableUsage) {
				const targetPattern = patterns.find(p => p.name === variable && p.type === 'variable');
				if (targetPattern) {
					relationships.push({
						from: pattern.id,
						to: targetPattern.id,
						type: 'uses',
						strength: 0.6
					});
				}
			}
		}

		return relationships;
	}

	private findFunctionCalls(content: string): string[] {
		// Simple function call detection
		const functionCallRegex = /(\w+)\s*\(/g;
		const calls: string[] = [];
		let match;

		while ((match = functionCallRegex.exec(content)) !== null) {
			calls.push(match[1]);
		}

		return [...new Set(calls)]; // Remove duplicates
	}

	private findVariableUsage(content: string): string[] {
		// Simple variable usage detection
		const variableRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
		const variables: string[] = [];
		let match;

		while ((match = variableRegex.exec(content)) !== null) {
			variables.push(match[1]);
		}

		return [...new Set(variables)]; // Remove duplicates
	}

	private calculateMetrics(patterns: CodePattern[], content: string) {
		const totalLines = content.split('\n').length;
		const functionCount = patterns.filter(p => p.type === 'function').length;
		const classCount = patterns.filter(p => p.type === 'class').length;

		const totalComplexity = patterns.reduce((sum, p) => sum + p.metadata.cyclomaticComplexity, 0);
		const complexityScore = totalComplexity / Math.max(patterns.length, 1);

		const totalMaintainability = patterns.reduce((sum, p) => sum + p.metadata.maintainabilityIndex, 0);
		const maintainabilityScore = totalMaintainability / Math.max(patterns.length, 1);

		return {
			totalLines,
			functionCount,
			classCount,
			complexityScore: Math.round(complexityScore * 100) / 100,
			maintainabilityScore: Math.round(maintainabilityScore * 100) / 100
		};
	}

	private async generateInsights(patterns: CodePattern[], relationships: any[], metrics: any): Promise<string[]> {
		const insights: string[] = [];

		// Complexity insights
		if (metrics.complexityScore > 10) {
			insights.push('High cyclomatic complexity detected. Consider refactoring complex functions.');
		}

		// Maintainability insights
		if (metrics.maintainabilityScore < 50) {
			insights.push('Low maintainability score. Consider improving code structure and documentation.');
		}

		// Pattern insights
		const functionPatterns = patterns.filter(p => p.type === 'function');
		if (functionPatterns.length > 20) {
			insights.push('Large number of functions detected. Consider organizing into modules or classes.');
		}

		// Relationship insights
		const highCoupling = relationships.filter(r => r.strength > 0.7).length;
		if (highCoupling > 10) {
			insights.push('High coupling detected. Consider reducing dependencies between components.');
		}

		// Geometric insights
		const geometricClusters = this.analyzeGeometricClusters(patterns);
		if (geometricClusters.length > 1) {
			insights.push(`Code is organized into ${geometricClusters.length} geometric clusters. This suggests good modular structure.`);
		}

		return insights;
	}

	private analyzeGeometricClusters(patterns: CodePattern[]): string[][] {
		// Simple geometric clustering based on position
		const clusters: string[][] = [];
		const processed = new Set<string>();

		for (const pattern of patterns) {
			if (processed.has(pattern.id)) continue;

			const cluster = [pattern.id];
			processed.add(pattern.id);

			// Find nearby patterns
			for (const otherPattern of patterns) {
				if (processed.has(otherPattern.id)) continue;

				const distance = this.calculateGeometricDistance(pattern.geometricPosition, otherPattern.geometricPosition);
				if (distance < 0.3) { // Threshold for clustering
					cluster.push(otherPattern.id);
					processed.add(otherPattern.id);
				}
			}

			clusters.push(cluster);
		}

		return clusters;
	}

	private calculateGeometricDistance(pos1: { x: number, y: number, z: number }, pos2: { x: number, y: number, z: number }): number {
		const dx = pos1.x - pos2.x;
		const dy = pos1.y - pos2.y;
		const dz = pos1.z - pos2.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	private async storePatterns(patterns: CodePattern[], fileName: string): Promise<void> {
		for (const pattern of patterns) {
			await this.aiPersistence.storeMemory({
				id: pattern.id,
				type: 'semantic',
				content: `Code pattern: ${pattern.name} (${pattern.type})`,
				metadata: {
					source: 'code_analysis',
					quality: 0.8,
					confidence: 0.9,
					importance: 0.7,
					tags: ['code_pattern', pattern.type, pattern.language, ...pattern.metadata.tags],
					context: {
						fileName,
						pattern,
						timestamp: new Date()
					}
				},
				timestamp: new Date()
			});
		}
	}

	private generatePatternId(fileName: string, name: string, type: string): string {
		const hash = this.simpleHash(`${fileName}:${name}:${type}`);
		return `pattern_${hash}`;
	}

	private simpleHash(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash).toString(36);
	}
}
