const esbuild = require('esbuild');

//takes a typescript file (main.ts), bundles all its dependencies, minifies it, and outputs browser-ready javascript
async function build() {
    await esbuild.build({
        entryPoints: ['src/webview/main.ts'],
        bundle: true,
        outfile: 'out/webview.js', // The bundled output
        loader: { '.css': 'css' },
        minify: true,
        sourcemap: true,
        target: ['es2021'],
        format: 'iife', // Required for browser scripts
    }).catch(() => process.exit(1));
}

build();