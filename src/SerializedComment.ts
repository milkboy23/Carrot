import * as vscode from 'vscode';

export interface SerializedComment{
    
    id: number;
    noteId: number;
    editorUri: string;
    start: number;
    hoverMessage: string;

}