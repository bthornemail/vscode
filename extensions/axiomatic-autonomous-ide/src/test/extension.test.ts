/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Axiomatic Autonomous IDE Extension', () => {
	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('axiomatic.axiomatic-autonomous-ide'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('axiomatic.axiomatic-autonomous-ide');
		if (extension) {
			await extension.activate();
			assert.ok(extension.isActive);
		}
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		const axiomaticCommands = commands.filter(cmd => cmd.startsWith('axiomatic.'));
		
		assert.ok(axiomaticCommands.includes('axiomatic.initialize'));
		assert.ok(axiomaticCommands.includes('axiomatic.enableAutonomous'));
		assert.ok(axiomaticCommands.includes('axiomatic.learnFromFile'));
		assert.ok(axiomaticCommands.includes('axiomatic.showMemoryStats'));
		assert.ok(axiomaticCommands.includes('axiomatic.consolidateMemories'));
		assert.ok(axiomaticCommands.includes('axiomatic.exportKnowledge'));
		assert.ok(axiomaticCommands.includes('axiomatic.openControlPanel'));
	});
});
