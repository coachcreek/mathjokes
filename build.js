/**
 * build.js — Minification build script for Math Jokes Worksheet Generator
 *
 * WHAT THIS DOES:
 *   1. Reads each JavaScript source file from js/, minifies it using Terser,
 *      and writes the compact version to dist/js/.
 *
 *   2. Reads index.src.html (the human-readable source), minifies it using
 *      html-minifier-terser, and writes the result to index.html.
 *
 *   "Minification" means:
 *     • All HTML/JS/CSS comments are stripped.
 *     • Unnecessary whitespace and line breaks are removed.
 *     • JS variable names inside <script> tags are shortened (a, b, c…).
 *     • The result is very hard to read in View Source.
 *
 * WHAT THIS DOES NOT DO:
 *   Minification is not true encryption. Anyone determined enough can use a
 *   "beautifier" tool to reformat the output, though the meaningful comments
 *   and variable names will be permanently gone.
 *   For a free educational tool like this, minification is the right tradeoff.
 *
 * SOURCE FILES (edit these):
 *   js/*.js        — JavaScript source; minified to dist/js/
 *   index.src.html — HTML source; minified to index.html
 *   css/*.css      — Not minified (CSS is already compact; add css-minifier if desired)
 *
 * HOW TO RUN:
 *   1. Install dependencies once:   npm install
 *   2. Build the dist/ files:       npm run build
 *   3. Deploy the whole project root to your web host (Cloudflare reads wrangler.jsonc).
 *
 * DEVELOPMENT WORKFLOW:
 *   • Edit JS in js/*.js — run `npm run build` to update dist/js/ after changes.
 *   • Edit HTML in index.src.html — run `npm run build` to update index.html after changes.
 *   • NEVER edit index.html directly — it is overwritten by every build.
 *   • Commit both the source file AND the rebuilt output file together.
 *
 * DEPENDENCIES:
 *   - terser (npm package): JS minifier. Docs: https://terser.org/
 *   - html-minifier-terser (npm package): HTML minifier. Maintained fork of
 *     the classic html-minifier, compatible with modern HTML5.
 *     Installed via: npm install (reads package.json).
 */

const fs   = require('fs');
const path = require('path');

/* ------------------------------------------------------------------ */
/* Load terser (JS minifier)                                           */
/* ------------------------------------------------------------------ */

/* We require both tools dynamically so we can give a helpful error if either
   is not installed yet (instead of a cryptic "Cannot find module" message). */
let minifyJS;
try {
    ({ minify: minifyJS } = require('terser'));
} catch (e) {
    console.error(
        '\n  ERROR: terser is not installed.\n' +
        '  Run:  npm install\n' +
        '  Then: npm run build\n'
    );
    process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Load html-minifier-terser (HTML minifier)                           */
/* ------------------------------------------------------------------ */

let minifyHTML;
try {
    ({ minify: minifyHTML } = require('html-minifier-terser'));
} catch (e) {
    console.error(
        '\n  ERROR: html-minifier-terser is not installed.\n' +
        '  Run:  npm install\n' +
        '  Then: npm run build\n'
    );
    process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Paths                                                               */
/* ------------------------------------------------------------------ */

/* Source directory: where your human-readable JS files live */
const SRC_DIR  = path.join(__dirname, 'js');

/* Output directory: where minified JS files will be written */
const DIST_DIR = path.join(__dirname, 'dist', 'js');

/*
   The JS files to minify, in the order they must be loaded.
   (This list also documents which files are part of the production build.)
   The candidate joke files are NOT included — they are development-only drafts.
*/
const FILES_TO_MINIFY = [
    'utils.js',
    'jokes.js',
    'worksheet.js',
    'app.js',
];

/* ------------------------------------------------------------------ */
/* Main build function                                                 */
/* ------------------------------------------------------------------ */

/**
 * Runs through FILES_TO_MINIFY, minifies each one, writes to dist/js/.
 * Then minifies index.src.html and writes the result to index.html.
 * Uses async/await so we can use the Promise-based minifier APIs cleanly.
 */
async function build() {

    /* Create the JS output directory if it does not exist yet.
       { recursive: true } means it won't throw an error if it already exists. */
    fs.mkdirSync(DIST_DIR, { recursive: true });

    let anyErrors = false;

    /* ---- Step 1: Minify JS files ---- */
    console.log('\nMinifying JavaScript...');

    for (const filename of FILES_TO_MINIFY) {
        const srcPath  = path.join(SRC_DIR, filename);
        const distPath = path.join(DIST_DIR, filename);

        /* Read the source file */
        let sourceCode;
        try {
            sourceCode = fs.readFileSync(srcPath, 'utf8');
        } catch (e) {
            console.error(`  SKIP  ${filename}  (could not read: ${e.message})`);
            anyErrors = true;
            continue;
        }

        /* Minify with Terser.
           Options used:
             compress: true  — enable dead-code removal and optimisation
             mangle: true    — rename local variables to short names (a, b, c…)
             format.comments: false  — strip ALL comments from the output
        */
        let result;
        try {
            result = await minifyJS(sourceCode, {
                compress: true,
                mangle:   true,
                format: {
                    comments: false,   /* Remove all comments */
                },
            });
        } catch (e) {
            console.error(`  ERROR ${filename}: ${e.message}`);
            anyErrors = true;
            continue;
        }

        /* Write the minified output */
        fs.writeFileSync(distPath, result.code, 'utf8');

        /* Show a simple size comparison so you can see the savings */
        const origKB = (sourceCode.length  / 1024).toFixed(1);
        const miniKB = (result.code.length / 1024).toFixed(1);
        console.log(`  OK    ${filename.padEnd(16)}  ${origKB.padStart(6)} KB  →  ${miniKB.padStart(6)} KB`);
    }

    /* ---- Step 2: Minify HTML ---- */
    console.log('\nMinifying HTML...');

    const htmlSrcPath  = path.join(__dirname, 'index.src.html');
    const htmlDistPath = path.join(__dirname, 'index.html');

    let htmlSource;
    try {
        htmlSource = fs.readFileSync(htmlSrcPath, 'utf8');
    } catch (e) {
        console.error(`  SKIP  index.src.html  (could not read: ${e.message})`);
        anyErrors = true;
    }

    if (htmlSource) {
        let minifiedHTML;
        try {
            /*
               html-minifier-terser options:
                 collapseWhitespace        — removes spaces/newlines between tags
                 removeComments            — strips <!-- HTML comments -->
                 removeRedundantAttributes — removes attributes equal to their default
                                             (e.g. type="text" on <input>)
                 removeEmptyAttributes     — removes attributes with empty string values
                 minifyCSS                 — minifies any inline <style> blocks
                 minifyJS                  — minifies any inline <script> blocks
                                             (uses Terser under the hood)

               We intentionally do NOT set removeAttributeQuotes because it can
               cause subtle parsing bugs with some attribute values.
            */
            minifiedHTML = await minifyHTML(htmlSource, {
                collapseWhitespace:        true,
                removeComments:            true,
                removeRedundantAttributes: true,
                removeEmptyAttributes:     true,
                minifyCSS:                 true,
                minifyJS:                  true,
            });
        } catch (e) {
            console.error(`  ERROR index.src.html: ${e.message}`);
            anyErrors = true;
        }

        if (minifiedHTML) {
            fs.writeFileSync(htmlDistPath, minifiedHTML, 'utf8');
            const origKB = (htmlSource.length    / 1024).toFixed(1);
            const miniKB = (minifiedHTML.length  / 1024).toFixed(1);
            console.log(`  OK    ${'index.html'.padEnd(16)}  ${origKB.padStart(6)} KB  →  ${miniKB.padStart(6)} KB`);
        }
    }

    /* ---- Done ---- */
    if (anyErrors) {
        console.error('\nBuild completed with errors. Check the messages above.\n');
        process.exit(1);
    } else {
        console.log(`\nBuild complete.\n  dist/js/  — minified JS\n  index.html — minified HTML (source: index.src.html)\n`);
    }
}

build();
