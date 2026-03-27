import * as vscode from "vscode";
import { CommentManager } from "./CommentManager";


export class Comment{
    private readonly id : number;
    private readonly noteId : number;

    constructor(id: number, noteId: number){
        this.id = id;
        this.noteId = noteId;
    }

    async createDecoration(editor: vscode.TextEditor | undefined, context: vscode.ExtensionContext) : Promise<boolean>{
        if(!editor){
            vscode.window.showWarningMessage("No editor in use");
            return false;
        }

        //Get highlighted text
        const selection = editor.selection;
        const start = selection.start;
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

        //1. Get decoration image path
        const decoPath = vscode.Uri.joinPath(context.extensionUri, "media", "images", "carrot-decoration.svg"); 

        //2. Define decoration type
        const decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath : decoPath,
            gutterIconSize : "contain",
            isWholeLine : true
        });
        
        //Create empty deco options
        const decorationOptions : vscode.DecorationOptions[] = [];
        const decoration = {range: new vscode.Range(start.line+1, 0, start.line+1, 0), hoverMessage: textFromComment};
        decorationOptions.push(decoration);

        editor.setDecorations(decorationType, decorationOptions);
        
        CommentManager.addComment(this.id, this.noteId, editor.document.uri, start, textFromComment);

        return true;
    }
}
