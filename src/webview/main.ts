(window as any).global = window; // Fixes some Jodit/React global expectations

import 'jodit/es2021/jodit.min.css';
import { Jodit } from 'jodit';
import 'jodit/esm/plugins/resizer/resizer';
import 'jodit/esm/plugins/image/image';

// Initialize Jodit
const editor = Jodit.make('#editor', {
    height: '100%',
    autofocus: true,
    // tells jodit which HTML elements are allowed to be resized by user. By default supports img, table, iframe
    allowResizeTags: new Set(['img', 'table', 'iframe']),
    resizer: {
        showSize : true,     //show a small tooltip with current width/height
        hideSizeTimeout : 500,  
        useAspectRatio : true,  // keep the aspect ratio when resizing - prevents stretched images
        forImageChangeAttributes: true,  // when resizing an image, update its HTML attributes
        min_width: 20,  // min width allowed when resizing
        min_height: 20  // min height allowed when resizing
    }
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