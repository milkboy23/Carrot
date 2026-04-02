import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import { CommentManager } from '../CommentManager';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	//vscode.commands.executeCommand("carrot.createCarrot");

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

	test('Test CommentManager', () => {
		//vscode.commands.executeCommand("carrot.createCarrot");

		const fakeState = {
			get: () => [],
			update: async () => {}
		} as unknown as vscode.Memento;

		const instance1 = CommentManager.getInstance(fakeState);
		const instance2 = CommentManager.getInstance(fakeState);

		assert.strictEqual(instance1, instance2);
	});
});
