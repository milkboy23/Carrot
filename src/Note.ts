import * as vscode from 'vscode';
import { getNonce } from './getNonce';

export class Note {
    private readonly id : number;
    private readonly commentId : number;
    public static currentPanel: Note | undefined;
    public static readonly viewType = 'carrotNote';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    constructor(id: number, commentId: number, panel: vscode.WebviewPanel, extensionUri: vscode.Uri){
        this.id = id;
        this.commentId = commentId;
        this._panel = panel;
        this._extensionUri = extensionUri;

        
        this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			() => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
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
		Note.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	
    }


    public static createOrShow(extensionUri: vscode.Uri) {
        // Creates a column based on the text editor. Checks for null.
        const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

        // If we already made a panel, shwo it, because we are limited to one panel.
        if (Note.currentPanel) {
            Note.currentPanel._panel.reveal(column);
            return;
        }

        // otherwise, create new panel.
        const panel = vscode.window.createWebviewPanel(
            Note.viewType, // Identifies the type of the webview. 
            'New Carrot Note', // Title of the panel displayed to the user
            column || vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true,
                localResourceRoots:[vscode.Uri.joinPath(extensionUri)]
            }
        );
        
        // Set the panel.
        Note.currentPanel = new Note(1, 1, panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		Note.currentPanel = new Note(1, 1, panel, extensionUri);
	}

    private _update(){
        const webview = this._panel.webview;

        this._panel.title = "New Carrot Note";
		this._panel.webview.html = this._getHtmlForWebview(webview);
    }

   	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		// And the uri we use to load this script in the webview
		const joditJSUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', 'jodit', 'jodit.min.js'));

		const joditCSSUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', 'jodit', 'jodit.min.css'));

		// Local path to css styles
		// const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		// const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

		// Uri to load styles into webview
		//const stylesResetUri = webview.asWebviewUri(styleResetPath);
		//const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
				-->

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link rel="stylesheet" href="${joditCSSUri}">

				<style>
                    body { padding: 0; margin: 0; background-color: var(--vscode-editor-background); }
                    /* Make sure the editor fits the sidebar width */
                    .jodit-container { border: none !important; width: 100% !important; }
                </style>

				</head>
				<body>
					<textarea id="editor"></textarea>

					<script src="${joditJSUri}"></script>
					<script>
						const vscode = acquireVsCodeApi();
						const editor = Jodit.make('#editor', {
							theme: 'dark', // You can sync this with VS Code themes later
							height: '100%',
							toolbarAdaptive: true,
							buttons: 'bold,italic,underline,strikethrough,|,ul,ol,|,font,fontsize,brush,paragraph,|,link,table,|,undo,redo'
						});
                	</script>
            	</body>
            </html>
        `;

	}
}