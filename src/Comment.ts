import * as vscode from "vscode";
import { CommentManager } from "./CommentManager";
import { Panel } from "./Panel";
import { Note } from "./Note";
import { NoteManager } from "./NoteManager";

export class Comment{

    static async createComment (context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined, id: number, noteId: number) : Promise<boolean>{
        
        return await this.createDecoration(context, editor, id, noteId);
    }

    static async createCommentAndNote (context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined, id: number, noteId: number) : Promise<boolean> {

        return await this.createDecoration(context, editor, id, noteId);
    }

    static async createDecoration(context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined, id: number, noteId: number) : Promise<boolean>{
        if(!editor){
            vscode.window.showWarningMessage("No editor in use");
            return false;
        }

        
        //Get highlighted text
        const selection = editor.selection;
        const start = selection.start;
        const decorationLine= start.line+1;
        const comment = editor.document.getText(selection);

        if(!comment || comment.trim().length === 0) {
            vscode.window.showWarningMessage("No text selected.");
            return false;
        }

        //Remove '//' from comment
        //TODO: iff (char is //) then replace it
        let firstslashremoved = comment.replace(comment.charAt(0), "");
        let textFromComment = firstslashremoved.replace(firstslashremoved.charAt(0), "");

        //Removes highlighted text
        const removed = await editor.edit(editBuilder => {
            editBuilder.replace(selection, "");
        });
        if(!removed){
            vscode.window.showErrorMessage("IDK bro seems weird");
        }

        // Create a serialized note for the comment
        await NoteManager.getInstance(context.workspaceState).addNote(noteId, editor.document.uri, textFromComment);
        // Add the new comment to the comment manager
        await CommentManager.getInstance(context.workspaceState).addComment(id, noteId, editor.document.uri, decorationLine, textFromComment);
        
        return true;
    }

    static createDecorationType(context: vscode.ExtensionContext) : vscode.TextEditorDecorationType {
        
        //1. Get decoration image path
        const decoPath = vscode.Uri.joinPath(context.extensionUri, "media", "images", "carrot-decoration.svg"); 

        //2. Define decoration type
        const decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath : decoPath,
            gutterIconSize : "contain",
            isWholeLine : true
        });

        return decorationType;
    } 

    static async deleteDecoration(editor: vscode.TextEditor | undefined, context: vscode.ExtensionContext) : Promise<boolean>{
        if(!editor){
            vscode.window.showWarningMessage("No editor in use");
            return false;
        }

        //Get highlighted text
        const selection = editor.selection;
        const start = selection.start;

        const commentsToDelete = CommentManager.getInstance(context.workspaceState).getCommentsForLocation(editor.document.uri, start);

        await CommentManager.getInstance(context.workspaceState).deleteComments(commentsToDelete);

        return true;
    }
}
