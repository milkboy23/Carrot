import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";
import { Comment } from "./Comment";
import { Note } from "./Note";

import { CommentManager } from './CommentManager';

let carrotDecorationType: vscode.TextEditorDecorationType;

export function activate(context: vscode.ExtensionContext) {

	// to store carrot notes
	vscode.workspace.fs.createDirectory(context.extensionUri);

	CommentManager.init(context.workspaceState);

	carrotDecorationType = Comment.createDecorationType(context);
	context.subscriptions.push(carrotDecorationType);

	// listen for changing the tab/file
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			restoreCommentsForEditor(context, editor);
		}
	});

	// check the workspace for active text editors 
	vscode.workspace.onDidOpenTextDocument(doc => {
		const editor = vscode.window.visibleTextEditors.find(active => active.document === doc);
		if (editor) {
			restoreCommentsForEditor(context, editor);
		}
	});

	if (vscode.window.activeTextEditor) {
		restoreCommentsForEditor(context, vscode.window.activeTextEditor);
	};

	// This provides the sidebar icon for Carrot extension
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		"carrot-sidebar",
		sidebarProvider
		));
	
	// Creates a new Carrot comment (pop-up)

	vscode.commands.registerCommand('carrot.createCarrot', async () => {
		const created = await Comment.createComment(vscode.window.activeTextEditor, 1, 1);
		if(!created) { 
			vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
		}
		if (vscode.window.activeTextEditor) {
				restoreCommentsForEditor(context, vscode.window.activeTextEditor);
		}
	});

	vscode.commands.registerCommand('carrot.deleteCarrot', async () => {
		const deleted = await Comment.deleteDecoration(vscode.window.activeTextEditor, context);
		if(!deleted) { 
			vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
		}
		if (vscode.window.activeTextEditor) {
				restoreCommentsForEditor(context, vscode.window.activeTextEditor);
		}
	});

	// Create a new full-page Carrot note
	vscode.commands.registerCommand('carrot.commentAndNote', () => {
		// const note = new Note(1, 1); //EF core come in a clutch	
		Comment.createCommentAndNote(vscode.window.activeTextEditor, 1, 1);
	});
}

function restoreCommentsForEditor(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
	const comments = CommentManager.getCommentsForEditor(editor.document.uri);
	
	const decorationOptions: vscode.DecorationOptions[] = comments.map(comment => ({
		range: new vscode.Range(comment.start, 0, comment.start, 0),
		hoverMessage: comment.hoverMessage
	}));

	editor.setDecorations(carrotDecorationType, decorationOptions);
}

// This method is called when your extension is deactivated
export function deactivate() {}
