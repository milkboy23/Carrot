const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',
    setup(build) {
        build.onStart(() => {
            console.log('[watch] build started');
        });
        build.onEnd((result) => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`);
                if (location == null) return;
                console.error(`    ${location.file}:${location.line}:${location.column}:`);
            });
            console.log('[watch] build finished');
        });
    },
};

function copyAssets() {
    const srcDir = path.join(__dirname, 'web', 'src', 'assets');
    const destDir = path.join(__dirname, 'dist', 'assets'); // Switched to 'dist' per official guide

    if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        const filesToCopy = ['favicon.png'];
        filesToCopy.forEach(file => {
            const srcFile = path.join(srcDir, file);
            if (fs.existsSync(srcFile)) {
                fs.copyFileSync(srcFile, path.join(destDir, file));
            }
        });
    }
}

async function build() {
    // 1. Extension Context (Node.js)
    const extCtx = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        platform: 'node',
        outfile: 'dist/extension.js', // Output to dist
        external: ['vscode'],
        minify: production,
        sourcemap: !production,
        sourcesContent: false, // Performance improvement: don't include source code in maps
        logLevel: 'warning',
        plugins: [esbuildProblemMatcherPlugin],
    });

    // 2. Webview Scripts Context (Browser)
    const webviewCtx = await esbuild.context({
        entryPoints: {
            'webview': 'src/webview/main.ts',
            'index': 'web/src/main.tsx'
        },
        bundle: true,
        format: 'iife',
        target: ['es2021'],
        outdir: 'dist',
        conditions: ['style'],
        inject: ['./src/react-shim.js'],
        jsx: 'automatic',
        loader: {
            '.css': 'css',
            '.tsx': 'tsx',
            '.ts': 'ts',
            '.png': 'file',
            '.svg': 'dataurl',
            '.ttf': 'file',
            '.woff': 'file',
            '.woff2': 'file'
        },
        minify: production,
        sourcemap: !production,
        sourcesContent: false,
        define: {
            'process.env.NODE_ENV': production ? '"production"' : '"development"'
        },
        plugins: [{
            name: 'copy-assets',
            setup(build) {
                build.onEnd(() => copyAssets());
            },
        }],
    });

    if (watch) {
        await Promise.all([extCtx.watch(), webviewCtx.watch()]);
    } else {
        await Promise.all([extCtx.rebuild(), webviewCtx.rebuild()]);
        await Promise.all([extCtx.dispose(), webviewCtx.dispose()]);
        console.log("Build complete.");
    }
}

build().catch((e) => {
    console.error(e);
    process.exit(1);
});