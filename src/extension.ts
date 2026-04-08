import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";
import { Comment } from "./Comment";
import { Panel } from "./Panel";

import { CommentManager } from './CommentManager';
import { NoteManager } from './NoteManager';

let carrotDecorationType: vscode.TextEditorDecorationType;

export async function activate(context: vscode.ExtensionContext) : Promise<vscode.ExtensionContext> {

	
	// Create one instance of the decoration type
	carrotDecorationType = Comment.createDecorationType(context);
	// Registers the decoration type as a part of the extension.
	context.subscriptions.push(carrotDecorationType);

	// Listen for changing the tab/file
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			restoreCommentsForEditor(context, editor);
		}
	});

	// Check for opening a new active text editor 
	vscode.workspace.onDidOpenTextDocument(doc => {
		const editor = vscode.window.visibleTextEditors.find(active => active.document === doc);
		if (editor) {
			restoreCommentsForEditor(context, editor);
		}
	});

	// Check if the current window has an active text editor
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

		
	
	/**
	 * Sets up the createCarrot command. Calls CommentManager to store the Carrot comment.
	 * Restores the prior Carrot comments to the editor.
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.createCarrot', async () => {
			const created = await Comment.createComment(context, vscode.window.activeTextEditor);
			if(!created) { 
				vscode.window.showErrorMessage("Unable to create Carrot comment.");
			}
			if (vscode.window.activeTextEditor) {
					restoreCommentsForEditor(context, vscode.window.activeTextEditor);
			}
		})
	);

	/**
	 * Deletes a Carrot comment and restores the active Carrot comments.
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.deleteCarrot', async () => {
			const deleted = await Comment.deleteDecoration(vscode.window.activeTextEditor, context);
			
			if (vscode.window.activeTextEditor && deleted) {
				restoreCommentsForEditor(context, vscode.window.activeTextEditor);
			}
		})
	);

	/**
	 * TODO: Might be removed, as creating Carrot comments automatically should create a note too.
	 * Create a new carrot comment with a full-page Carrot note attached
	 */ 
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.commentAndNote', async () => {
			const created = await Comment.createCommentAndNote(context, vscode.window.activeTextEditor);
			if(!created) { 
				vscode.window.showErrorMessage("Unable to create a Carrot comment + note.");
			}
			if (vscode.window.activeTextEditor) {
					restoreCommentsForEditor(context, vscode.window.activeTextEditor);
			}
		})
	);
	
	/**
	 * 	Open the Carrot note associated with a comment when the command is executed.
	 *  The command is executed when the hyperlink in the Carrot comment is clicked.
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.openNote', (args) => {
			const decodedArgs = decodeURIComponent(args);
			const noteId = parseInt(decodedArgs);			

			Panel.createOrShow(context, context.extensionUri, noteId);
		})
	);
	return context;
}

/**
 * Restores the active Carrot comments to be displayed in the active text editor.
 * Adds a markdown hyperlink to the corresponding note for each Carrot comment.
 */
function restoreCommentsForEditor(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
	const comments = CommentManager.getInstance(context.workspaceState).getCommentsForEditor(editor.document.uri);
	let markdownComment: vscode.MarkdownString = new vscode.MarkdownString("");

	const decorationOptions: vscode.DecorationOptions[] = [];
	
	for (const comment of comments) {
		// create the command with args and stringify
		const openNoteCommand = `command:carrot.openNote?${encodeURIComponent(comment.noteId)}`;
		// Build the markdown hovermessage with text and the new command
		markdownComment = new vscode.MarkdownString(comment.hoverMessage + ` \n[Open note](${openNoteCommand})`);
		// Set is trusted to allow the vscode hover message to show this markdown string
        markdownComment.isTrusted = true;
		// Add each fully built comment to the list of decorations for this document
		decorationOptions.push({
			range: new vscode.Range(comment.start, 0, comment.start, 0),
			hoverMessage: markdownComment
		});
	}

	editor.setDecorations(carrotDecorationType, decorationOptions);
}

// This method is called when your extension is deactivated
export function deactivate() {}
