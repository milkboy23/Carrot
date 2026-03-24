import * as vscode from 'vscode';

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
            {} // Webview options. More on these later.
        );
        
        // Set the panel.
        Note.currentPanel = new Note(1, 1, panel, extensionUri);
    }
}