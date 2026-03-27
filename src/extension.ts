import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";
import { Comment } from "./Comment";
import { Note } from "./Note";

import { CommentManager } from './CommentManager';


export function activate(context: vscode.ExtensionContext) {

	CommentManager.init(context.workspaceState);

	//listen for changing the tab/file
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			restoreCommentsForEditor(editor);
		}
	});
	

	// This provides the sidebar icon for Carrot extension
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		"carrot-sidebar",
		sidebarProvider
		));

	
	// Creates a new Carrot comment (pop-up)
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.createCarrot', async () => {
			const comment = new Comment(1, 1);
			const created = comment.createDecoration(vscode.window.activeTextEditor, context);
			if(!created){ 
				vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
			}

		})
	);

	// Create a new full-page Carrot note
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.note', () => {
			//const note = new Note(1, 1); //EF core come in a clutch	
			Note.createOrShow(context.extensionUri);
		})
	);

	context.subscriptions.push(disposable);
}

function restoreCommentsForEditor(editor: vscode.TextEditor) {
	const comments = CommentManager.getCommentsForEditor(editor.document.uri);

	for(const comment of comments){
		const decoration = {
			hovermessage
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
