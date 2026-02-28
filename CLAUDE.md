# mathjokes — Claude Context

## What this app does
Generates printable math worksheet PDFs where students solve math problems to decode a joke answer. Each solved problem's answer is a "code number" that maps to a letter in the joke's punchline.

## File map
| File | Role |
|------|------|
| `index.html` | UI: two dropdowns (Problem Type, Joke), 3-example preview, generate button |
| `css/styles.css` | App-specific styles (builds on `css/base.css`) |
| `js/jokes.js` | Data: joke objects `{id, filename, joke_q, joke_a, is_prod}`; also exports `prodJokes` |
| `js/worksheet.js` | Logic: PROBLEM_SUBTYPES, createProblemList, createAnswerDict, generateWorksheetPDF |
| `js/app.js` | UI controller: reads DOM, populates joke dropdown, wires events, calls worksheet.js |

Script load order in index.html is critical: `utils.js → jokes.js → worksheet.js → app.js`

## Key architecture: PROBLEM_SUBTYPES
`worksheet.js` exports a single object `PROBLEM_SUBTYPES` with 42 entries (no sliders).
Each entry: `{ category, label, sign, fontSize, generate() → [{first, second, answer}] }`

Categories and entry counts:
- **Addition** (11): single-digit, small-addends (+1/2/3), teen numbers, add-ten, add-tens,
  1digit+2digit, doubles, near-doubles, 2digit+2digit (no regroup), 2digit+2digit (regroup),
  multiples-of-ten
- **Subtraction** (8): single-digit, small-amounts (-1/2/3), teen numbers, subtract-ten,
  1digit-from-2digit, 2digit-2digit (no regroup), 2digit-2digit (regroup), from-100
- **Multiplication** (12): by-2 through by-12, plus mixed
- **Division** (11): by-2 through by-12

Private helpers: `_multiplicationTable(n)` and `_divisionTable(n)` (used inside worksheet.js only).

## Key functions
- `createProblemList(subtypeKey)` — delegates to `PROBLEM_SUBTYPES[subtypeKey].generate()`
- `getSampleProblems(problemList, sign, count=3)` — returns formatted equation strings for preview
- `createAnswerDict(jokeAnswer, problemList)` — maps each letter to a unique problem by answer value
- `generateWorksheetPDF(jokeData, answerDict, subtypeKey)` — builds PDF via jsPDF, triggers download

## Joke production flag (`is_prod`)

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

**To add a new draft joke:** add it to the `jokes` array with `is_prod: false`. It will be invisible in the app until promoted.

## app.js flow
1. `populateJokeSelect()` — appends one `<option>` per **production** joke to `#joke-select` from `prodJokes`
2. `updateExamples()` — called on load + dropdown change; shows 3 sample equations
3. `handleGenerate()` — reads `subtypeKey` + `jokeId` ("random" or numeric id string), generates PDF
4. Joke resolution: `jokeId === 'random'` → `randomChoice(prodJokes)`, else `prodJokes.find(j => String(j.id) === jokeId)`

## PDF layout (jsPDF, US Letter, mm units, portrait)
- Section A: Name/Date header
- Section B: Joke question (word-wrapped)
- Section C: Decode row — blank boxes with code numbers below
- Section D: Shuffled math problems in 4-column grid (stacked: first / sign+second / underline / letter label)

## Dependencies
- `css/base.css` — CSS variables, reset, utility classes (`.u-hidden`, `.u-text-sm`, etc.)
- `js/utils.js` — `randomChoice`, `shuffleArray`, `clamp`, `getById`, `showElement`, `hideElement`

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
