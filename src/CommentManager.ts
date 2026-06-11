import * as vscode from 'vscode';
import { SerializedComment } from './SerializedComment';
import { NoteManager } from './NoteManager';

export class CommentManager{

    private workspaceState : vscode.Memento;

    private static instance: CommentManager;

    private constructor(workspaceState: vscode.Memento){
        this.workspaceState = workspaceState;
        this.workspaceState.get<number>("nextCommentId", 0);
    }

    /**
     * Get the singleton instance of the commentmanager for this workspace state
     */
    public static getInstance(workspaceState: vscode.Memento) : CommentManager {
        if (!this.instance) {
            CommentManager.instance = new CommentManager(workspaceState);
        }
        return CommentManager.instance;
    }
    
    /**
     * adding a comment to the workspaceState by getting its primitive types and pushing to the comments array 
     */
    public async addComment(noteId: number, editorUri: vscode.Uri, start: number, hoverMessage: string){
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);

        const id = this.workspaceState.get<number>("nextCommentId", 0);

        allComments.push({
            id: id,
            noteId: noteId,
            editorUri: editorUri.toString(),
            start: start,
            hoverMessage: hoverMessage
        });
        const nextId = id + 1;  
        await this.workspaceState.update("nextCommentId", nextId);
        await this.workspaceState.update("comments", allComments);
    }        

    /**
     * gets the comments of the current editor by filtering through all comments
     */
    public getCommentsForEditor(editorUri: vscode.Uri) : SerializedComment[] {
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);
        const editorComments = allComments.filter(c => c.editorUri === editorUri.toString());
        return editorComments;
    }

    /**
     * gets the comments of the current editor and line by filtering through all comments
     */
    public getCommentsForLocation(editorUri: vscode.Uri, startLine: number, endLine: number) : number[] {
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);
        const editorComments = allComments.filter(c => c.editorUri === editorUri.toString());

        const lineCount = endLine - startLine;
        let ids:number[] = [];

        for (let line = startLine; line < startLine + lineCount + 1; line++) {
            const positionComments = editorComments.filter(c => c.start === line);
            for (const c of positionComments) {
                ids.push(c.id);
            } 
        }
        
        return ids;
    }

    /**
     * Delete the selected comments
     */
    public async deleteComsById(idsToDelete: number[]){
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);
        let newComments = allComments;
        
        for (const id of idsToDelete) {
            newComments = newComments.filter(c => c.id !== id);
        }

        await NoteManager.makeOrGetInstance(this.workspaceState).deleteNote(idsToDelete);
        await this.workspaceState.update("comments", newComments);
    }

    /**
     * Method to recalculate the line number of Carrot comments upon content changes.
     * @param editorUri 
     * @param event 
     */
    public async shiftComments(editorUri: vscode.Uri, event: vscode.TextDocumentChangeEvent){
        let allComments = this.workspaceState.get<SerializedComment[]>("comments", []);
        let modified = false;
        for(const change of event.contentChanges){
            // calculates how many new lines have been added in this particular change within the relevant range
            const lineDelta = change.text.split("\n").length - 1 - (change.range.end.line - change.range.start.line);
            
            if(lineDelta === 0){
                continue;
            }

            allComments = allComments.map(comment => {
                // check if comment is located after the change
                if(comment.editorUri === editorUri.toString() && comment.start > change.range.start.line){
                    modified = true;
                    return { 
                        id: comment.id,
                        noteId: comment.noteId,
                        editorUri: comment.editorUri,
                        start: comment.start + lineDelta,
                        hoverMessage: comment.hoverMessage       
                    };
                }
                return comment;
            });
        }
        if(modified){
            await this.workspaceState.update("comments", allComments);
        }
    }
}