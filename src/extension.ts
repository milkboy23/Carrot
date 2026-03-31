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

	// Create a new full-page Carrot note
	vscode.commands.registerCommand('carrot.commentAndNote', async () => {
		const created = await Comment.createCommentAndNote(context.extensionUri, vscode.window.activeTextEditor, 1, 1);
		if(!created) { 
			vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
		}
		if (vscode.window.activeTextEditor) {
				restoreCommentsForEditor(context, vscode.window.activeTextEditor);
		}
	});
	
	vscode.commands.registerCommand('carrot.openNote',() => {
		Note.createOrShow(context.extensionUri);
	});
}

function restoreCommentsForEditor(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
	const comments = CommentManager.getCommentsForEditor(editor.document.uri);
	let markdownComment: vscode.MarkdownString = new vscode.MarkdownString("");

	const decorationOptions: vscode.DecorationOptions[] = []
	
	for (const comment of comments) {
		markdownComment = new vscode.MarkdownString(comment.hoverMessage + '[Open note](command:carrot.openNote)'); // what to link to
        markdownComment.isTrusted = true;
		decorationOptions.push({
			range: new vscode.Range(comment.start, 0, comment.start, 0),
			hoverMessage: markdownComment
		});
	}

	editor.setDecorations(carrotDecorationType, decorationOptions);
}

// This method is called when your extension is deactivated
export function deactivate() {}
