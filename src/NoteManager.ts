import * as vscode from 'vscode';
import { SerializedNote } from './SerializedNote';

export class NoteManager{

    static workspaceState : vscode.Memento;

    static init(workspaceState: vscode.Memento){
        this.workspaceState = workspaceState;
    }

    static saveNote(id: number, editorUri: vscode.Uri, html: string){
        const allComments = this.workspaceState.get<SerializedNote[]>("comments", []);

        allComments.push({
            id: id,
            docUri: editorUri.toString(),
            html: "abc"
        });

        this.workspaceState.update("comments", allComments);
    }  
}