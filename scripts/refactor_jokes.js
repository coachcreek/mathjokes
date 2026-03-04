/**
 * scripts/refactor_jokes.js
 *
 * One-time refactoring script for jokes.js:
 *   1. Adds an answer_length field to each joke (count of alphabetic chars in joke_a).
 *   2. Shuffles the array into a random order (removing the sort-by-length structure).
 *   3. Reassigns sequential id values starting at 1.
 *   4. Removes the "// N alpha chars" section comments.
 *   5. Writes the result back to js/jokes.js.
 *
 * Run once with:  node scripts/refactor_jokes.js
 *
 * HOW PARSING WORKS:
 *   jokes.js uses both single-quoted and double-quoted strings for joke_q
 *   (double quotes are used when the question contains an apostrophe, e.g.
 *   "What's the smartest insect?"). A simple single-quote regex misses those.
 *
 *   Instead, we use Node's built-in "vm" module to actually evaluate the
 *   jokes array in a sandbox. The vm module lets us run a snippet of JS code
 *   and read the result, without needing to import the whole file or allow
 *   dangerous globals.
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ── 1. Load and evaluate the jokes array ─────────────────────────────────────

const jokesPath = path.join(__dirname, '..', 'js', 'jokes.js');
const src = fs.readFileSync(jokesPath, 'utf8');

// Extract just the array literal (the part between "const jokes = [" and the
// closing "];" that ends the array). We run that as a JS expression inside
// a vm sandbox so we get real objects back, handling both quote styles.
const arrayMatch = src.match(/const jokes\s*=\s*(\[[\s\S]*?\]);/);
if (!arrayMatch) {
    console.error('Could not find "const jokes = [...];" in the file.');
    process.exit(1);
}

const arraySource = arrayMatch[1];

// vm.runInNewContext evaluates an expression in an isolated context.
// We don't pass any globals, so the code has no access to the file system
// or Node built-ins — it can only return a plain value.
let jokes;
try {
    jokes = vm.runInNewContext('(' + arraySource + ')');
} catch (e) {
    console.error('Failed to parse jokes array:', e.message);
    process.exit(1);
}

console.log(`Parsed ${jokes.length} jokes.`);

// ── 2. Add answer_length field ────────────────────────────────────────────────

// Count only alphabetic characters (a–z, A–Z).
// Spaces, punctuation, hyphens, digits are all excluded.
function alphaLength(str) {
    return (str.match(/[a-zA-Z]/g) || []).length;
}

jokes.forEach(j => {
    j.answer_length = alphaLength(j.joke_a);
});

// Sanity-check a few known values against the original section comments
const checks = [
    { filename: 'fish_schools',       expected: 17 },  // "They Live in Schools"
    { filename: 'bathroom_instrument',expected: 15 },  // "A Tuba Toothpaste"
    { filename: 'banana_doctor',      expected: 14 },  // "Not Peeling Well"
    { filename: 'alligator_vest',     expected: 12 },  // "Investigator"
    { filename: 'aardvark_feet',      expected:  9 },  // "A Yardvark"
    { filename: 'astronaut_computer', expected: 11 },  // "The Space Bar" (11 alpha, original section comment was wrong)
    { filename: 'bee_mind',           expected:  7 },  // "A Maybee"
    { filename: 'boomerang',          expected:  6 },  // "A Stick"
    { filename: 'shorter_add',        expected:  5 },  // "Short"
];
let allOk = true;
checks.forEach(({ filename, expected }) => {
    const j = jokes.find(x => x.filename === filename);
    if (!j) { console.error(`  MISSING: ${filename}`); allOk = false; return; }
    if (j.answer_length !== expected) {
        console.error(`  MISMATCH ${filename}: got ${j.answer_length}, expected ${expected}`);
        allOk = false;
    }
});
if (!allOk) { console.error('Spot checks FAILED — aborting.'); process.exit(1); }
console.log('answer_length spot-checks: all passed.');

// ── 3. Shuffle the array (Fisher-Yates) ──────────────────────────────────────

// Math.random() is fine here — we just want a non-predictable order.
// This is a one-time operation so reproducibility is not needed.
for (let i = jokes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [jokes[i], jokes[j]] = [jokes[j], jokes[i]];
}

// ── 4. Reassign sequential ids (1-based) ─────────────────────────────────────

jokes.forEach((j, idx) => { j.id = idx + 1; });

// ── 5. Format each joke as a single source line ───────────────────────────────

// We quote every string with single quotes. If a string contains a single
// quote we escape it. If it contains a double quote (unlikely) we leave it.
function sq(str) {
    return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

// Pad a string to a fixed width (for alignment)
function pad(str, width) { return str.padEnd(width); }

// Format each joke on one line, keeping the same column style as the original.
// answer_length is appended as the last field.
const jokeLines = jokes.map(j => {
    const idStr       = String(j.id).padStart(7);
    const filenameStr = pad(sq(j.filename) + ',', 36);
    const qStr        = sq(j.joke_q);
    const aStr        = sq(j.joke_a);
    const prodStr     = String(j.is_prod);
    const lenStr      = String(j.answer_length);

    return (
        `    { id: ${idStr}, ` +
        `filename: ${filenameStr} ` +
        `joke_q: ${qStr}, ` +
        `joke_a: ${aStr}, ` +
        `is_prod: ${prodStr}, ` +
        `answer_length: ${lenStr} }`
    );
});

// ── 6. Build the new file, preserving the header and prodJokes footer ─────────

// Grab the file comment block (everything up to and including "const jokes = [")
const headerEnd   = src.indexOf('const jokes = [') + 'const jokes = ['.length;
let header = src.slice(0, headerEnd);

// Update the sort-order description in the header comment
header = header.replace(
    /\* SORT ORDER:.*\n \* \(spaces and punctuation excluded from the count\)\.\n/s,
    '* SORT ORDER: Random (shuffled). The sort-by-length section comments have been\n' +
    ' * removed. Each joke carries an answer_length field (count of alphabetic\n' +
    ' * characters in joke_a, spaces and punctuation excluded) so callers can\n' +
    ' * filter or sort by difficulty without needing to recount.\n'
);

// Add the answer_length field to the JSDoc property list, right after is_prod
header = header.replace(
    /( \*   is_prod\s+\{boolean\}.*\n.*\n.*\n)/,
    '$1' +
    ' *   answer_length {number}  — Number of alphabetic characters in joke_a\n' +
    ' *                        (spaces, punctuation, hyphens not counted).\n'
);

// Grab the prodJokes declaration block (everything after the closing "];" of
// the array, starting from the blank line before the "/**" comment)
const arrayEnd   = src.indexOf('];') + 2;   /* position just after "];" */
const footer     = src.slice(arrayEnd);      /* "\n\n/**\n * prodJokes …" */

// Assemble the new file
const newFile =
    header + '\n' +
    jokeLines.join(',\n') + ',\n' +
    ']' +
    footer;

// ── 7. Write output ───────────────────────────────────────────────────────────

fs.writeFileSync(jokesPath, newFile, 'utf8');
console.log(`Written ${jokes.length} jokes to ${jokesPath}`);
console.log('Next step: run  npm run build  to rebuild dist/js/jokes.js');
