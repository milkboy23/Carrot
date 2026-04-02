import * as vscode from 'vscode';
import { SerializedNote } from './SerializedNote';

export class NoteManager {

    private workspaceState : vscode.Memento;

    private static instance: NoteManager;

    private constructor(workspaceState: vscode.Memento){
        this.workspaceState = workspaceState;
        this.workspaceState.get<number>("nextNoteId", 0);
        console.log("NoteManager instance created!");
    }

    public static getInstance(workspaceState: vscode.Memento){
        if (!this.instance) {
            NoteManager.instance = new NoteManager(workspaceState);
        }
        return NoteManager.instance;
    }

    public async addNote(editorUri: vscode.Uri, hoverMessage: string) : Promise<number> {
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);

        const id = this.workspaceState.get<number>("nextNoteId", 0);
        allNotes.push({
            id: id,
            docUri: editorUri.toString(),
            html: hoverMessage
        });

        const nextId = id + 1; 

        await this.workspaceState.update("nextNoteId", nextId);

        await this.workspaceState.update("notes", allNotes);

        return id;
    }

    /**
     * Save an existing Carrot Note with new html content
     */
    public async saveNote(id: number, editorUri: vscode.Uri, html: string){
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);

        // Remove existing note with same id
        const filteredNotes = allNotes.filter(note => note.id !== id);

        filteredNotes.push({
            id: id,
            docUri: editorUri.toString(),
            html: html
        });

        await this.workspaceState.update("notes", filteredNotes);
    }

    /**
     * Load a note from memory based on its id.
     */

    public loadNote(id: number): string | undefined {
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);
        const note = allNotes.find(note => note.id === id);
        return note ? note.html : undefined;
    }  

    public async delete(idsToDelete: number[]) {
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);
        const newNoteList: SerializedNote[] = [];

        for (const idToDelete of idsToDelete) {
            for(const note of allNotes){
                if (idToDelete !== note.id ) {
                    newNoteList.push(note);
                }
             }
        }
        await this.workspaceState.update("notes", newNoteList);
    }
}