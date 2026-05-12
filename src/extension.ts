import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";
import { Comment } from "./Comment";
import { Panel } from "./Panel";

import { CommentManager } from './CommentManager';
import { NoteManager } from './NoteManager';

let carrotDecorationType: vscode.TextEditorDecorationType;
let commentManager: CommentManager;
let noteManager: NoteManager;

export async function activate(context: vscode.ExtensionContext) : Promise<vscode.ExtensionContext> {
	// Create one instance of the decoration type
	carrotDecorationType = Comment.createDecorationType(context);
	// Registers the decoration type as a part of the extension.
	context.subscriptions.push(carrotDecorationType);

	// Get the instance of the CommentManager Singleton
	commentManager = CommentManager.getInstance(context.workspaceState);
	noteManager = NoteManager.getInstance(context.workspaceState);

	// Listen for changing the tab/file
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			restoreCommentsForEditor(editor);
		}
	});

	// Check for opening a new active text editor 
	vscode.workspace.onDidOpenTextDocument(doc => {
		const editor = vscode.window.visibleTextEditors.find(active => active.document === doc);
		if (editor) {
			restoreCommentsForEditor(editor);
		}
	});

	vscode.workspace.onDidChangeTextDocument(event => {
		const editor = vscode.window.activeTextEditor;
		if(editor && event.document === editor.document){
			commentManager.shiftComments(editor.document.uri, event);
			restoreCommentsForEditor(editor);
		}
	});


	// Check if the current window has an active text editor
	if (vscode.window.activeTextEditor) {
		restoreCommentsForEditor(vscode.window.activeTextEditor);
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
				vscode.window.showErrorMessage("Unable to create Carrot Comment. Please try again.");
			}
			if (vscode.window.activeTextEditor) {
					restoreCommentsForEditor(vscode.window.activeTextEditor);
			}
		})
	);

	/**
	 * Deletes a Carrot comment and restores the active Carrot comments.
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.deleteCarrot', async () => {
			const deleted = await Comment.deleteComment(vscode.window.activeTextEditor, context);
			
			if (vscode.window.activeTextEditor && deleted) {
				restoreCommentsForEditor(vscode.window.activeTextEditor);
			} else {
				vscode.window.showErrorMessage("Unable to delete Carrot Comment. Please try again.");
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

			Panel.create(context.extensionUri, noteId);
		})
	);
	return context;
}

/**
 * Restores the active Carrot comments to be displayed in the active text editor.
 * Adds a markdown hyperlink to the corresponding note for each Carrot comment.
 * @param context 
 * @param editor 
 */
function restoreCommentsForEditor(editor: vscode.TextEditor) {
	const comments = commentManager.getCommentsForEditor(editor.document.uri);
	let markdownComment: vscode.MarkdownString = new vscode.MarkdownString("");

	const decorationOptions: vscode.DecorationOptions[] = [];
	
	for (const comment of comments) {
		// create the command with args and stringify
		const openNoteCommand = `command:carrot.openNote?${encodeURIComponent(comment.noteId)}`;
		// Build the markdown hovermessage with text and the new command
		markdownComment = new vscode.MarkdownString(comment.hoverMessage + ' \n ' + `[Open note](${openNoteCommand})`);
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
