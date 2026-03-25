import 'jodit/es2021/jodit.min.css';
import { Jodit } from 'jodit';

// Initialize Jodit
const editor = Jodit.make('#editor', {
    height: '100%',
    autofocus: true
});

// Set initial value
editor.value = '<p>start typing...</p>';

// Optional: Communicate with the Extension Host
const vscode = (window as any).acquireVsCodeApi();
editor.events.on('change', () => {
    vscode.postMessage({
        command: 'contentChanged',
        text: editor.value
    });
});