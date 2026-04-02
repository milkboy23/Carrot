import * as assert from 'assert';
import * as vscode from 'vscode';
import { createMockContext, MockState } from './MockState';
import * as myExtension from '../extension';
import { CommentManager } from '../CommentManager';
import { SerializedComment } from '../SerializedComment';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// Creating a mock context from our MockState.ts
	let fakeContext = createMockContext();
	let cm : CommentManager;
	let noteId : number;
	let uri : vscode.Uri;
	let start : number;
	let hoverMessage : string;

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


		// Setting up a mock CommentManager and a mock Comment
		cm = CommentManager.getInstance(fakeContext.workspaceState);
		noteId = 0;
		uri = "src/test/workspace/testWorkspaceFile.ts" as unknown as vscode.Uri;
		start = 0;
		hoverMessage = "Testing Carrot <3";
	});


	// CommentManager tests

	test('Test CommentManager is a Singleton', () => {
		const instance1 = CommentManager.getInstance(fakeContext.workspaceState);
		const instance2 = CommentManager.getInstance(fakeContext.workspaceState);

		assert.strictEqual(instance1, instance2);
	});

	test('Add comment through CommentManager', async () => {
		await cm.addComment(noteId, uri, start, hoverMessage);
		const commentList = fakeContext.workspaceState.get<SerializedComment[]>("comments", []);

		assert.equal(commentList.length, 1);
	});

	test('Check commentId', () => {
		const commentList = fakeContext.workspaceState.get<SerializedComment[]>("comments", []);
		const comment = commentList.pop();
		const commentId = comment?.id;

		assert.equal(commentId, 0);
	});

	test('Delete comment', async () => {
		await cm.addComment(noteId, uri, start, hoverMessage);
		const comment = {id: 1, noteId: noteId, editorUri: uri.toString(), start: start, hoverMessage: hoverMessage};
		await cm.deleteComments([comment]);
		const commentList = fakeContext.workspaceState.get<SerializedComment[]>("comments", []);

		assert.equal(commentList.length, 0);
	});


	// NoteManager tests
});
