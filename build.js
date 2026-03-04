/**
 * build.js — Minification build script for Math Jokes Worksheet Generator
 *
 * WHAT THIS DOES:
 *   Reads each JavaScript source file from js/, minifies it using Terser,
 *   and writes the compact version to dist/js/.
 *
 *   "Minification" means:
 *     • All comments are stripped (the verbose educational comments disappear).
 *     • Variable names are shortened to single letters (a, b, c…).
 *     • Whitespace and line breaks are removed.
 *     • The result is a single dense line of code that is very hard to read.
 *
 * WHAT THIS DOES NOT DO:
 *   Minification is not true encryption. Anyone determined enough can use a
 *   "beautifier" tool to reformat the output into readable code, though the
 *   meaningful comments and variable names will be permanently gone.
 *   For a free educational tool like this, minification is the right tradeoff:
 *   it discourages casual copying while keeping the project simple.
 *
 * HOW TO RUN:
 *   1. Install dependencies once:   npm install
 *   2. Build the dist/ files:       npm run build
 *   3. Deploy the dist/ folder (or the whole project root) to your web host.
 *
 * DEVELOPMENT WORKFLOW:
 *   • Edit source files in js/ — these are the human-readable versions.
 *   • Run `npm run build` whenever you want to update the minified output.
 *   • The live site (index.html) always loads from dist/js/.
 *   • To test changes locally without rebuilding, temporarily edit index.html
 *     to point to js/ instead of dist/js/ — just remember to rebuild and
 *     switch back before deploying.
 *
 * DEPENDENCIES:
 *   - terser (npm package): the industry-standard JS minifier.
 *     Installed via: npm install (reads package.json).
 *     Docs: https://terser.org/
 */

const fs   = require('fs');
const path = require('path');

/* We require terser dynamically so we can give a helpful error if it isn't
   installed yet (instead of a cryptic "Cannot find module" message). */
let minify;
try {
    ({ minify } = require('terser'));
} catch (e) {
    console.error(
        '\n  ERROR: terser is not installed.\n' +
        '  Run:  npm install\n' +
        '  Then: npm run build\n'
    );
    process.exit(1);
}

/* ------------------------------------------------------------------ */

/* Source directory: where your human-readable JS files live */
const SRC_DIR  = path.join(__dirname, 'js');

/* Output directory: where minified files will be written */
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

/**
 * Main build function.
 * Runs through FILES_TO_MINIFY, minifies each one, and writes the result.
 * Uses async/await so we can use terser's Promise-based API cleanly.
 */
async function build() {

    /* Create the output directory if it does not exist yet.
       { recursive: true } means it won't throw an error if it already exists. */
    fs.mkdirSync(DIST_DIR, { recursive: true });

    let anyErrors = false;

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
            result = await minify(sourceCode, {
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
        const origKB = (sourceCode.length   / 1024).toFixed(1);
        const miniKB = (result.code.length  / 1024).toFixed(1);
        console.log(`  OK    ${filename.padEnd(16)}  ${origKB.padStart(6)} KB  →  ${miniKB.padStart(6)} KB`);
    }

    if (anyErrors) {
        console.error('\nBuild completed with errors. Check the messages above.\n');
        process.exit(1);
    } else {
        console.log(`\nBuild complete. Minified files are in: dist/js/\n`);
    }
}

build();
