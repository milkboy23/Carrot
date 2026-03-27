import * as vscode from 'vscode';
import { SerializedComment } from './SerializedComment';

export class CommentManager{

    static workspaceState : vscode.Memento;
    static disposables : {dispose(): any;}[];

    static init(workspaceState: vscode.Memento){
        this.workspaceState = workspaceState;
    }
    
    //adding a comment to the workspaceState by getting its primitive types and pushing to the comments array 
    static addComment(id: number, noteId: number, editorUri: vscode.Uri, start: vscode.Position, hoverMessage: string){
        const allComments = this.workspaceState.get<SerializedComment[]>("comments", []);

        allComments.push({
            id: id,
            noteId: noteId,
            editorUri: editorUri.toString(),
            start: start.character,
            hoverMessage: hoverMessage
        });

        this.workspaceState.update("comments", allComments);
    }        

    static getCommentsForEditor(editorUri: vscode.Uri) : SerializedComment[] {
        return [];
    }
}