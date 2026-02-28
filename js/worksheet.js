/**
 * worksheet.js — Math Jokes Worksheet Logic
 *
 * This file contains:
 *   1. PROBLEM_SUBTYPES — A catalogue of every supported math skill level,
 *                         organized by operation (Addition, Subtraction,
 *                         Multiplication, Division). Each entry knows its own
 *                         number ranges and how to generate valid problems.
 *   2. _multiplicationTable()  — Private helper used by all ×N subtypes.
 *   3. _divisionTable()        — Private helper used by all ÷N subtypes.
 *   4. createProblemList()     — Returns the full problem list for a subtype.
 *   5. getSampleProblems()     — Returns a small preview sample.
 *   6. createAnswerDict()      — Maps each letter of the joke answer to a
 *                               unique math problem (the "decode code").
 *   7. generateWorksheetPDF()  — Renders everything into a downloadable PDF
 *                               using the jsPDF library.
 *
 * HOW THE WORKSHEET WORKS (overview):
 *   Imagine the joke answer is "WATCH DOGS".
 *
 *   Step 1 — Assign codes:
 *     Each unique letter gets a unique math problem.
 *     The ANSWER to that problem is the letter's "code number".
 *       W → solve 35 + 13 = 48   (code 48)
 *       A → solve 25 +  8 = 33   (code 33)
 *       T → solve 72 + 15 = 87   (code 87)
 *       ... and so on.
 *
 *   Step 2 — Print the decode grid (top of worksheet):
 *     One blank box per letter (in order), code number below each box.
 *       ___  ___  ___  ___  ___  –  ___  ___  ___  ___
 *        48   33   87   21   56      19   72   44   11
 *     The "–" represents the space in "WATCH DOGS".
 *
 *   Step 3 — Print math problems (body of worksheet):
 *     Problems are shown in shuffled order (so the student can't just
 *     fill boxes left-to-right without doing the math).
 *           35       72       25       ...
 *         + 13     + 15     +  8       ...
 *         ────     ────     ────
 *            W        T        A
 *
 *   Student process:
 *     1. Solve "35 + 13" → get 48.
 *     2. See letter label "W" next to the problem.
 *     3. Find the box with "48" below it in the decode grid.
 *     4. Write "W" in that box.
 *     5. Repeat for all problems → the joke answer appears!
 *
 * DEPENDENCY:
 *   This file calls randomChoice() and shuffleArray() from utils.js,
 *   and clamp() from utils.js. Make sure utils.js is loaded BEFORE
 *   this file in index.html.
 *   It also uses the jsPDF library loaded via CDN in index.html.
 */

/* global randomChoice, shuffleArray, clamp */


/* ============================================================
   SECTION 1 — PROBLEM SUBTYPE DEFINITIONS

   WHY SUBTYPES INSTEAD OF FREE-FORM SLIDERS?
   ──────────────────────────────────────────
   The original design used four range sliders (min/max for each
   operand). While flexible, this required teachers to understand
   the mathematical implications of each combination, and it was
   easy to accidentally produce problems that were too hard or too
   easy for a specific lesson.

   Real math curricula are structured around specific, named skill
   levels that teachers follow in sequence. By encoding each level
   here, we guarantee:
     • Problems are educationally appropriate for the stated level.
     • The number pool always has enough distinct answers for the
       joke's decode key (usually 10–14 unique letters).
     • The UI is simpler: one dropdown replaces four sliders.

   STRUCTURE OF EACH SUBTYPE ENTRY:
     category  {string}   — Broad operation family. Used to group
                            entries under <optgroup> headings in
                            the HTML dropdown.
                            Values: 'Addition', 'Subtraction',
                                    'Multiplication', 'Division'.
     label     {string}   — Human-readable name shown in the
                            dropdown menu.
     sign      {string}   — The operator symbol printed on the
                            worksheet. We use Unicode characters
                            for typographic correctness:
                              +       standard plus (ASCII)
                              \u2212  true minus sign (−), not hyphen
                              \u00D7  multiplication sign (×)
                              \u00F7  division sign (÷)
     fontSize  {number}   — jsPDF font size (in points) for the
                            problem numbers. Multiplication and
                            division use a slightly smaller size
                            because their operator symbols are wider.
     generate  {function} — Returns every valid problem as an array
                            of objects: { first, second, answer }.
                              first  = top number in stacked layout
                              second = bottom number (with sign)
                              answer = result (becomes the code key)

   SUBTYPES INTENTIONALLY OMITTED (and why):
     "Partners of 10" (1+9, 2+8, 3+7 …):
       All answers equal 10 — only ONE unique code is possible.
       The decode grid needs one code per letter; this subtype
       would make that impossible.

     "Adding 0" / "Subtracting 0":
       Trivially produces the same number. No real challenge, and
       the answer pool is identical to the first-number range.

     "Multiplying by 0":
       Every answer is 0. Cannot build a decode key with a single
       unique code.

     "Multiplying by 1":
       Every answer equals the first number. The ×1 adds nothing
       mathematically. Very little variety in a reasonable range.

     "Three-addend addition":
       Our stacked equation layout shows exactly two numbers per
       problem. Supporting three addends would require redesigning
       the PDF layout (a separate future enhancement).

   FUTURE ENHANCEMENTS considered but deferred:
     "Mixed addition and subtraction" / "Mixed all operations":
       Currently each subtype uses one fixed operator sign for all
       its problems. Supporting a mix of + and − in a single worksheet
       would require adding a per-problem "sign" field and updating
       the PDF renderer — a contained but non-trivial change.

     "Fractions" / "Decimals":
       The decode grid displays answer values as plain numbers (code
       keys). Fraction or decimal answers (e.g. "3/4" or "1.5") would
       need a dedicated display format in the PDF.

     "Perfect squares / square roots":
       Square roots have no clean two-number stacked notation.
       Perfect squares (n×n) could be added under Multiplication
       as a straightforward new subtype when wanted.
   ============================================================ */

/**
 * @type {Object.<string, {
 *   category: string,
 *   label:    string,
 *   sign:     string,
 *   fontSize: number,
 *   generate: function(): Array<{first:number, second:number, answer:number}>
 * }>}
 */
const PROBLEM_SUBTYPES = {

    /* ──────────────────────────────────────────────────────────
       ADDITION SUBTYPES
       ────────────────────────────────────────────────────────── */

    /**
     * Single-digit addition: both operands in 1–9.
     * The foundational addition skill introduced first in most curricula.
     *
     * Unique answer pool: 17 values (2 through 18).
     * That comfortably covers any joke whose answer has ≤17 distinct letters.
     */
    'addition-single-digit': {
        category: 'Addition',
        label:    'Single-digit addition',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               Nested loops produce every (a, b) pair where both a and b
               are single-digit numbers. We include cases where a === b
               (doubles, like 7+7) because those are legitimate problems.
            */
            for (let a = 1; a <= 9; a++) {
                for (let b = 1; b <= 9; b++) {
                    problems.push({ first: a, second: b, answer: a + b });
                }
            }
            return problems;
        },
    },

    /**
     * Adding 1, 2, and 3 to numbers 1–30.
     * Builds fluency with the smallest addends before increasing difficulty.
     * Helps students practice "counting on" by small amounts.
     *
     * Unique answer pool: 32 values (2 through 33).
     */
    'addition-small-addends': {
        category: 'Addition',
        label:    'Adding 1, 2, and 3 to numbers',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 1; a <= 30; a++) {
                /*
                   Only second numbers 1, 2, and 3.
                   We iterate with b ≤ 3 rather than hard-coding three
                   push() calls so it's easy to extend later.
                */
                for (let b = 1; b <= 3; b++) {
                    problems.push({ first: a, second: b, answer: a + b });
                }
            }
            return problems;
        },
    },

    /**
     * Addition with teen numbers: 13–19 + 1–9.
     * Focuses on crossing the tens boundary in the "teen" range.
     * A skill specifically highlighted in many primary math curricula.
     *
     * Unique answer pool: 15 values (14 through 28).
     */
    'addition-teen-numbers': {
        category: 'Addition',
        label:    'Addition with teen numbers',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 13; a <= 19; a++) {
                for (let b = 1; b <= 9; b++) {
                    problems.push({ first: a, second: b, answer: a + b });
                }
            }
            return problems;
        },
    },

    /**
     * Adding ten to any number 1–90.
     * Reinforces place-value understanding: only the tens digit changes,
     * and the ones digit stays the same (e.g. 37+10=47).
     *
     * Unique answer pool: 90 values (11 through 100).
     */
    'addition-add-ten': {
        category: 'Addition',
        label:    'Adding ten to any number',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               The second number is always 10. We loop only over the first
               number, so each problem in the list has a different answer.
            */
            for (let a = 1; a <= 90; a++) {
                problems.push({ first: a, second: 10, answer: a + 10 });
            }
            return problems;
        },
    },

    /**
     * Adding a multiple of ten (10, 20, 30, 40, or 50) to a two-digit number.
     * Extends "+10" fluency to arbitrary multiples of ten.
     * Develops understanding of how the tens digit changes by the addend's tens.
     *
     * Unique answer pool: very large (sums range from 20 to 139).
     */
    'addition-add-tens': {
        category: 'Addition',
        label:    'Adding tens to numbers',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               The addend is always a multiple of 10 between 10 and 50.
               The base number ranges from 10 to 89 so results stay ≤ 139,
               a reasonable range for worksheets at this level.
            */
            const tensAddends = [10, 20, 30, 40, 50];
            for (let a = 10; a <= 89; a++) {
                for (const b of tensAddends) {
                    if (a + b <= 139) {
                        problems.push({ first: a, second: b, answer: a + b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Adding a 1-digit number (1–9) to a 2-digit number (10–99).
     * Builds bridging and regrouping (carrying) skills.
     * One of the most important skills before moving to multi-digit addition.
     *
     * Unique answer pool: 98 values (11 through 108).
     */
    'addition-1digit-2digit': {
        category: 'Addition',
        label:    'Adding 1-digit numbers to 2-digit numbers',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 10; a <= 99; a++) {
                for (let b = 1; b <= 9; b++) {
                    problems.push({ first: a, second: b, answer: a + b });
                }
            }
            return problems;
        },
    },

    /**
     * Doubles: a number added to itself (n + n), for n = 1–20.
     * "Doubles" is an explicitly taught strategy in grades 1–2.
     * Knowing doubles by heart helps students quickly solve near-doubles
     * (e.g. knowing 6+6=12 makes 6+7=13 easy to derive).
     *
     * Unique answer pool: 20 values (2, 4, 6, … 40).
     */
    'addition-doubles': {
        category: 'Addition',
        label:    'Doubles (1+1 through 20+20)',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               Both numbers are the same (n and n), so the answer is always 2×n.
               These appear on the worksheet as: 7 + 7, 12 + 12, etc.
            */
            for (let n = 1; n <= 20; n++) {
                problems.push({ first: n, second: n, answer: n + n });
            }
            return problems;
        },
    },

    /**
     * Near-doubles: n + (n + 1), for n = 1–15.
     * A common mental-math strategy taught in grades 1–2. Students learn to
     * spot "this is almost a double!" and adjust: 6+7 = (6+6)+1 = 13.
     * Builds on doubles fluency and extends it naturally.
     *
     * Unique answer pool: 15 values (3, 5, 7, … 31).
     * All answers are odd (even double + 1 is always odd).
     */
    'addition-near-doubles': {
        category: 'Addition',
        label:    'Near-doubles (n + the next number)',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               We put the smaller number on top (first) and the larger one
               on the bottom (second) to keep the layout consistent.
               e.g. n=6 produces: first=6, second=7, answer=13.
            */
            for (let n = 1; n <= 15; n++) {
                problems.push({ first: n, second: n + 1, answer: n + (n + 1) });
            }
            return problems;
        },
    },

    /**
     * Two-digit + two-digit addition WITHOUT regrouping (no carrying).
     * A core grade 2–3 skill bridging single-digit addition to full
     * multi-digit arithmetic, without the added complexity of carrying.
     *
     * "No regrouping" means the ones-column digits sum to less than 10,
     * so no amount is "carried" into the tens column.
     *
     * Both operands are kept in the range 11–49, which guarantees:
     *   • Both numbers are clearly two-digit.
     *   • The sum of the tens digits (max 4 + 4 = 8) never carries into
     *     the hundreds, so the answer is always a two-digit number (22–88).
     *
     * Unique answer pool: very large (sums span roughly 22–88).
     */
    'addition-2digit-no-regroup': {
        category: 'Addition',
        label:    '2-digit + 2-digit (no regrouping)',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 11; a <= 49; a++) {
                for (let b = 11; b <= 49; b++) {
                    /*
                       (a % 10) extracts the ones digit of a.
                       (b % 10) extracts the ones digit of b.
                       If their sum is less than 10, no digit is "carried"
                       into the tens column — that is what "no regrouping" means.
                       Because both tens digits are 1–4, their sum is at most 8,
                       so we only need to check the ones column.
                    */
                    if ((a % 10) + (b % 10) < 10) {
                        problems.push({ first: a, second: b, answer: a + b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Two-digit + two-digit addition WITH regrouping (carrying required).
     * The natural next step after addition-2digit-no-regroup; grade 2–3.
     * Students must carry a "1" from the ones column into the tens column.
     *
     * Operands are kept in the range 11–49 so that:
     *   • The tens digits (max 4 + 4 = 8, plus 1 carry = 9) never produce
     *     a hundreds digit — the answer is always two digits (22–98).
     *
     * Unique answer pool: very large (sums span roughly 22–98).
     */
    'addition-2digit-regroup': {
        category: 'Addition',
        label:    '2-digit + 2-digit (with regrouping)',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 11; a <= 49; a++) {
                for (let b = 11; b <= 49; b++) {
                    /*
                       Regrouping (carrying) occurs when the ones digits sum to 10
                       or more. The carry adds 1 to the tens column, making these
                       problems more challenging than the no-regrouping version.
                    */
                    if ((a % 10) + (b % 10) >= 10) {
                        problems.push({ first: a, second: b, answer: a + b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Adding multiples of ten: both operands are multiples of 10 (10–90).
     * Reinforces place-value understanding — the ones digit is always 0, so
     * only the tens digits change (e.g. 30 + 50 = 80).
     * A stepping-stone between "+10" fluency and full two-digit addition.
     *
     * Unique answer pool: 17 values (20, 30, 40, … 180).
     * Some answers cross into the hundreds (e.g. 90 + 90 = 180); this is
     * intentional — students see that adding tens can bridge past 100.
     */
    'addition-multiples-of-ten': {
        category: 'Addition',
        label:    'Adding multiples of 10 (e.g. 30 + 50)',
        sign:     '+',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               Both a and b step by 10 from 10 to 90.
               We include both orders (e.g. 30+50 and 50+30) for variety across
               different worksheet generations.
            */
            for (let a = 10; a <= 90; a += 10) {
                for (let b = 10; b <= 90; b += 10) {
                    problems.push({ first: a, second: b, answer: a + b });
                }
            }
            return problems;
        },
    },


    /* ──────────────────────────────────────────────────────────
       SUBTRACTION SUBTYPES
       ────────────────────────────────────────────────────────── */

    /**
     * Single-digit subtraction: first 1–9, second 1–9, result ≥ 0.
     * Only pairs where first ≥ second are generated (no negative results).
     * The subtraction counterpart to single-digit addition.
     *
     * Unique answer pool: 9 values (0 through 8).
     *
     * NOTE on answer pool size: With only 9 unique answers, this subtype
     * works best for jokes whose answers have 9 or fewer distinct letters.
     * For longer joke answers the code still works — two letters may share
     * a code number, which slightly reduces the puzzle's uniqueness but
     * does not break it. The createAnswerDict() fallback handles this case.
     */
    'subtraction-single-digit': {
        category: 'Subtraction',
        label:    'Single-digit subtraction',
        sign:     '\u2212',   /* true minus sign − (Unicode U+2212), not a hyphen */
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 1; a <= 9; a++) {
                for (let b = 1; b <= 9; b++) {
                    /*
                       We require a ≥ b so the answer is never negative.
                       Young students are not expected to handle negative numbers.
                    */
                    if (a >= b) {
                        problems.push({ first: a, second: b, answer: a - b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Subtracting 1, 2, or 3 from numbers 4–30.
     * Mirrors the addition-small-addends subtype for subtraction.
     * Builds "counting back" fluency with small differences.
     *
     * Unique answer pool: 29 values (1 through 29).
     */
    'subtraction-small-amounts': {
        category: 'Subtraction',
        label:    'Subtracting 1, 2, and 3 from numbers',
        sign:     '\u2212',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               Starting first at 4 ensures that 4−3 = 1 is the smallest result,
               avoiding the answer of 0 (which would make one letter's code "0",
               an unusual but valid choice; we keep it out for simplicity).
            */
            for (let a = 4; a <= 30; a++) {
                for (let b = 1; b <= 3; b++) {
                    problems.push({ first: a, second: b, answer: a - b });
                }
            }
            return problems;
        },
    },

    /**
     * Subtraction with teen numbers: 13–19 minus 1–9, result ≥ 0.
     * The inverse of addition-teen-numbers.
     *
     * Unique answer pool: 15 values (4 through 18).
     */
    'subtraction-teen-numbers': {
        category: 'Subtraction',
        label:    'Subtraction with teen numbers',
        sign:     '\u2212',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 13; a <= 19; a++) {
                for (let b = 1; b <= 9; b++) {
                    if (a >= b) {
                        problems.push({ first: a, second: b, answer: a - b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Subtracting ten from a number 11–99.
     * The inverse of "adding ten". Reinforces place-value understanding
     * by showing that only the tens digit changes (e.g. 47−10=37).
     *
     * Unique answer pool: 89 values (1 through 89).
     */
    'subtraction-subtract-ten': {
        category: 'Subtraction',
        label:    'Subtracting ten from a number',
        sign:     '\u2212',
        fontSize: 18,
        generate() {
            const problems = [];
            /*
               Start at 11 so the smallest result is 1 (not 0).
               The second number is always 10.
            */
            for (let a = 11; a <= 99; a++) {
                problems.push({ first: a, second: 10, answer: a - 10 });
            }
            return problems;
        },
    },

    /**
     * Subtracting a 1-digit number (1–9) from a 2-digit number (10–99).
     * Builds borrowing (regrouping) skills.
     * The inverse of addition-1digit-2digit.
     *
     * Unique answer pool: 98 values (1 through 98).
     */
    'subtraction-1digit-from-2digit': {
        category: 'Subtraction',
        label:    'Subtracting 1-digit from 2-digit numbers',
        sign:     '\u2212',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 10; a <= 99; a++) {
                for (let b = 1; b <= 9; b++) {
                    if (a >= b) {
                        problems.push({ first: a, second: b, answer: a - b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Two-digit − two-digit subtraction WITHOUT regrouping (no borrowing).
     * The subtraction counterpart to addition-2digit-no-regroup; grade 2–3.
     * Students subtract column by column without needing to borrow from the
     * tens column.
     *
     * "No regrouping" means the ones digit of the top number (a) is greater
     * than or equal to the ones digit of the bottom number (b), so the ones
     * column can be subtracted directly.
     *
     * Constraints:
     *   • a: 21–79 (top number; 2-digit with room to subtract a 2-digit value)
     *   • b: 11–69 (bottom number; 2-digit, smaller than a)
     *   • tens digit of a > tens digit of b — guarantees a positive result
     *     whose tens digit is at least 1 (answer is always 2-digit).
     *   • ones digit of a ≥ ones digit of b — the no-regrouping condition.
     *
     * Unique answer pool: very large (differences span roughly 10–68).
     */
    'subtraction-2digit-no-regroup': {
        category: 'Subtraction',
        label:    '2-digit \u2212 2-digit (no regrouping)',
        sign:     '\u2212',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 21; a <= 79; a++) {
                for (let b = 11; b < a; b++) {
                    const onesA = a % 10;
                    const onesB = b % 10;
                    const tensA = Math.floor(a / 10);
                    const tensB = Math.floor(b / 10);
                    /*
                       Two conditions must both be true for no regrouping:
                       1. onesA >= onesB: the ones column subtracts directly,
                          no need to borrow from the tens.
                       2. tensA > tensB:  the result has a positive tens digit,
                          so the answer is always a 2-digit number.
                    */
                    if (onesA >= onesB && tensA > tensB) {
                        problems.push({ first: a, second: b, answer: a - b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Two-digit − two-digit subtraction WITH regrouping (borrowing required).
     * The natural next step after subtraction-2digit-no-regroup; grade 2–3.
     * The student must "borrow" 10 from the tens column to complete the
     * ones-column subtraction.
     *
     * Constraints:
     *   • a: 21–79 (top number, 2-digit)
     *   • b: 12–79 (bottom number, 2-digit, smaller than a)
     *   • ones digit of a < ones digit of b — this triggers the borrow.
     *   • tens digit of a > tens digit of b — ensures a positive result.
     *
     * Unique answer pool: very large (differences span roughly 2–67).
     */
    'subtraction-2digit-regroup': {
        category: 'Subtraction',
        label:    '2-digit \u2212 2-digit (with regrouping)',
        sign:     '\u2212',
        fontSize: 18,
        generate() {
            const problems = [];
            for (let a = 21; a <= 79; a++) {
                for (let b = 12; b < a; b++) {
                    const onesA = a % 10;
                    const onesB = b % 10;
                    const tensA = Math.floor(a / 10);
                    const tensB = Math.floor(b / 10);
                    /*
                       Regrouping (borrowing) is needed when the bottom ones digit
                       is larger than the top ones digit — you cannot subtract a
                       bigger digit from a smaller one without borrowing first.
                       tensA > tensB guarantees the overall result is positive.
                    */
                    if (onesA < onesB && tensA > tensB) {
                        problems.push({ first: a, second: b, answer: a - b });
                    }
                }
            }
            return problems;
        },
    },

    /**
     * Subtracting any number 1–99 from 100.
     * A classic mental-math benchmark. Students learn that 100 − n and n
     * always sum to 100 (complementary pairs), linking subtraction back to
     * addition and strengthening number sense around the hundred landmark.
     *
     * The top number is always 100 (three digits), so fontSize is set to 16
     * (one step smaller) to keep it legible in the PDF column layout.
     *
     * Unique answer pool: 99 values (1 through 99).
     */
    'subtraction-from-100': {
        category: 'Subtraction',
        label:    'Subtracting from 100 (100 \u2212 n)',
        sign:     '\u2212',
        fontSize: 16,   /* slightly smaller: top number is 3 digits (100) */
        generate() {
            const problems = [];
            /*
               The first (top) number is always 100.
               b ranges from 1 to 99 so the smallest result is 1 (not 0).
            */
            for (let b = 1; b <= 99; b++) {
                problems.push({ first: 100, second: b, answer: 100 - b });
            }
            return problems;
        },
    },


    /* ──────────────────────────────────────────────────────────
       MULTIPLICATION SUBTYPES

       Convention: for a "×N table", the first number (on top in
       the stacked equation) ranges from 1–12, and the second number
       (the fixed factor, shown with the × sign) is always N.

       Example for ×3 table:
           1      2      3     ...     12
         × 3    × 3    × 3           × 3
         ───    ───    ───           ───
           3      6      9            36

       This makes each worksheet clearly identifiable as a specific
       table, which matches how teachers present multiplication facts.

       Unique answer pool: 12 values per single-table subtype
       (one per row in the table, all distinct since k×N is unique
       for k = 1..12 when N is fixed).
       ────────────────────────────────────────────────────────── */

    /**
     * ×2 table: 1–12 × 2.
     * The first multiplication table most students learn.
     * Answers: even numbers 2, 4, 6, … 24 (12 unique values).
     */
    'multiplication-by-2': {
        category: 'Multiplication',
        label:    'Multiplying by 2 (×2 table)',
        sign:     '\u00D7',   /* multiplication sign × (Unicode U+00D7) */
        fontSize: 16,
        /*
           We delegate to the shared helper function _multiplicationTable(n).
           Defined below the PROBLEM_SUBTYPES object so it is accessible
           everywhere in this file.
        */
        generate() { return _multiplicationTable(2); },
    },

    /** ×3 table: 1–12 × 3. Answers: 3, 6, 9, … 36 (12 unique values). */
    'multiplication-by-3': {
        category: 'Multiplication',
        label:    'Multiplying by 3 (×3 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(3); },
    },

    /** ×4 table: 1–12 × 4. Answers: 4, 8, 12, … 48 (12 unique values). */
    'multiplication-by-4': {
        category: 'Multiplication',
        label:    'Multiplying by 4 (×4 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(4); },
    },

    /** ×5 table: 1–12 × 5. Answers: 5, 10, 15, … 60 (12 unique values). */
    'multiplication-by-5': {
        category: 'Multiplication',
        label:    'Multiplying by 5 (×5 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(5); },
    },

    /** ×6 table: 1–12 × 6. Answers: 6, 12, 18, … 72 (12 unique values). */
    'multiplication-by-6': {
        category: 'Multiplication',
        label:    'Multiplying by 6 (×6 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(6); },
    },

    /** ×7 table: 1–12 × 7. Answers: 7, 14, 21, … 84 (12 unique values). */
    'multiplication-by-7': {
        category: 'Multiplication',
        label:    'Multiplying by 7 (×7 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(7); },
    },

    /** ×8 table: 1–12 × 8. Answers: 8, 16, 24, … 96 (12 unique values). */
    'multiplication-by-8': {
        category: 'Multiplication',
        label:    'Multiplying by 8 (×8 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(8); },
    },

    /** ×9 table: 1–12 × 9. Answers: 9, 18, 27, … 108 (12 unique values). */
    'multiplication-by-9': {
        category: 'Multiplication',
        label:    'Multiplying by 9 (×9 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(9); },
    },

    /** ×10 table: 1–12 × 10. Answers: 10, 20, 30, … 120 (12 unique values). */
    'multiplication-by-10': {
        category: 'Multiplication',
        label:    'Multiplying by 10 (×10 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(10); },
    },

    /** ×11 table: 1–12 × 11. Answers: 11, 22, 33, … 132 (12 unique values). */
    'multiplication-by-11': {
        category: 'Multiplication',
        label:    'Multiplying by 11 (×11 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(11); },
    },

    /** ×12 table: 1–12 × 12. Answers: 12, 24, 36, … 144 (12 unique values). */
    'multiplication-by-12': {
        category: 'Multiplication',
        label:    'Multiplying by 12 (×12 table)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() { return _multiplicationTable(12); },
    },

    /**
     * Mixed multiplication facts: all tables 2–12 × 2–12.
     * A comprehensive review covering every standard times-table fact.
     * Used for assessment or mixed-practice worksheets.
     *
     * Unique answer pool: many distinct products in the range 4–144.
     */
    'multiplication-mixed': {
        category: 'Multiplication',
        label:    'Mixed multiplication facts (all tables)',
        sign:     '\u00D7',
        fontSize: 16,
        generate() {
            const problems = [];
            for (let a = 2; a <= 12; a++) {
                for (let b = 2; b <= 12; b++) {
                    problems.push({ first: a, second: b, answer: a * b });
                }
            }
            return problems;
        },
    },


    /* ──────────────────────────────────────────────────────────
       DIVISION SUBTYPES

       Division facts are the inverse of multiplication facts.
       We generate them from multiplication so results are always
       whole numbers with no remainder — appropriate for students
       who are just learning division.

       Display convention for a "÷N" problem:
           first  = dividend  (the number being divided; shown on top)
           second = divisor   (the number to divide by; shown with ÷ sign)
           answer = quotient  (the result; this becomes the decode code)

       On the printed worksheet this looks like:
               24          ← first (dividend)
            ÷   2          ← sign + second (divisor)
           ────
              L            ← the letter label

       For "dividing by N", we generate quotients 1–12:
           1×N ÷ N = 1,  2×N ÷ N = 2,  …,  12×N ÷ N = 12.

       Unique answer pool: 12 values (quotients 1 through 12).

       NOTE: With exactly 12 unique codes, this works for jokes whose
       answers have up to 12 distinct letters. Longer joke answers
       trigger the fallback in createAnswerDict() (a letter may share
       a code with another letter), which is handled gracefully.
       ────────────────────────────────────────────────────────── */

    /**
     * ÷2 facts: 2÷2=1, 4÷2=2, … 24÷2=12.
     * The first and most intuitive division table.
     */
    'division-by-2': {
        category: 'Division',
        label:    'Dividing by 2 (÷2 facts)',
        sign:     '\u00F7',   /* division sign ÷ (Unicode U+00F7) */
        fontSize: 16,
        generate() { return _divisionTable(2); },
    },

    /** ÷3 facts: 3÷3=1, 6÷3=2, … 36÷3=12. */
    'division-by-3': {
        category: 'Division',
        label:    'Dividing by 3 (÷3 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(3); },
    },

    /** ÷4 facts: 4÷4=1, 8÷4=2, … 48÷4=12. */
    'division-by-4': {
        category: 'Division',
        label:    'Dividing by 4 (÷4 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(4); },
    },

    /** ÷5 facts: 5÷5=1, 10÷5=2, … 60÷5=12. */
    'division-by-5': {
        category: 'Division',
        label:    'Dividing by 5 (÷5 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(5); },
    },

    /** ÷6 facts: 6÷6=1, 12÷6=2, … 72÷6=12. */
    'division-by-6': {
        category: 'Division',
        label:    'Dividing by 6 (÷6 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(6); },
    },

    /** ÷7 facts: 7÷7=1, 14÷7=2, … 84÷7=12. */
    'division-by-7': {
        category: 'Division',
        label:    'Dividing by 7 (÷7 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(7); },
    },

    /** ÷8 facts: 8÷8=1, 16÷8=2, … 96÷8=12. */
    'division-by-8': {
        category: 'Division',
        label:    'Dividing by 8 (÷8 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(8); },
    },

    /** ÷9 facts: 9÷9=1, 18÷9=2, … 108÷9=12. */
    'division-by-9': {
        category: 'Division',
        label:    'Dividing by 9 (÷9 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(9); },
    },

    /** ÷10 facts: 10÷10=1, 20÷10=2, … 120÷10=12. */
    'division-by-10': {
        category: 'Division',
        label:    'Dividing by 10 (÷10 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(10); },
    },

    /** ÷11 facts: 11÷11=1, 22÷11=2, … 132÷11=12. */
    'division-by-11': {
        category: 'Division',
        label:    'Dividing by 11 (÷11 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(11); },
    },

    /** ÷12 facts: 12÷12=1, 24÷12=2, … 144÷12=12. */
    'division-by-12': {
        category: 'Division',
        label:    'Dividing by 12 (÷12 facts)',
        sign:     '\u00F7',
        fontSize: 16,
        generate() { return _divisionTable(12); },
    },

};   /* end PROBLEM_SUBTYPES */


/* ============================================================
   SECTION 1b — PRIVATE GENERATOR HELPERS

   These functions are used internally by the PROBLEM_SUBTYPES
   entries above. They are named with a leading underscore to
   signal that they are not part of the public API.
   ============================================================ */

/**
 * Generates the 1×n through 12×n multiplication facts for a
 * given fixed factor n.
 *
 * The multiplicand (1–12) is placed on top (first), and the
 * fixed factor n is placed on the bottom (second), matching
 * the conventional printed layout:
 *
 *     1      2      3     ...    12
 *   × n    × n    × n           × n
 *   ───    ───    ───           ───
 *     n    2n    3n           12n
 *
 * This ensures that every problem on a "×n" worksheet shows
 * the same second number, clearly identifying which table
 * the student is practising.
 *
 * @param  {number} n - The fixed multiplier (2 through 12).
 * @returns {Array<{first:number, second:number, answer:number}>}
 */
function _multiplicationTable(n) {
    const problems = [];
    for (let k = 1; k <= 12; k++) {
        problems.push({
            first:  k,        /* multiplicand — varies 1..12 */
            second: n,        /* fixed factor  — always n */
            answer: k * n,    /* product */
        });
    }
    return problems;
}


/**
 * Generates the ÷divisor division facts for quotients 1–12.
 *
 * Each problem is constructed from its multiplication inverse:
 *   quotient × divisor = dividend   →   dividend ÷ divisor = quotient
 *
 * So for divisor=3:
 *   1×3=3  →  3÷3=1
 *   2×3=6  →  6÷3=2
 *   …
 *  12×3=36 → 36÷3=12
 *
 * The dividend (large number) is placed on top (first), matching
 * how division is shown in stacked ("long division") format.
 *
 * @param  {number} divisor - The fixed divisor (2 through 12).
 * @returns {Array<{first:number, second:number, answer:number}>}
 */
function _divisionTable(divisor) {
    const problems = [];
    for (let quotient = 1; quotient <= 12; quotient++) {
        const dividend = quotient * divisor;
        problems.push({
            first:  dividend,   /* dividend — the number being divided, shown on top */
            second: divisor,    /* divisor  — shown after the ÷ sign */
            answer: quotient,   /* quotient — this becomes the letter's code number */
        });
    }
    return problems;
}


/* ============================================================
   SECTION 2 — PROBLEM GENERATION
   ============================================================ */

/**
 * Returns the complete list of math problems for the specified subtype.
 *
 * This is the public-facing function that app.js calls.
 * It delegates to the `generate()` method defined in PROBLEM_SUBTYPES,
 * providing a central place to add error handling and fallback behaviour.
 *
 * @param {string} subtypeKey - A key from PROBLEM_SUBTYPES, e.g.
 *                              'addition-single-digit' or 'multiplication-by-7'.
 * @returns {Array<{first:number, second:number, answer:number}>}
 *   Every valid problem for the chosen subtype.
 *
 * @example
 *   createProblemList('multiplication-by-5');
 *   // Returns 12 problems: {first:1,second:5,answer:5},
 *   //                      {first:2,second:5,answer:10}, …
 */
function createProblemList(subtypeKey) {
    const subtype = PROBLEM_SUBTYPES[subtypeKey];

    if (!subtype) {
        /*
           Unknown key — this should never happen when the UI is working
           correctly, but we guard against it defensively. Fall back to
           the simplest available subtype so the app doesn't crash.
        */
        console.warn(
            `createProblemList: unknown subtypeKey "${subtypeKey}". ` +
            'Falling back to "addition-single-digit".'
        );
        return PROBLEM_SUBTYPES['addition-single-digit'].generate();
    }

    return subtype.generate();
}


/* ============================================================
   SECTION 3 — SAMPLE PROBLEM PREVIEW
   ============================================================ */

/**
 * Returns a small random sample of problems formatted as readable strings.
 * Used to populate the "Example Problems" preview panel so the teacher can
 * see what kinds of equations the worksheet will contain before generating.
 *
 * @param {Array}  problemList - Output from createProblemList().
 * @param {string} sign        - The operator symbol ('+', '−', '×', '÷').
 * @param {number} [count=3]   - How many example strings to return.
 * @returns {string[]} Each string is a formatted equation,
 *                     e.g. "7 × 8 = 56" or "24 ÷ 6 = 4".
 *
 * @example
 *   getSampleProblems(problems, '×', 3);
 *   // Might return: ['3 × 7 = 21', '9 × 7 = 63', '11 × 7 = 77']
 */
function getSampleProblems(problemList, sign, count = 3) {
    /*
       WHY WE SHUFFLE INSTEAD OF CALLING randomChoice() MULTIPLE TIMES:

       The old approach called randomChoice(problemList) once per example.
       Because each call picks a random index independently, it could land
       on the same problem more than once — producing duplicate examples like
       "7 + 7 = 14" appearing twice in the same three-item preview.

       The fix: shuffleArray() (from utils.js) returns a randomly-ordered
       COPY of the full pool using the Fisher-Yates algorithm. It never
       modifies the original problemList array. We then take a slice of the
       first `count` items from that shuffled copy. Every position in a
       Fisher-Yates shuffle is a distinct item, so duplicates are impossible.
    */
    const shuffled = shuffleArray(problemList);

    /*
       slice(0, count) extracts the first `count` items.
       If the pool somehow has fewer than `count` problems we get all of them
       — no crash, just fewer examples shown.

       .map() converts each problem object into a human-readable equation
       string using a template literal, e.g. { first:9, second:6 } → "9 × 6 = 54".
    */
    return shuffled
        .slice(0, count)
        .map(p => `${p.first} ${sign} ${p.second} = ${p.answer}`);
}


/* ============================================================
   SECTION 4 — ANSWER DICTIONARY
   ============================================================ */

/**
 * Maps each character of the joke answer to a unique math problem.
 *
 * The "answer dictionary" is the heart of the worksheet's puzzle mechanic.
 * Each LETTER in the joke answer is assigned one math problem. When the
 * student solves that problem, the numerical answer is the "code" that
 * points to the letter's blank box in the decode grid at the top of the page.
 *
 * Rules:
 *   • Spaces (' ') and dashes ('-') are separators: stored as-is with no
 *     math problem attached. They appear as gaps in the decode grid.
 *   • Every other character (letters, digits) gets a UNIQUE math problem,
 *     meaning no two characters share the same numerical answer (code).
 *     Uniqueness is important: if two boxes had the same code number,
 *     the student would not know which box to write in.
 *
 * Edge case: if the joke answer has more unique characters than the
 * problem list has distinct answer values, uniqueness breaks down.
 * In that case we fall back to any available problem. The worksheet
 * still functions; some boxes will just share code numbers.
 *
 * @param {string} jokeAnswer  - The joke's answer text, e.g. "Watch Dogs".
 * @param {Array}  problemList - Output from createProblemList().
 * @returns {Array<{letter:string, isAlpha:boolean, problem:Object|null}>}
 *   One entry per character in jokeAnswer:
 *     letter   — The character (uppercased if alphabetic).
 *     isAlpha  — true for non-separator characters; false for ' ' and '-'.
 *     problem  — { answer, first, second } or null for separators.
 *
 * @example
 *   // For jokeAnswer = "Hi-Ya":
 *   // Returns: [
 *   //   { letter:'H', isAlpha:true,  problem:{answer:48, first:6, second:8} },
 *   //   { letter:'I', isAlpha:true,  problem:{answer:33, first:3, second:11} },
 *   //   { letter:'-', isAlpha:false, problem:null },
 *   //   { letter:'Y', isAlpha:true,  problem:{answer:87, first:12, second:7} },
 *   //   { letter:'A', isAlpha:true,  problem:{answer:21, first:7, second:3}  },
 *   // ]
 */
function createAnswerDict(jokeAnswer, problemList) {
    const answerDict = [];

    /*
       A Set is like an array but guarantees uniqueness — adding the same
       value twice has no effect. We use it to track which numerical answer
       codes have already been assigned, so we can ensure uniqueness.
    */
    const usedAnswers = new Set();

    /*
       The "for...of" loop iterates over each CHARACTER of the string.
       Strings in JavaScript are iterable, so this works without needing
       to split the string first.
    */
    for (const char of jokeAnswer) {

        if (char === ' ' || char === '-') {
            /* Separator: record it with no problem; it becomes a gap in the grid */
            answerDict.push({ letter: char, isAlpha: false, problem: null });

        } else {
            /* Alphabetic (or other printable) character: find a unique problem */
            let problem      = null;
            let attempts     = 0;
            const MAX_ATTEMPTS = 300;   /* Safety cap — prevents an infinite loop
                                           if the problem pool is very small */

            while (problem === null && attempts < MAX_ATTEMPTS) {
                attempts++;
                const candidate = randomChoice(problemList);

                /*
                   Only accept this problem if its answer value hasn't been
                   used yet for another letter. This guarantees each code
                   number is unambiguous in the decode grid.
                */
                if (!usedAnswers.has(candidate.answer)) {
                    problem = candidate;
                    usedAnswers.add(candidate.answer);
                }
            }

            /*
               Fallback: if MAX_ATTEMPTS is exhausted (all answer values are
               taken), just accept any problem. Two letters will share a code
               number, which slightly reduces puzzle integrity but doesn't
               break the worksheet.
            */
            if (problem === null) {
                problem = randomChoice(problemList);
                console.warn(
                    'createAnswerDict: could not find a unique answer for letter "' +
                    char.toUpperCase() + '". Reusing an existing code number. ' +
                    'Consider selecting a problem type with a larger answer pool.'
                );
            }

            answerDict.push({
                letter:  char.toUpperCase(),   /* Always uppercase on the printed sheet */
                isAlpha: true,
                problem,
            });
        }
    }

    return answerDict;
}


/* ============================================================
   SECTION 5 — PDF GENERATION

   ABOUT jsPDF:
     jsPDF is a JavaScript library that creates PDF files entirely
     in the browser — no server or back-end is needed.
     It is loaded via a <script> tag in index.html and becomes
     available as window.jspdf.

     Coordinate system:
       • (0, 0) is the TOP-LEFT corner of the page.
       • x increases going RIGHT.
       • y increases going DOWN.
       • All values are in millimetres (mm) when unit:'mm' is set.

     Key jsPDF methods used in this function:
       doc.setFont(family, style)      — Set the typeface.
       doc.setFontSize(size)           — Set font size in points.
       doc.text(str, x, y, opts)       — Draw text at (x, y).
                                         y is the text BASELINE.
       doc.line(x1, y1, x2, y2)        — Draw a straight line.
       doc.rect(x, y, w, h, style)     — Draw a rectangle.
                                         'S' = stroke only (outline).
       doc.setLineWidth(w)             — Set line stroke thickness.
       doc.addPage()                   — Append a new blank page.
       doc.save(filename)              — Trigger a browser download.
       doc.splitTextToSize(text, w)    — Word-wrap text to width w,
                                         returning an array of lines.
       doc.getTextWidth(text)          — Measure text width in mm.
   ============================================================ */

/**
 * Generates and immediately downloads a Math Jokes worksheet PDF.
 *
 * The worksheet has three visual sections:
 *   A — Header: Name/Date fields and the joke question.
 *   B — Decode row: Numbered blank boxes (one per joke-answer letter).
 *   C — Math problems: Stacked equations in a 4-column grid, shuffled,
 *                      each labeled with the letter it decodes.
 *
 * @param {Object} jokeData   - A joke object from jokes.js.
 *                              Must have: joke_q (question string),
 *                                         joke_a (answer string),
 *                                         filename (slug for the PDF name).
 * @param {Array}  answerDict - Output from createAnswerDict().
 * @param {string} subtypeKey - A key from PROBLEM_SUBTYPES. Used to look
 *                              up the operator sign and font size for
 *                              this operation type.
 */
function generateWorksheetPDF(jokeData, answerDict, subtypeKey) {

    /* --- jsPDF Setup ----------------------------------------- */

    /*
       window.jspdf is the global object the jsPDF library attaches to.
       We use object destructuring to pull out just the constructor we need.
       This is equivalent to: const jsPDF = window.jspdf.jsPDF;
    */
    const { jsPDF } = window.jspdf;

    /*
       Create a new PDF document.
       'letter' format = US Letter = 215.9 mm wide × 279.4 mm tall.
       'portrait' = taller than wide (the default for school worksheets).
       'mm' = all coordinates are in millimetres.
    */
    const doc = new jsPDF({
        orientation: 'portrait',
        unit:        'mm',
        format:      'letter',
    });

    /* --- Page geometry --------------------------------------- */
    const PAGE_W   = 215.9;                  /* Total page width in mm */
    const PAGE_H   = 279.4;                  /* Total page height in mm */
    const MARGIN   = 15;                     /* Left & right margins in mm */
    const TOP      = 18;                     /* Top margin in mm */
    const BOTTOM   = 18;                     /* Bottom margin (overflow guard) */
    const USABLE_W = PAGE_W - MARGIN * 2;    /* 185.9 mm of drawable width */

    /* --- Layout constants ------------------------------------ */
    const ROW_H = 11;   /* Vertical height of each text row in mm */
    const GAP   = 3;    /* Small breathing gap between sections in mm */

    /* --- Decode-row box dimensions -------------------------- */
    /*
       Each character in the joke answer gets one "slot" in the decode row.
       The slot contains a blank box (where the student writes the letter)
       and a code number below it.

       We size boxes dynamically so all characters fit on a single line.
       Minimum box width: 8 mm — small but still legible.
       Maximum box width: 16 mm — anything wider looks too sparse.

       Formula:
         Each slot = boxW + SLOT_GAP mm wide.
         Total available width = USABLE_W.
         charCount × (boxW + SLOT_GAP) = USABLE_W
         boxW = USABLE_W / charCount - SLOT_GAP
       Then we clamp to [8, 16].
    */
    const charCount = answerDict.length;
    const SLOT_GAP  = 3;    /* Gap between adjacent slots in mm */
    const BOX_H     = 10;   /* Height of the letter box in mm */

    const boxW   = clamp(
        Math.floor(USABLE_W / charCount) - SLOT_GAP,
        8,     /* minimum */
        16     /* maximum */
    );
    const SLOT_W = boxW + SLOT_GAP;   /* Total horizontal space per character */

    /* --- Problem grid constants ------------------------------ */
    /*
       Math problems are laid out in a 4-column grid.
       Within each column, numbers are right-aligned in a 60%-wide area.
       The letter label appears just to the right of the numbers.
    */
    const COLS         = 4;
    const COL_W        = USABLE_W / COLS;
    const NUMBER_W     = COL_W * 0.60;       /* Right-align numbers within this width */
    const LABEL_OFFSET = NUMBER_W + 2;       /* Letter label starts 2 mm past the numbers */

    /* --- Operator sign and font size from the chosen subtype - */
    const subtype  = PROBLEM_SUBTYPES[subtypeKey] || PROBLEM_SUBTYPES['addition-single-digit'];
    const sign     = subtype.sign;
    const bodySize = subtype.fontSize;

    /* Y-coordinate cursor: tracks the current drawing position on the page */
    let y = TOP;


    /* ========================================================
       SECTION A — WORKSHEET HEADER
       ======================================================== */

    /*
       Name and Date fields: a label followed by an underline where
       the student writes their information.
    */
    doc.setFont('Times', 'normal');
    doc.setFontSize(12);
    doc.text('Name: ', MARGIN, y);

    const nameLabelW = doc.getTextWidth('Name: ');
    const nameLineW  = 60;   /* underline width in mm */
    doc.line(MARGIN + nameLabelW, y + 1, MARGIN + nameLabelW + nameLineW, y + 1);

    const dateX      = MARGIN + nameLabelW + nameLineW + 10;
    doc.text('Date: ', dateX, y);
    const dateLabelW = doc.getTextWidth('Date: ');
    const dateLineW  = 30;
    doc.line(dateX + dateLabelW, y + 1, dateX + dateLabelW + dateLineW, y + 1);

    y += ROW_H;


    /* ========================================================
       SECTION B — JOKE QUESTION
       ======================================================== */

    doc.setFont('Times', 'bold');
    doc.setFontSize(14);

    /*
       splitTextToSize() wraps the question text at USABLE_W so it
       never overflows into the margins, even for long questions.
       It returns an array of line strings; drawing them with increasing
       y produces the wrapped paragraph.
    */
    const questionLines = doc.splitTextToSize(jokeData.joke_q, USABLE_W);
    doc.text(questionLines, MARGIN, y);
    y += questionLines.length * 7 + GAP;


    /* ========================================================
       SECTION C — DECODE ROW

       The decode row has two visual sub-rows:
         C1 — Boxes (or separator characters for spaces/dashes).
         C2 — Code numbers printed below each box.

       Example for joke answer "WATCH DOGS":
         C1:  [ ]  [ ]  [ ]  [ ]  [ ]   –   [ ]  [ ]  [ ]  [ ]
         C2:   48   33   87   21   56         19   72   44   11
       ======================================================== */

    let x = MARGIN;

    /* ---- C1: Draw boxes and separator characters ----------- */
    doc.setFont('Times', 'normal');

    for (const entry of answerDict) {
        if (entry.isAlpha) {
            /*
               doc.rect(x, y, width, height, style)
               'S' = "Stroke only" — draw the outline but leave the inside blank.
               The student will write a letter inside this box.
            */
            doc.rect(x, y, boxW, BOX_H, 'S');

        } else {
            /*
               Separator (space → shown as blank gap, dash → shown as "–").
               We draw the character centered in its slot space so it sits
               at the same visual level as the boxes.
            */
            doc.setFontSize(12);
            const centerX = x + boxW / 2;
            const centerY = y + BOX_H / 2 + 2;   /* +2 mm to vertically centre baseline */
            doc.text(entry.letter, centerX, centerY, { align: 'center' });
        }

        x += SLOT_W;   /* Advance to the next slot position */
    }

    y += BOX_H + 1;   /* Move below the boxes row (1 mm gap) */

    /* ---- C2: Draw code numbers below each box -------------- */
    x = MARGIN;
    doc.setFontSize(10);

    for (const entry of answerDict) {
        if (entry.isAlpha) {
            /*
               A thin horizontal line above each code number visually separates
               it from the box above, like a header underline.
            */
            doc.setLineWidth(0.3);
            doc.line(x, y, x + boxW, y);
            doc.setLineWidth(0.2);   /* Reset to standard thin line */

            /* Draw the code number centred under the box */
            const centerX = x + boxW / 2;
            doc.text(String(entry.problem.answer), centerX, y + 5, { align: 'center' });
        }
        x += SLOT_W;
    }

    y += ROW_H + GAP * 2;   /* Extra space after the decode row */


    /* ========================================================
       SECTION D — MATH PROBLEMS

       Layout:
         1. Collect only the entries that have problems (isAlpha entries).
         2. Shuffle them so problems appear in random order — if the
            student just filled boxes left-to-right they would reveal
            the joke immediately without doing the math.
         3. Process in groups of COLS (4). Each group prints three rows:
              D1 — First numbers (top of stacked equation)
              D2 — Sign + second numbers, plus a "solve here" underline
              D3 — Letter labels (tell the student which box to fill)
         4. Add vertical space between groups for readability.
       ======================================================== */

    /* Filter to entries that have a math problem attached */
    const alphaEntries   = answerDict.filter(entry => entry.isAlpha);

    /* Shuffle so problems appear in random order */
    const shuffledEntries = shuffleArray(alphaEntries);

    /* Process in batches of 4 (one row of 4 problems across the page) */
    for (let i = 0; i < shuffledEntries.length; i += COLS) {

        /*
           Array.slice(start, end) returns a portion of the array.
           This gives us at most COLS entries per batch without mutating
           the shuffledEntries array.
        */
        const batch = shuffledEntries.slice(i, i + COLS);

        /* ---- Page overflow guard ----------------------------- */
        /*
           If the next batch of problems would extend past the bottom
           margin, start a new page. We reserve space for 4 rows:
           D1 (row), D2 (row + underline), D3 (label row), plus a gap.
        */
        if (y + ROW_H * 4 > PAGE_H - BOTTOM) {
            doc.addPage();
            y = TOP;
        }

        /* ---- D1: First numbers (top of stacked equation) ----- */
        doc.setFont('Times', 'normal');
        doc.setFontSize(bodySize);

        for (let j = 0; j < batch.length; j++) {
            const entry  = batch[j];
            const colX   = MARGIN + j * COL_W;   /* Left edge of this column */
            const rightX = colX + NUMBER_W;       /* Right edge of number area */

            /*
               { align: 'right' } makes x the RIGHT edge of the text,
               so all numbers are right-aligned within their column.
               This mimics how stacked arithmetic looks on paper.
            */
            doc.text(String(entry.problem.first), rightX, y, { align: 'right' });
        }
        y += ROW_H;

        /* ---- D2: Sign + second numbers + underline ----------- */
        for (let j = 0; j < batch.length; j++) {
            const entry  = batch[j];
            const colX   = MARGIN + j * COL_W;
            const rightX = colX + NUMBER_W;

            /* Format: "+ 7" or "− 3" or "× 8" or "÷ 4" */
            const signedStr = `${sign} ${entry.problem.second}`;
            doc.text(signedStr, rightX, y, { align: 'right' });

            /*
               The underline is the "equals bar" in stacked arithmetic.
               It runs from the left edge to the right edge of the number
               area, 2 mm below the text baseline.
            */
            doc.setLineWidth(0.4);
            doc.line(colX, y + 2, colX + NUMBER_W, y + 2);
            doc.setLineWidth(0.2);
        }
        y += ROW_H;

        /* ---- D3: Letter labels ------------------------------- */
        /*
           The italic letter tells the student which box in the decode
           grid to fill once they have solved the math problem.
           It sits just to the right of the underline area.
        */
        doc.setFont('Times', 'italic');
        doc.setFontSize(10);

        for (let j = 0; j < batch.length; j++) {
            const entry = batch[j];
            const colX  = MARGIN + j * COL_W;
            doc.text(entry.letter, colX + LABEL_OFFSET, y);
        }

        /* Reset font for the next group */
        doc.setFont('Times', 'normal');
        doc.setFontSize(bodySize);

        y += ROW_H + GAP + 2;   /* Extra gap between problem groups */
    }


    /* ========================================================
       SECTION E — SAVE / DOWNLOAD
       ======================================================== */

    /*
       doc.save(filename) triggers the browser's file-download dialog.
       The filename is built from the joke's slug (a URL-safe identifier
       like "dogs_tell_time") so saved files are descriptive and safe
       to store on any operating system.
    */
    const filename = `math_jokes_${jokeData.filename}.pdf`;
    doc.save(filename);
}
