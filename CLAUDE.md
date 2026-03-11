# mathjokes — Claude Context

## What this app does
Generates printable math worksheet PDFs where students solve math problems to decode a joke answer. Each solved problem's answer is a "code number" that maps to a letter in the joke's punchline.

## File map
| File | Role |
|------|------|
| `index.src.html` | **Editable** HTML source — all comments, readable markup. Edit this. |
| `index.html` | **Build output** — minified by `npm run build`. Do NOT edit directly. |
| `css/styles.css` | App-specific styles (builds on `css/base.css`) |
| `js/jokes.js` | Data: joke objects `{id, filename, joke_q, joke_a, is_prod}`; also exports `prodJokes` |
| `js/worksheet.js` | Logic: PROBLEM_SUBTYPES, createProblemList, createAnswerDict, generateWorksheetPDF |
| `js/app.js` | UI controller: reads DOM, populates joke dropdown, wires events, calls worksheet.js |

Script load order in index.html is critical: `utils.js → jokes.js → worksheet.js → app.js`

## Key architecture: PROBLEM_SUBTYPES
`worksheet.js` exports a single object `PROBLEM_SUBTYPES` with 46 entries (no sliders).
Each entry: `{ category, label, sign, fontSize, generate() → [{first, second, answer}] }`

Categories and entry counts:
- **Addition** (11): single-digit, small-addends (+1/2/3), teen numbers, add-ten, add-tens,
  1digit+2digit, doubles, near-doubles, 2digit+2digit (no regroup), 2digit+2digit (regroup),
  multiples-of-ten
- **Subtraction** (8): single-digit, small-amounts (-1/2/3), teen numbers, subtract-ten,
  1digit-from-2digit, 2digit-2digit (no regroup), 2digit-2digit (regroup), from-100
- **Multiplication** (16): by-2 through by-12, mixed, 1digit×2digit, 2digit×2digit,
  by-multiples-of-10, perfect-squares
- **Division** (11): by-2 through by-12

### Notes on new multiplication subtypes (added 2026-03-02)
- `multiplication-1digit-2digit`: first=2–9, second=12–99; fontSize 14; large answer pool
- `multiplication-2digit-2digit`: both 11–49, first≥second (larger on top); fontSize 14; large pool
- `multiplication-by-multiples-of-10`: first=2–9, second=10/20/…/90; fontSize 16; 72 unique answers
- `multiplication-perfect-squares`: n×n for n=1–12; 12 unique answers (1,4,9,…,144)

### Decimal multiplication — intentionally omitted
Decimal answers (e.g. 0.4 × 0.3 = 0.12) would appear as the code numbers in the decode
grid. Matching fractional codes to boxes is confusing for students. Deferred until a
dedicated display format for non-integer codes is designed.

Private helpers: `_multiplicationTable(n)` and `_divisionTable(n)` (used inside worksheet.js only).

## Key functions
- `createProblemList(subtypeKey)` — delegates to `PROBLEM_SUBTYPES[subtypeKey].generate()`
- `getSampleProblems(problemList, sign, count=3)` — returns formatted equation strings for preview
- `createAnswerDict(jokeAnswer, problemList)` — maps each letter to a unique problem by answer value
- `generateWorksheetPDF(jokeData, answerDict, subtypeKey)` — builds PDF via jsPDF, triggers download

## Joke object fields (updated 2026-03-03)

Each joke object in `jokes.js` has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Sequential integer (1, 2, 3 …). Reassigned after every shuffle. |
| `filename` | string | URL-safe slug used to name the downloaded PDF file. |
| `joke_q` | string | The question shown on the worksheet. |
| `joke_a` | string | The answer used to build the decode grid. |
| `is_prod` | boolean | `true` = approved for production; `false` = draft/invisible. |
| `answer_length` | number | Count of **alphabetic** characters in `joke_a` (spaces, hyphens, punctuation excluded). Tells you how many unique letter-codes the joke needs. |

### `answer_length` field
Added 2026-03-03. Computed by `scripts/refactor_jokes.js` and stored on each joke so
callers can filter by difficulty without re-counting. For example, a joke with
`answer_length: 8` needs 8 unique math-problem answers — any subtype with fewer than 8
distinct answer values will hit the fallback path in `createAnswerDict()`.

### `is_prod` flag

Every joke object in `jokes.js` has an `is_prod` boolean field:
- `true`  — fully reviewed and approved; the joke **will** appear in the app
- `false` — draft / candidate; the joke is **invisible** to the app

At the bottom of `jokes.js`, a second variable `prodJokes` is declared:
```js
const prodJokes = jokes.filter(joke => joke.is_prod);
```
`app.js` uses `prodJokes` everywhere (dropdown population, random pick, id lookup).
The full `jokes` array is kept in the file purely as a master list for future editing.

**To promote a draft joke to production:** set `is_prod: true` in `jokes.js`. No other files need to change.

### Sort order and IDs

The `jokes` array is in **random order** (shuffled by `scripts/refactor_jokes.js`).
IDs are sequential integers starting at 1, matching the array position after shuffling.
Do **not** rely on IDs being stable across reshuffles — use `filename` as the stable
identifier if you need to reference a specific joke persistently.

### Adding or editing jokes

1. Add a new entry anywhere in the array in `jokes.js` with `is_prod: false` and a
   unique `filename`. Set `answer_length` manually by counting alphabetic chars in `joke_a`,
   or run `node scripts/refactor_jokes.js` to recompute it (and reshuffle + renumber).
2. When ready to publish, set `is_prod: true`.
3. Run `npm run build` to update `dist/js/jokes.js`.

**Note:** Running `scripts/refactor_jokes.js` reshuffles the whole array and reassigns
all IDs. This is intentional — bookmarked joke IDs in `localStorage` (or URLs) will
silently fall back to a random joke, which is acceptable for this use case.

**To add a new draft joke:** add it to the `jokes` array with `is_prod: false`. It will be invisible in the app until promoted.

## app.js flow
1. `populateJokeCombobox()` — builds one `<li role="option">` per **production** joke into `#joke-combobox-listbox` from `prodJokes`
2. `updateExamples()` — called on load + dropdown change; shows 3 sample equations
3. `handleGenerate()` — reads `subtypeKey` + `jokeId` ("random" or numeric id string), generates PDF
4. Joke resolution: `jokeId === 'random'` → `randomChoice(prodJokes)`, else `prodJokes.find(j => String(j.id) === jokeId)`

## Joke selector — custom combobox (added 2026-03-06)

The "Choose a Joke" control is a **fully custom combobox** widget, not a native `<select>`.
It was introduced to replicate the Streamlit `selectbox` soft-key search experience:
clicking the control opens a panel with an integrated search field at the top, and
typing filters the list in real time — no separate search box is needed.

### HTML structure (in `index.src.html`)
```
div.joke-combobox#joke-combobox               ← position: relative anchor
  button.joke-combobox__trigger#joke-combobox-trigger  ← shows selected label
    span.joke-combobox__trigger-text           ← label text (updated by JS)
    span.joke-combobox__arrow                  ← decorative chevron (CSS only)
  div.joke-combobox__panel#joke-combobox-panel [hidden]  ← floating panel
    input.joke-combobox__search#joke-combobox-search     ← auto-focused on open
    ul.joke-combobox__list#joke-combobox-listbox[role="listbox"]
      li.joke-combobox__option[role="option"]  ← one per joke (built by JS)
input[type="hidden"]#joke-value               ← machine-readable selected value
```

### Key JS functions (all in `app.js`)
| Function | Purpose |
|----------|---------|
| `populateJokeCombobox()` | Builds `<li>` options from `prodJokes`; called once on load |
| `openCombobox()` | Shows panel, clears search, auto-focuses search input |
| `closeCombobox()` | Hides panel, returns focus to trigger |
| `filterCombobox(query)` | Hides/shows `<li>` items based on `data-search` attribute |
| `selectOption(li)` | Writes value to `#joke-value`, updates trigger label, sets `aria-selected` |
| `highlightOption(index, visibleOptions)` | Keyboard navigation highlight (does NOT select) |
| `getVisibleOptions()` | Returns array of non-hidden `<li>` elements for keyboard nav |

### State
- `jokeValueEl.value` (`#joke-value`) — machine-readable selected value: `"random"` or a numeric id string. `getFormValues()` reads this.
- `jokeComboboxText.textContent` — human-readable label shown on the trigger button.
- `jokeComboboxPanel.hidden` — `true` = closed, `false` = open.
- `activeIndex` — integer; index of keyboard-highlighted item in `getVisibleOptions()` array. `-1` = none.

### Interaction model
- **Click trigger** → opens panel, auto-focuses search input
- **Type** → `filterCombobox()` hides non-matching options in real time
- **Arrow keys** → `highlightOption()` moves a visual highlight without selecting
- **Enter** → selects highlighted option (or the only visible option if just one remains)
- **Escape / Tab** → closes panel without changing selection
- **Click option** → `mousedown` handler (not `click`) selects and closes; `mousedown` is used so it fires before `blur` on the search input, preventing the panel from closing before the click registers
- **Click outside / blur** → `document mousedown` + delayed blur listener closes panel

### ARIA pattern
Follows W3C ARIA 1.2 combobox pattern:
- trigger: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`
- list: `role="listbox"`
- items: `role="option"`, `aria-selected`, unique `id` (for `aria-activedescendant`)

### CSS classes (in `css/styles.css`)
| Class | Purpose |
|-------|---------|
| `.joke-combobox` | Wrapper; `position: relative` anchors the panel |
| `.joke-combobox__trigger` | Styled like `.form-select`; shows selected label + SVG arrow |
| `.joke-combobox__trigger-text` | `flex: 1`, `overflow: hidden`, `text-overflow: ellipsis` |
| `.joke-combobox__panel` | Absolutely positioned; `z-index: 100`; `display: flex; flex-direction: column` |
| `.joke-combobox__search` | Search input at top of panel; `border-bottom` divider |
| `.joke-combobox__list` | `overflow-y: auto; max-height: 260px` |
| `.joke-combobox__option` | Individual row; hover highlight via `background-color` |
| `.joke-combobox__option--active` | Keyboard-navigation highlight (blue bg, white text) |
| `.joke-combobox__option[aria-selected="true"]` | Selected item accent (bold + left border) |

### Known bugs fixed (2026-03-10)

**Bug 1 — Two "Choose a Joke" controls visible at once**
Root cause: `.joke-combobox__panel` in `styles.css` has `display: flex`. The
browser's built-in `[hidden]` rule is only `display: none` (no `!important`),
so the panel's `display: flex` CSS rule overrides it and the panel is ALWAYS
visible on screen, even when the JS sets `jokeComboboxPanel.hidden = true`.

Fix: added `[hidden] { display: none !important; }` to `css/base.css` (CSS
reset section). The `!important` ensures `[hidden]` wins over any other
`display` rule in the app's own styles. This is a standard CSS reset pattern
that browsers themselves should enforce but don't always do reliably.

**Bug 2 — Dropdown stays open when clicking elsewhere**
Apparent root cause: once Bug 1 was fixed and the panel could actually hide,
this bug disappeared for the "visible panel" case. However, the previous
`closeCombobox()` always called `jokeComboboxTrigger.focus()`, which stole
focus from whatever the user had clicked. This was fixed by adding a
`returnFocus` parameter to `closeCombobox()`:
- Pass `true` when closing via keyboard (Enter, Escape) — focus returns to
  trigger, keeping keyboard nav predictable.
- Omit (or pass `false`) when closing via mouse click — focus stays on
  whatever the user clicked.
- Tab key: also omit — browser moves focus forward naturally.

### If you need to replace this with a library
The widget is deliberately self-contained vanilla JS (~180 lines) with no dependencies.
If the joke list grows very large (thousands of entries), consider replacing it with a
library such as [Choices.js](https://github.com/Choices-js/Choices) or
[Tom Select](https://tom-select.js.org/), which add virtual scrolling and fuzzy matching.

## PDF layout (jsPDF, US Letter, mm units, portrait)
- Section A: Name/Date header (Times, normal, 12pt)
- Section B: Joke question (Times, bold, 14pt, word-wrapped)
- Section C: Decode row — blank boxes with code numbers below
- Section D: Shuffled math problems in 4-column grid (stacked: first / sign+second / underline / letter label)
- Section E: Footer — "mathjokes.org" centred at PAGE_H−6 mm, same font as header (Times, normal, 12pt). Loops over all pages so multi-page worksheets get the footer on every page.
- Section F: `doc.save(filename)` — triggers browser download

## Dependencies
- `css/base.css` — CSS variables, reset, utility classes (`.u-hidden`, `.u-text-sm`, etc.)
- `js/utils.js` — `randomChoice`, `shuffleArray`, `clamp`, `getById`, `showElement`, `hideElement`

## SEO and deployment files (added 2026-03-02)
Files at the project root:
- `robots.txt` — permits all crawlers, references sitemap
- `sitemap.xml` — single-URL sitemap for `https://mathjokes.org/`
- `favicon.png` — site icon; referenced with a **relative** path (`favicon.png`, not `/favicon.png`)
  so it resolves correctly both locally (file://) and on the live domain.

Tags added to `<head>` in `index.html`:
- `<meta name="description">` — search result snippet (~160 chars)
- `<link rel="canonical">` — canonical URL to prevent duplicate-content issues
- Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`) — social sharing previews
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`)
- `<link rel="icon">` — favicon (relative path)
- `<script type="application/ld+json">` — schema.org `SoftwareApplication` + `EducationalApplication`

## Build system (added 2026-03-03)

The app uses a simple one-step minification build so the deployed site does not expose
the verbose source comments to casual View-Source readers.

### Files
| File | Purpose |
|------|---------|
| `package.json` | Lists `terser` as a dev dependency; defines `npm run build` |
| `build.js` | Node script that reads `js/*.js`, minifies with Terser, writes to `dist/js/` |
| `dist/js/` | **Generated output — must be committed to git** (see bug note below) |
| `.gitignore` | Excludes `node_modules/` only — `dist/` is intentionally tracked |

### Workflow
```
npm install        # first time only — installs Terser into node_modules/
npm run build      # minifies js/*.js → dist/js/  (run after every JS change)
git add dist/      # stage the updated minified files
git commit         # commit them alongside the source change
```

### IMPORTANT — why dist/ must be committed (bug fixed 2026-03-04)

A previous developer added `dist/` to `.gitignore` on the assumption that generated
files should not be version-controlled. That is normally good practice, **but it
breaks this deployment.**

Here is why:

- `index.html` loads scripts from `dist/js/` (e.g. `<script src="dist/js/app.js">`).
- Cloudflare deploys the repository as-is (via `wrangler.jsonc`).
- If `dist/` is gitignored, the minified files are never pushed to the repo, so
  Cloudflare never has them, so the browser gets a 404 for every script tag.
- The site loads, but none of the JavaScript runs, and the worksheet generator is broken.

**The fix:** `dist/` was removed from `.gitignore`. The minified `dist/js/` files
are now committed and deployed just like any other asset file (CSS, images, etc.).

**Rule of thumb for this project:** after any edit to a `js/*.js` file, always run
`npm run build` and commit *both* the source change and the updated `dist/js/` file
in the same commit. That way the two are always in sync.

### What gets minified
`utils.js`, `jokes.js`, `worksheet.js`, `app.js` — in that load order.
The candidate joke files (`new_joke_candidates_*.js`) are **not** included; they are
development-only drafts and are never loaded by `index.html`.

### HTML minification
`index.src.html` is the editable source (with all comments and readable formatting).
The build minifies it and overwrites `index.html`. **Never edit `index.html` directly** —
your changes will be lost the next time `npm run build` is run.

### index.html script tags
`index.src.html` (and thus the built `index.html`) loads scripts from `dist/js/` (not `js/`).
During local development, you can temporarily change `dist/js/` → `js/` in the four
`<script src=…>` tags in `index.src.html` for quick testing without rebuilding, then
switch back and run `npm run build` before deploying.

### Minification caveats
- Terser strips comments and shortens variable names but does NOT encrypt the code.
  A determined user with a JS beautifier can still read the logic.
  For this free educational tool, "discourages casual copying" is sufficient.
- `PROBLEM_SUBTYPES` key strings (e.g. `'multiplication-by-7'`) and `id` strings
  (e.g. `'problem-type'`) are NOT mangled because they are string literals, not
  variable names. That is intentional — they must stay readable at runtime.

## Problem Type persistence (added 2026-03-03)

`app.js` saves the last selected Problem Type to `localStorage` under the key
`'mathjokes_last_problem_type'`. On page load, it reads that key back and sets
the dropdown before calling `updateExamples()`.

Key functions in `app.js`:
- `saveProblemType()` — called on every `'change'` event of `#problem-type`
- `restoreProblemType()` — called once on `DOMContentLoaded`, before `updateExamples()`

Both functions wrap `localStorage` access in `try/catch` so the app works fine
if storage is unavailable (private/incognito mode with strict settings).

## Multiplication problem ordering in PDF (fixed 2026-03-03)

### The problem
For multiplication subtypes where `first < second` (e.g. ×10 table generates
`{first:1, second:10}`, `{first:2, second:10}` …; or `multiplication-1digit-2digit`
generates `{first:3, second:47}` …), the PDF was rendering with the smaller
single-digit number on TOP and the larger 2-digit number on BOTTOM — the reverse
of standard paper layout.

### The fix
In Section D of `generateWorksheetPDF()` (worksheet.js), before drawing the top
and bottom rows of each problem, we check:

```js
const isMultiply = (sign === '\u00D7');
const topNum = (isMultiply && entry.problem.second > entry.problem.first)
    ? entry.problem.second   // swap: put the larger number on top
    : entry.problem.first;   // normal: first stays on top
```

The `problem` object itself is **not mutated** — we just choose which value to print
in D1 (top row) vs D2 (bottom row). Multiplication is commutative so the answer
is unchanged.

### Affected subtypes
- `multiplication-by-10` — 1×10 through 9×10 have 1-digit on top without fix
- `multiplication-by-12` — 1×12 through 9×12 have 1-digit on top without fix
- `multiplication-1digit-2digit` — all problems (first=2–9, second=12–99) need swap
- `multiplication-mixed` — any pair where a < b needs swap
- `multiplication-by-multiples-of-10` — first=2–9, second=10–90; most need swap

## Addition problem ordering in PDF (fixed 2026-03-10)

Same convention as multiplication: the larger number goes on top.
Addition is commutative so swapping the display order does not change the answer.

**Exception:** `addition-single-digit` intentionally generates every ordered pair
(e.g. both 3+7 and 7+3), so the swap is deliberately skipped for that subtype.

### The fix
The existing multiplication swap logic in Section D of `generateWorksheetPDF()`
was extended to also cover addition subtypes (excluding `addition-single-digit`):

```js
const isMultiply    = (sign === '\u00D7');
const isAdditionSwap = (sign === '+' && subtypeKey !== 'addition-single-digit');
const shouldSwap    = (isMultiply || isAdditionSwap)
    && entry.problem.second > entry.problem.first;

const topNum = shouldSwap ? entry.problem.second : entry.problem.first;
```

The `botNum` mirror in D2 uses the same `shouldSwap` flag.

### Addition subtypes where a swap can occur
- `addition-add-ten` — `first` can be 1–9 (< second of 10)
- `addition-add-tens` — `first` (10–89) can be less than `second` (10–50 multiples)
- `addition-near-doubles` — `second` is always `first + 1` (one larger)
- `addition-2digit-no-regroup` — both 11–49; either order possible
- `addition-2digit-regroup` — both 11–49; either order possible
- `addition-multiples-of-ten` — both 10–90; either order possible

## Coding conventions
- Extensive educational comments throughout (user is learning JS/CSS)
- No emojis in code unless the user adds them to UI strings
- `/* global ... */` comments at top of app.js for cross-file globals
- Error display: write to `#error-text` (inner span), not `#error-message` (wrapper), to preserve the ⚠️ icon

## Layout and visual design notes

### Equal-height side-by-side cards (desktop)
`layout-grid` uses `align-items: stretch` (CSS Grid default) so the Worksheet Settings
and Example Problems cards are always the same height. Do NOT change this to
`align-items: start` — that would let the cards grow to their own content height and
break the symmetrical look.

### Font consistency — guiding principle
The page uses a deliberately reduced set of font treatments. When adding new UI text,
match one of these existing styles rather than introducing a new combination:

| Context | Size | Weight | Color |
|---------|------|--------|-------|
| Form labels / secondary explanations | `font-size-sm` (14px) | normal | `color-text-muted` |
| Primary body / example items | `font-size-md` (16px) | normal | `color-text` |
| Card titles | `font-size-xl` (20px) | bold | `color-text` |
| Page title / generate button | heading scale | bold | `color-text-inverse` (white) |

Specific choices made:
- `.form-label` — normal weight (not bold) to match the explanation paragraph in the
  Example Problems card.
- `.steps-list li` — `color-text-muted` to match that same explanation paragraph.
- `.btn-generate` — `font-size-xl` + `letter-spacing: 0.02em` + `line-height-tight`
  to echo the heading character of the title banner (both are bold white on blue).

### Mobile dropdown font size
CSS has limited control over native `<select>` pickers on mobile. Key finding:

- **Android Chrome**: the native dropdown dialog uses the font-size of the `<select>`
  element itself — `font-size` on `<option>`/`<optgroup>` is largely ignored by Chrome.
  To reduce text size in Android's dialog, you **must** set font-size on `.form-select`.
- **Firefox for Android**: does respect `font-size` on `<option>`/`<optgroup>`, so we
  set both the `<select>` and the options to `font-size-sm` (14px) in the mobile breakpoint.
- **iOS Safari**: shows a native OS wheel picker drawn entirely by the OS. No CSS affects
  the font size inside it. There is no CSS-only fix for iOS picker font size.

Known side-effect: iOS Safari auto-zooms any form element with font-size < 16px on tap.
With `font-size-sm` (14px) on `.form-select`, iOS zooms in ~14% on tap, then restores.
This is a minor visual bump accepted as a tradeoff for better Android readability.

If the iOS zoom must be eliminated, the only reliable option is replacing `<select>` with
a fully custom JavaScript-driven dropdown, giving complete CSS control over all platforms.
