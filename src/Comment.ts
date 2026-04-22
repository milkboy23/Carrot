import * as vscode from "vscode";
import { CommentManager } from "./CommentManager";
import { NoteManager } from "./NoteManager";
import { Console } from "console";

export class Comment{
    /**
     * Creates the Carrot Comment and its associated Carrot Note.
     * @param context 
     * @param editor 
     * @returns true if successful
     */
    static async createComment(context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined) : Promise<boolean>{
        if(!editor){
            vscode.window.showWarningMessage("No higlighted text. Please higlight the desired code comment.");
            return false;
        }

        //Get highlighted text
        const selection = editor.selection;
        const start = selection.start;
        const decorationLine = start.line+1;
        const rawComment = editor.document.getText(selection);

        if (!rawComment || rawComment.trim().length === 0) {
            vscode.window.showWarningMessage("No text selected. Please select non-empty text.");
            return false;
        }

        // Process lines to remove indentation and comment markers
        const cleanMarkdown = rawComment
            .split(/\r?\n/)
            .map(line => line.replace(/^\s*\/\/ ?/, ''))
            .join('\n');

        // Convert to HTML
        const showdown = require('showdown');
        const converter = new showdown.Converter();
        const html = converter.makeHtml(cleanMarkdown);

        console.log(html);

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
            vscode.window.showErrorMessage("The text could not be replaced. Please try manually deleting the code comment.");
        }

        // Create a serialized note for the comment and returns it id
        const noteId = await NoteManager.getInstance(context.workspaceState).addNote(editor.document.uri, html);

        // Add the new comment to the comment manager with the new note id
        CommentManager.getInstance(context.workspaceState).addComment(noteId, editor.document.uri, decorationLine, cleanMarkdown);
        
        vscode.window.showInformationMessage("Carrot Comment created successfully!");
        return true;
    }

    static createDecorationType(context: vscode.ExtensionContext) : vscode.TextEditorDecorationType {
        
        //1. Get decoration image path
        const decoPath = vscode.Uri.joinPath(context.extensionUri, "media", "images", "carrot-decoration.png"); 

        //2. Define decoration type
        const decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath : decoPath,
            gutterIconSize : "contain",
            isWholeLine : true,
            rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed
        });

        return decorationType;
    } 

    static async deleteComment(editor: vscode.TextEditor | undefined, context: vscode.ExtensionContext) : Promise<boolean>{
        if(!editor){
            vscode.window.showWarningMessage("No text highlighted. Please highlight text next to a Carrot Icon.");
            return false;
        }

        //Get highlighted text
        const selection = editor.selection;
        const start = selection.start;

        const userAction = await vscode.window.showWarningMessage(
                                'Are you sure you want to delete this Carrot Comment',
                                'Delete',
                                'Cancel');
        if (userAction === 'Delete') {
            const commentsToDelete = CommentManager.getInstance(context.workspaceState).getCommentsForLocation(editor.document.uri, start);

            await CommentManager.getInstance(context.workspaceState).deleteComments(commentsToDelete);
            vscode.window.showInformationMessage("Carrot Comment deleted successfully!");
            return true;
        } else {
            vscode.window.showInformationMessage("Action cancelled. The Carrot Comment was not deleted.");
            return false;
        }

    }
}
