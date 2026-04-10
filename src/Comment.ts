import * as vscode from "vscode";
import { CommentManager } from "./CommentManager";
import { Panel } from "./Panel";
import { NoteManager } from "./NoteManager";

export class Comment{

    static async createComment (context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined) : Promise<boolean>{
        
        return await this.createDecoration(context, editor);
    }

    static async createCommentAndNote (context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined) : Promise<boolean> {

        return await this.createDecoration(context, editor);
    }

    static async createDecoration(context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined) : Promise<boolean>{
        if(!editor){
            vscode.window.showWarningMessage("No editor in use");
            return false;
        }

        //Get highlighted text
        const selection = editor.selection;
        const start = selection.start;
        const decorationLine = start.line+1;
        const comment = editor.document.getText(selection);

        if(!comment || comment.trim().length === 0) {
            vscode.window.showWarningMessage("No text selected.");
            return false;
        }

        //Remove '//' from comment
        let parts = comment.split("//");
        let commentWOslash = "";
        let size = parts.length;
        for (let i = 0; i < size; i++){
            if (parts[i] !== "//") {
                commentWOslash = commentWOslash + parts[i];
            }
        }
        

        //Removes highlighted text
        const removed = await editor.edit(editBuilder => {
            // Do not remove the last \n
            if (selection.end.character === 0) {
                editBuilder.replace(selection, "\n");
            } else {
                editBuilder.replace(selection, "");
            }
        });
        if(!removed){
            vscode.window.showErrorMessage("The text could not be replaced");
        }

        // Create a serialized note for the comment and returns it id
        const noteId = await NoteManager.getInstance(context.workspaceState).addNote(editor.document.uri, commentWOslash);

        // Add the new comment to the comment manager with the new note id
        CommentManager.getInstance(context.workspaceState).addComment(noteId, editor.document.uri, decorationLine, commentWOslash);
        
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

        const userAction = await vscode.window.showWarningMessage(
                                'Are you sure you want to delete this Carrot comment',
                                'Proceed',
                                'Cancel');
        if (userAction === 'Proceed') {
            const commentsToDelete = CommentManager.getInstance(context.workspaceState).getCommentsForLocation(editor.document.uri, start);

            await CommentManager.getInstance(context.workspaceState).deleteComments(commentsToDelete);
            return true;
        } else {
            vscode.window.showInformationMessage("Action cancelled");
            return false;
        }

    }
}
