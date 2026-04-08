const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function build() {
    // 1. Extension (Node.js)
    const extCtx = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        platform: 'node',
        outfile: 'out/extension.js',
        external: ['vscode'],
        minify: production,
        sourcemap: !production,
    });

    // 2. Webview Scripts (Browser)
    const webviewCtx = await esbuild.context({
        entryPoints: {
            'webview': 'src/webview/main.ts',   // Your original logic -> out/webview.js
            'index': 'web/src/main.tsx'    // Free Draw logic -> out/index.js
        },
        bundle: true,
        format: 'esm', // Changed to ESM because you used type="module" in your HTML
        target: ['es2021'],
        outdir: 'out',
        // FIX 1: Add the "style" condition for Tailwind
        conditions: ['style'], 
        loader: { 
            '.css': 'css', 
            '.tsx': 'tsx', 
            '.ts': 'ts',
            '.png': 'file',
            '.svg': 'file',
            // FIX 2: Add loader for fonts
            '.ttf': 'file',
            '.woff': 'file',
            '.woff2': 'file'
        },
        minify: production,
        sourcemap: !production,
        // React needs this "define" to avoid "process is not defined" errors in the browser
        define: {
            'process.env.NODE_ENV': production ? '"production"' : '"development"'
        },
        nodePaths: ['src/web/node_modules']
    });

    if (watch) {
        await Promise.all([extCtx.watch(), webviewCtx.watch()]);
        console.log("Watching for changes...");
    } else {
        await Promise.all([extCtx.rebuild(), webviewCtx.rebuild()]);
        await Promise.all([extCtx.dispose(), webviewCtx.dispose()]);
        console.log("Build complete.");
    }
}

build().catch(() => process.exit(1));