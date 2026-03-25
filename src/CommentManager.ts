import * as vscode from 'vscode';

export class CommentManager{

    static workspaceState : vscode.Memento;
    static disposables : {dispose(): any;}[];

    static init(disposables : {dispose(): any;}[]){
        this.disposables = disposables;
        CommentManager.workspaceState.update("disposables", disposables);
    }

    static addComment(comment){
        let listOfDisp = this.getComments();
        listOfDisp.push()
        this.workspaceState.update();
    }

    static getComments() : {dispose(): any;}[] | undefined {
        return this.workspaceState.get("disposables");
    }
}