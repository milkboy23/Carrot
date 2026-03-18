

import * as vscode from 'vscode';
import { SidebarProvider } from "./sidebarProvider";
import { createDecoration } from "./decoration";


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
			const created = createDecoration(vscode.window.activeTextEditor, context);
			if(!created){ 
				vscode.window.showErrorMessage("Unable to create decoration sucks to suck");
			}

		})
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
