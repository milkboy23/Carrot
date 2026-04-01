import * as vscode from 'vscode';
import { SerializedNote } from './SerializedNote';
import { Note } from './Note';

export class NoteManager {

    private workspaceState : vscode.Memento;

    private nextId: number;

    private static instance: NoteManager;


    private constructor(workspaceState: vscode.Memento){
        this.workspaceState = workspaceState;
        this.nextId = 0;
        console.log("NoteManager instance created!");
    }

    public static getInstance(workspaceState: vscode.Memento){
        if (!this.instance) {
            NoteManager.instance = new NoteManager(workspaceState);
        }
        return NoteManager.instance;
    }


    public addNote(editorUri: vscode.Uri, hoverMessage: string) : number {
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);

        const id = this.nextId
        allNotes.push({
            id: id,
            docUri: editorUri.toString(),
            html: hoverMessage
        });

        this.nextId++;
        this.workspaceState.update("notes", allNotes);

        return id;
    }

    /**
     * Save an existing Carrot Note with new html content
     */
    public saveNote(id: number, editorUri: vscode.Uri, html: string){
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

    public loadNote(id: number): string | undefined {
        const allNotes = this.workspaceState.get<SerializedNote[]>("notes", []);
        const note = allNotes.find(note => note.id === id);
        return note ? note.html : undefined;
    }  
}