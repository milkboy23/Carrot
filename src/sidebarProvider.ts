import * as vscode from "vscode";
import { getNonce } from "./getNonce";


export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    
    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content=" img-src https: data:; style-src 'unsafe-inline' ${
      webview.cspSource
    }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<h1> Instructions </h1>
			</head>
      <body>

        <h2> Commands for Windows OS </h2>

				<h3> Create a Carrot Comment </h3>
        <ol>
          <li> Highlight the code comment you wish to transform into a Carrot Comment.</li>
          <li> Then press: <code> ctrl + alt + c </code></li>
          <li> You can now see your Carrot Comment upon hovering on the line next to the Carrot Icon that has appeared.</li>
          <li> To access the associated Carrot Note, click <code>Open Note</code>.</li>
        </ol>

        <p><br></p>

        <h3> Undo Creating a Carrot Comment </h3>
        <ol>
          <li> Press: <code> ctrl + z </code></li>
          <li> The original code comment will reappear.
          <li> Then, follow the steps bellow to delete the Carrot Comment.
        </ol>

        <p><br></p>

        </ol>
        <h3> Delete a Carrot Comment </h3>
        <p style="color: red;"> Please note: It is not possible to revert this action. This action deletes all the Carrot Comments on that line. </p>
        <ol>
          <li> Highlight the line next to the Carrot Icon of the Carrot Comment you wish to delete. </li>
          <li> Then press: <code> ctrl + alt + d </code></li>
          <li> A warning message will appear, click <code>Delete</code> if you are sure. 
        </ol>


        <p><br></p>

        <h2> Commands for MacOS </h2>

        <h3> Create a Carrot Comment </h3>
        <ol>
          <li> Highlight the code comment you wish to transform into a Carrot Comment. </li>
          <li> Then press: <code> command + option + c </code></li>
          <li> You can now see your Carrot Comment upon hovering on the line next to the Carrot Icon that has appeared.</li>
          <li> To access the associated Carrot Note, click <code>Open Note</code>.</li>
        </ol>
        
        <p><br></p>

        <h3> Undo Creating a Carrot Comment </h3>
        <ol>
          <li> Press: <code> command + z </code></li>
          <li> The original code comment will reappear.
          <li> Then, follow the steps bellow to delete the Carrot Comment.
        </ol>

        <p><br></p>

        <h3> Delete a Carrot Comment </h3>
        <p style="color: red;"> Please note: It is not possible to revert this action. This action deletes all the Carrot Comments on that line. </p>
        <ol>
          <li> Highlight the line next to the Carrot Icon of the Carrot Comment you wish to delete. </li>
          <li> Then press: <code> command + option + l </code></li>
          <li> A warning message will appear, click <code>Delete</code> if you are sure. </li>
        </ol>

			</body>
			</html>`;
  }

}