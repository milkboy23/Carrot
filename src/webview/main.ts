(window as any).global = window; // Fixes some Jodit/React global expectations

import 'jodit/es2021/jodit.min.css';
import { Jodit } from 'jodit';
import 'jodit/esm/plugins/resizer/resizer';
import 'jodit/esm/plugins/image/image';
//import 'jodit/esm/plugins/paragraph-style/paragraph-style'; // Wrong
//import 'jodit/esm/plugins/list/list';               // Wrong
import 'jodit/esm/plugins/format-block/format-block'; // Handles H1, H2, etc.
import 'jodit/esm/plugins/ordered-list/ordered-list'; 
import 'jodit/esm/plugins/indent/indent';           // Helps with list spacing
import 'jodit/esm/plugins/font/font';               // Fixes Size/Color logic
import 'jodit/esm/plugins/color/color';             // Enables color switching

// Initialize Jodit
const editor = Jodit.make('#editor', {
    height: '100%',
    autofocus: true,
    iframe: true,

    // buttons: [
    //     'bold', 'italic', 'underline', '|', 
    //     'ul', 'ol', '|', 
    //     'paragraph', 'fontsize', 'brush', '|',
    //     'image', 'table', 'link', 'hr', 'undo', 'redo'
    // ],

    style: {
        color: '#000000',     // Black text
        fontSize: '12px',     // Size 12
        fontFamily: 'Arial, sans-serif'
    },

    // This ensures that even if the webview resets CSS, the editor content looks right
    iframeStyle: `
        h1 { font-size: 2em !important; font-weight: bold !important; display: block !important; margin: 0.67em 0; }
        h2 { font-size: 1.5em !important; font-weight: bold !important; display: block !important; margin: 0.83em 0; }
        h3 { font-size: 1.17em !important; font-weight: bold !important; display: block !important; margin: 1em 0; }
        
        /* Ensure lists have visible bullets and numbers */
        ul { list-style-type: disc !important; padding-left: 40px !important; margin: 1em 0 !important; }
        ol { list-style-type: decimal !important; padding-left: 40px !important; margin: 1em 0 !important; }
        li { display: list-item !important; }
    `,
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