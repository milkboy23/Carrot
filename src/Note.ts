import * as vscode from 'vscode';
import { NoteManager } from './NoteManager';

export class Note {
    private readonly id : number;

    constructor(id: number, panel: vscode.WebviewPanel, extensionUri: vscode.Uri){
            this.id = id;
    }
}
