import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";
import { Comment } from "./Comment";
import { Note } from "./Note";

import { CommentManager } from './CommentManager';


export function activate(context: vscode.ExtensionContext) {

	CommentManager.init(context.workspaceState);

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
		const created = await Comment.createDecoration(vscode.window.activeTextEditor, context, 1, 1);
		if(!created) { 
			vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
		}
	});

	vscode.commands.registerCommand('carrot.deleteCarrot', async () => {
		const deleted = await Comment.deleteDecoration(vscode.window.activeTextEditor, context);
		if(!deleted) { 
			vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
		}
		if (vscode.window.activeTextEditor) {
				restoreCommentsForEditor(context, vscode.window.activeTextEditor);
		};
	});


	// Create a new full-page Carrot note
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.note', () => {
			// const note = new Note(1, 1); //EF core come in a clutch	
			Note.createOrShow(context.extensionUri);
		})
	);
}

function restoreCommentsForEditor(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
	const comments = CommentManager.getCommentsForEditor(editor.document.uri);
	
	// Define decoration type
	const decorationType = Comment.createDecorationType(context);

	const decorationOptions : vscode.DecorationOptions[] = [];
	// looping through the comments - creating new decoration and setting it in the editor
	for(const comment of comments){
		const range = new vscode.Range(comment.start, 0, comment.start, 0);

		const decoration = {
			range,
			hoverMessage : comment.hoverMessage
		};

		decorationOptions.push(decoration);
	}
	editor.setDecorations(decorationType, decorationOptions);
}

// This method is called when your extension is deactivated
export function deactivate() {}
