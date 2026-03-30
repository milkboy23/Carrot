import * as vscode from "vscode";
import { CommentManager } from "./CommentManager";


export class Comment{

    static async createDecoration(editor: vscode.TextEditor | undefined, context: vscode.ExtensionContext, id: number, noteId: number) : Promise<boolean>{
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
        let markdownComment = new vscode.MarkdownString(textFromComment + " [note](https://code.visualstudio.com/api/ux-guidelines/overview#containers)") // what to link to

        //Removes highlighted text
        const removed = await editor.edit(editBuilder => {
            editBuilder.replace(selection, "");
        });
        if(!removed){
            vscode.window.showErrorMessage("IDK bro seems weird");
        }
        
        // Create decoration
        const decoration = {range: new vscode.Range(decorationLine, 0, decorationLine, 0), hoverMessage: markdownComment};
        const decorationType = this.createDecorationType(context);

        editor.setDecorations(decorationType, [decoration]);
        
        // Add the new comment to the comment manager
        CommentManager.addComment(id, noteId, editor.document.uri, decorationLine, textFromComment);

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

        const commentsToDelete = CommentManager.getCommentsForLocation(context.extensionUri, start);

        CommentManager.deleteComments(commentsToDelete);

        return true;
    }
}
