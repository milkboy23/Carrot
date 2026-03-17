

import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";


export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		"carrot-sidebar",
		sidebarProvider
		));

	// The command has been defined in the package.json file
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('carrot.helloWorld', () => {
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Carrot!');
	});


/**
 * CreateCarrot:
 * 
 *  */	
	context.subscriptions.push(
		vscode.commands.registerCommand('carrot.createCarrot', async () => {
			const editor = vscode.window.activeTextEditor;

			if(!editor){
				vscode.window.showWarningMessage("No editor in use");
				return;
			}

			//Get highlighted text
			const selection = editor.selection;
			const start = selection.start;
			const comment = editor.document.getText(selection);

			if(!comment || comment.trim().length === 0) {
				vscode.window.showWarningMessage("No text selected.");
				return;
			}


			//Remove '//' from comment
			//TODO: iff (char is //) then replace it
			let firstslashremoved = comment.replace(comment.charAt(0), "");
			let textFromComment = firstslashremoved.replace(firstslashremoved.charAt(0), "");

			//Removes highlighted text
			const removed = await editor.edit(editBuilder => {
                editBuilder.replace(selection, "");
            });
            if(!removed){
                vscode.window.showErrorMessage("IDK bro seems weird");
            }
 

			//1. Get decoration image path
			const decoPath = vscode.Uri.joinPath(context.extensionUri, "media", "images", "carrot-decoration.svg"); 

			//2. Define decoration type
			const decorationType = vscode.window.createTextEditorDecorationType({
				gutterIconPath : decoPath,
				gutterIconSize : "contain",
				isWholeLine : true
			});
			
			//Create empty deco options
			const decorationOptions : vscode.DecorationOptions[] = [];
			const decoration = {range: new vscode.Range(start.line+1, 0, start.line+1, 0), hoverMessage: textFromComment};
			decorationOptions.push(decoration);

			editor.setDecorations(decorationType, decorationOptions);
		})
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
