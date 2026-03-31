import * as vscode from 'vscode';
import { SerializedNote } from './SerializedNote';

export class NoteManager{

    static workspaceState : vscode.Memento;

    static init(workspaceState: vscode.Memento){
        this.workspaceState = workspaceState;
    }

    /**
     * Save an existing Carrot Note with new html content
     */
    static saveNote(id: number, editorUri: vscode.Uri, html: string){
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);

        // Remove existing note with same id
        const filteredNotes = allNotes.filter(note => note.id !== id);

        filteredNotes.push({
            id: id,
            docUri: editorUri.toString(),
            html: html
        });

        this.workspaceState.update("notes", filteredNotes);
    }

    /**
     * Load a note from memory based on its id.
     */

    static loadNote(id: number): string | undefined {
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);
        const note = allNotes.find(note => note.id === id);
        return note ? note.html : undefined;
    }  
}