import * as vscode from 'vscode';
import { NoteManager } from './NoteManager';

export class Panel {
    public static currentPanel: Panel | undefined;
    public static readonly viewType = 'carrotNote';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
	private noteId: number;

    constructor(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, extensionUri: vscode.Uri, noteId: number){
        this._panel = panel;
        this._extensionUri = extensionUri;
		this.noteId = noteId;

        this._update(context);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			() => {
				if (this._panel.visible) {
					this._update(context);
				}
			},
			null,
			this._disposables
		);

		
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'webviewReady':
						const noteHtml = NoteManager.getInstance(context.workspaceState).loadNote(this.noteId);
						this._panel.webview.postMessage({ 
							command: 'loadNote', 
							html: noteHtml
						});
						return;
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
					case 'contentChanged':
						NoteManager.getInstance(context.workspaceState).saveNote(this.noteId, this._extensionUri, message.html);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		Panel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	
    }

    public static createOrShow(context: vscode.ExtensionContext, extensionUri: vscode.Uri, noteId: number) {
		
        // Creates a column based on the text editor. Checks for null.
        const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

        // If we already made a panel, show it, because we are limited to one panel.
        // if (Panel.currentPanel) {
        //     Panel.currentPanel._panel.reveal(column);
        //     return;
        // }
		// If we already made a panel, update the content

        // otherwise, create new panel.
        const panel = vscode.window.createWebviewPanel(
            Panel.viewType, // Identifies the type of the webview. 
            'Carrot Note ' + noteId.toString(), // Title of the panel displayed to the user
            column || vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true,
                localResourceRoots:[vscode.Uri.joinPath(extensionUri)]
            }
        );
        
        // Set the panel.
        Panel.currentPanel = new Panel(context, panel, extensionUri, noteId);
    }

    private _update(context: vscode.ExtensionContext){
        const webview = this._panel.webview;

        this._panel.title = "Carrot Note " + this.noteId.toString();
		this._panel.webview.html = this._getHtmlForWebview(context, webview);
    }

   	private _getHtmlForWebview(context: vscode.ExtensionContext, webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview.js'));
		const joditStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview.css'));
		
		const freeDrawScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'index.js'));
		const freeDrawStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'index.css'));
		const faviconSrc = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'assets', 'favicon.png'));

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script src="https://cdn.tailwindcss.com"></script>
				<link rel="icon" type="image/png" href="${faviconSrc}" />
				
				<link rel="stylesheet" href="${joditStyleUri}">
				<link rel="stylesheet" href="${freeDrawStyleUri}">

				<style>
					html, body { 
						height: 100vh; 
						width: 100vw;
						margin: 0; 
						padding: 0; 
						overflow: hidden; 
						display: flex;
						flex-direction: column;
					}

					#editor-wrapper { 
						flex: 0 0 50%; /* Top half */
						width: 100%; border-bottom: 1px solid var(--vscode-panel-border);
						position: relative; z-index: 10; overflow: hidden;
					}
					#root {
						flex: 1; /* Bottom half */
						width: 100%; position: relative;
						overflow: hidden; 
						touch-action: none;
					}
					/* Toolbar Positioning Override */
					#root .fixed.top-4.left-4 {
						position: absolute !important;
						top: 1rem !important; left: 1rem !important;
						z-index: 100 !important;
					}			

					/* Ensure Jodit fills the wrapper */
					.jodit-container {
						height: 100% !important;
						width: 100% !important;
						border: none !important;
					}
				</style>
			</head>
			<body>
				<div id="editor-wrapper">
					<textarea id="editor"></textarea>
				</div>
				
				<div id="root"></div>

				<script src="${scriptUri}"></script>
				<script type="module" src="${freeDrawScriptUri}"></script>
			</body>
			</html>
		`;
	}
}