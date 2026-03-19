import * as vscode from 'vscode';

export class Note {

    private readonly id : number;
    private readonly commentId : number;

    constructor(id: number, commentId: number){
        this.id = id;
        this.commentId = commentId;
    }


    createPanel(context: vscode.ExtensionContext) : vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            'carrotNote', // Identifies the type of the webview. Used internally
            'New Carrot Note', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {} // Webview options. More on these later.
        );

        return panel;
    }
}