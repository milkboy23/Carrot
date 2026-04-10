const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');


// Helper function to copy assets:
function copyAssets() {
    const srcDir = path.join(__dirname, 'web', 'src', 'assets'); // Adjust if favicon is elsewhere
    const destDir = path.join(__dirname, 'out', 'assets');

    if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Copy favicon.png (add other files here if needed)
        const filesToCopy = ['favicon.png']; 
        filesToCopy.forEach(file => {
            const srcFile = path.join(srcDir, file);
            if (fs.existsSync(srcFile)) {
                fs.copyFileSync(srcFile, path.join(destDir, file));
                console.log(`Copied: ${file} to out/assets/`);
            }
        });
    }
}

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
        format: 'iife', // Prevents global namespace collisions
        target: ['es2021'],
        outdir: 'out',
        // FIX 1: Add the "style" condition for Tailwind
        conditions: ['style'], 
        inject: ['./src/react-shim.js'],
        jsx: 'automatic', // Automatic transform to ensure react works
        loader: { 
            '.css': 'css', 
            '.tsx': 'tsx', 
            '.ts': 'ts',
            '.png': 'file',
            '.svg': 'dataurl',
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
        nodePaths: ['src/web/node_modules'],
        // This hook ensures assets are copied every time a rebuild happens
        plugins: [{
            name: 'copy-assets',
            setup(build) {
                build.onEnd(() => copyAssets());
            },
        }],
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