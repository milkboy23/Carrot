import * as assert from 'assert';
import * as vscode from 'vscode';
import { createMockContext, MockState } from './MockState';
import * as myExtension from '../extension';
import { CommentManager } from '../CommentManager';
import { SerializedComment } from '../SerializedComment';
import { NoteManager } from '../NoteManager';
import { SerializedNote } from '../SerializedNote';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// Creating a mock context from our MockState.ts
	let fakeContext = createMockContext();

	// Creating CommentManager and comment fields
	let cm : CommentManager;
	let noteId : number;
	let uri : vscode.Uri;
	let start : number;
	let hoverMessage : string;

	// Creating NoteManager and note fields
	let nm : NoteManager;
	let docUri : vscode.Uri;
	let html : string;


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


		// Setting up a mock CommentManager and mock Comment fields
		cm = CommentManager.getInstance(fakeContext.workspaceState);
		noteId = 0;
		uri = "src/test/workspace/testWorkspaceFile.ts" as unknown as vscode.Uri;
		start = 0;
		hoverMessage = "Testing Carrot <3";


		// Setting up a mock NoteManager and mock Note fields
		nm = NoteManager.getInstance(fakeContext.workspaceState);
		docUri = "src/test/workspace/testWorkspaceFile.ts" as unknown as vscode.Uri;
		html = "Hyper Text Markup Language";
	});


	// CommentManager tests
	test('Testing getInstance, that CommentManager is a Singleton', () => {
		const instance1 = CommentManager.getInstance(fakeContext.workspaceState);
		const instance2 = CommentManager.getInstance(fakeContext.workspaceState);

		assert.strictEqual(instance1, instance2);
	});

	test('Testing addComment, adding a comment through CommentManager', async () => {
		await cm.addComment(noteId, uri, start, hoverMessage);
		const commentList = fakeContext.workspaceState.get<SerializedComment[]>("comments", []);

		assert.strictEqual(commentList.length, 1);
	});

	test('Testing fetching the correct commentId from the workspaceState', () => {
		const commentList = fakeContext.workspaceState.get<SerializedComment[]>("comments", []);
		const comment = commentList.pop();
		const commentId = comment?.id;

		assert.strictEqual(commentId, 0);
	});

	test('Testing deleteComments, deleting a comment through CommentManager', async () => {
		await cm.addComment(noteId, uri, start, hoverMessage);
		const comment = {id: 1, noteId: noteId, editorUri: uri.toString(), start: start, hoverMessage: hoverMessage};
		await cm.deleteComments([comment]);
		const commentList = fakeContext.workspaceState.get<SerializedComment[]>("comments", []);

		assert.strictEqual(commentList.length, 0);
	});


	// NoteManager tests
	test('Testing getInstance, that NoteManager is a Singleton', () => {
		const instance1 = NoteManager.getInstance(fakeContext.workspaceState);
		const instance2 = NoteManager.getInstance(fakeContext.workspaceState);

		assert.strictEqual(instance1, instance2);
	});

	test('Testing addNote, add a note to the workspace', async () => {
		await nm.addNote(docUri, html);
		const noteList = fakeContext.workspaceState.get<SerializedNote[]>("notes", []);

		assert.strictEqual(noteList.length, 1); 
	});

	test('Testing loadNote, load the correct html based on noteId from the workspaceState', () => {
		const noteHtml = nm.loadNote(0);

		assert.strictEqual(noteHtml, html);
	});

	test('Testing saveNote, saving a note with new html content', async () => {
		const newHtml = "New HTML content";
		
		await nm.saveNote(0, docUri, newHtml);
		const noteHtml = nm.loadNote(0);

		assert.notStrictEqual(noteHtml, html);
		assert.strictEqual(noteHtml, newHtml);
	});

	test('Testing deleteNote, deleting a note by deleting a comment', async () => {
		await nm.deleteNote([0]);
		const noteList = fakeContext.workspaceState.get<SerializedNote[]>("notes", []);

		assert.strictEqual(noteList.length, 0);
	});

});
