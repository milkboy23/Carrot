import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";
import { Comment } from "./Comment";
import { Panel } from "./Panel";

import { CommentManager } from './CommentManager';
import { NoteManager } from './NoteManager';

let carrotDecorationType: vscode.TextEditorDecorationType;

export function activate(context: vscode.ExtensionContext) {

	// to store carrot notes
	vscode.workspace.fs.createDirectory(context.extensionUri);

	CommentManager.init(context.workspaceState);
	NoteManager.init(context.workspaceState);

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
		const created = await Comment.createComment(context.extensionUri, vscode.window.activeTextEditor, 1, 1);
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

	// Create a new carrot comment with a full-page Carrot note attached
	vscode.commands.registerCommand('carrot.commentAndNote', async () => {
		const created = await Comment.createCommentAndNote(context.extensionUri, vscode.window.activeTextEditor, 1, 1);
		if(!created) { 
			vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
		}
		if (vscode.window.activeTextEditor) {
				restoreCommentsForEditor(context, vscode.window.activeTextEditor);
		}
	});
	
	// Open the Carrot note associated with a comment when the command is executed
	vscode.commands.registerCommand('carrot.openNote', (args) => {
		const noteId = args && args[0] && args[0].noteId;
		Panel.createOrShow(context.extensionUri, noteId);
	});
}

/**
 * Rendering comments with a markdown hyperlink.
 */
function restoreCommentsForEditor(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
	const comments = CommentManager.getCommentsForEditor(editor.document.uri);
	let markdownComment: vscode.MarkdownString = new vscode.MarkdownString("");

	const decorationOptions: vscode.DecorationOptions[] = []
	
	for (const comment of comments) {
		// Choose the arguments to pass to the method call
		const args = [{ noteId: comment.noteId }];
		// create the command with args and stringify
		const openNoteCommand = `command:carrot.openNote?${encodeURIComponent(JSON.stringify(args))}`;
		// Build the markdown hovermessage with text and the new command
		markdownComment = new vscode.MarkdownString(comment.hoverMessage + `[Open note](${openNoteCommand})`);
		// Set is trusted to allow the vscode hover message to show this markdown string
        markdownComment.isTrusted = true;
		// Add each fully buildt comment to the list of decorations for this document
		decorationOptions.push({
			range: new vscode.Range(comment.start, 0, comment.start, 0),
			hoverMessage: markdownComment
		});
	}

	editor.setDecorations(carrotDecorationType, decorationOptions);
}

// This method is called when your extension is deactivated
export function deactivate() {}
