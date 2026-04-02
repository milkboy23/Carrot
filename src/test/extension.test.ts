import * as assert from 'assert';
import * as vscode from 'vscode';
import { createMockContext, MockState } from './MockState';
import * as myExtension from '../extension';
import { CommentManager } from '../CommentManager';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// Creating a mock context from our MockState.ts
	let fakeContext = createMockContext();

	suiteTeardown(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	suiteSetup(() => {
		const ext = vscode.extensions.getExtension("publisher.carrot");
		if (ext) {
			const myContext = ext.activate();
		} else {
			vscode.window.showInformationMessage('All tests done!');
		}
		
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	// Test that there is only one instance of the CommentManager
	test('Test CommentManager Singleton', () => {
		const instance1 = CommentManager.getInstance(fakeContext.workspaceState);
		const instance2 = CommentManager.getInstance(fakeContext.workspaceState);

		assert.strictEqual(instance1, instance2);
	});
});
