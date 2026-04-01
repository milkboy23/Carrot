import 'jodit/es2021/jodit.min.css';
import { Jodit } from 'jodit';

// Initialize Jodit
const editor = Jodit.make('#editor', {
    height: '100%',
    autofocus: true
});

// Set initial value
editor.value = '<p>start typing...</p>';

// Listen for messages from extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'loadNote':
            editor.value = message.html;
            break;
    }
});

// Optional: Communicate with the Extension Host
const vscode = (window as any).acquireVsCodeApi();
 editor.events.on('change', () => {
     vscode.postMessage({
         command: 'contentChanged',
         html: editor.value
     });
 });

vscode.postMessage({ command: 'webviewReady' });

//TODO: How do we post a msg to the extension
// Send a message with the new html content when the user wants to save their progress
//const html = editor.value;
//vscode.postMessage({
//    command: "saveNote",
//    html: html
//});