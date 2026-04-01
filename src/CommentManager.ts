import * as vscode from 'vscode';
import { SerializedComment } from './SerializedComment';
import { SerializedNote } from './SerializedNote';
import { NoteManager } from './NoteManager';

export class CommentManager{

    private workspaceState : vscode.Memento;

    private static instance: CommentManager;

    private constructor(workspaceState: vscode.Memento){
        this.workspaceState = workspaceState;
        this.workspaceState.get<number>("nextCommentId", 0);
        console.log("NoteManager instance created!");
    }

    public static getInstance(workspaceState: vscode.Memento){
        if (!this.instance) {
            CommentManager.instance = new CommentManager(workspaceState);
        }
        return CommentManager.instance;
    }
    
    //adding a comment to the workspaceState by getting its primitive types and pushing to the comments array 
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

    // gets the comments of the current editor by filtering through all comments
    public getCommentsForEditor(editorUri: vscode.Uri) : SerializedComment[] {
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);
        const editorComments = allComments.filter(c => c.editorUri === editorUri.toString());
        return editorComments;
    }

    // gets the comments of the current editor and line by filtering through all comments
    public getCommentsForLocation(editorUri: vscode.Uri, position: vscode.Position) : SerializedComment[] {
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);
        const editorComments = allComments.filter(c => c.editorUri === editorUri.toString());
        const positionComments = editorComments.filter(c => c.start === position.line);
        return positionComments;
    }

    public async deleteComments(commentsToDelete: SerializedComment[]) {
        // New list for comments NOT to be deleted
        const newCommentList: SerializedComment[] = [];
        // Get all the old comments
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);
        const notesToDelete: number[] = [];
        // Nested for loop: for each comment to delete, we compare it to all the old comments
        for (const commentToDelete of commentsToDelete) {
            for(const comment of allComments){
                if (commentToDelete.id === comment.id ) {
                    notesToDelete.push(comment.noteId);
                } else {
                    newCommentList.push(comment);
                }
             }
        }
        await NoteManager.getInstance(this.workspaceState).delete(notesToDelete);
        await this.workspaceState.update("comments", newCommentList);
    }
}