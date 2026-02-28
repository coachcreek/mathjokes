/**
 * utils.js — Shared utility functions for all web-apps projects
 *
 * PURPOSE:
 * These are general-purpose helper functions that are useful across
 * many different applications. Load this file BEFORE any app-specific
 * scripts so all apps can use these functions.
 *
 * HOW JAVASCRIPT FILES WORK IN THE BROWSER:
 * When a browser loads a <script src="utils.js"> tag, it runs the file
 * immediately. Functions declared with "function myFn() {}" become
 * available as global variables — any other script loaded afterwards
 * can call them. This is why load ORDER in your HTML matters.
 *
 * USAGE in HTML:
 *   <!-- Load shared utilities FIRST -->
 *   <script src="../shared/js/utils.js"></script>
 *   <!-- Then load app-specific files that may call these functions -->
 *   <script src="js/app.js"></script>
 */


/* ============================================================
   RANDOMNESS HELPERS
   ============================================================ */

/**
 * Returns a random integer between min and max, INCLUSIVE on both ends.
 *
 * HOW IT WORKS:
 *   Math.random() returns a decimal in [0, 1) — that is, 0 is possible
 *   but 1 is never returned. For example: 0, 0.37, 0.999...
 *
 *   To get an integer in [min, max]:
 *   1. Scale: multiply by (max - min + 1) to cover the full range.
 *   2. Floor:  Math.floor() rounds DOWN to the nearest integer.
 *   3. Shift:  add min to start the range at min, not 0.
 *
 * @param {number} min - The smallest integer that can be returned.
 * @param {number} max - The largest integer that can be returned.
 * @returns {number} A random integer between min and max (inclusive).
 *
 * @example
 *   randomInt(1, 6);    // Simulates a six-sided die: returns 1–6
 *   randomInt(0, 99);   // Returns 0–99
 *   randomInt(5, 5);    // Always returns 5 (min === max)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Returns a randomly chosen element from an array.
 *
 * Uses randomInt to pick a valid index (0 to arr.length - 1).
 * Does NOT modify the original array.
 *
 * @param {Array} arr - The array to pick from. Must not be empty.
 * @returns {*} One element from the array, chosen at random.
 * @throws {Error} If the array is empty or not provided.
 *
 * @example
 *   randomChoice(['apple', 'banana', 'cherry']); // → one of the three
 *   randomChoice([42]);                           // → always 42
 */
function randomChoice(arr) {
    if (!arr || arr.length === 0) {
        throw new Error('randomChoice: cannot pick from an empty array.');
    }
    return arr[randomInt(0, arr.length - 1)];
}


/**
 * Returns a SHUFFLED COPY of an array.
 * The original array is NOT modified (this is a "pure" function).
 *
 * ALGORITHM — Fisher-Yates Shuffle:
 * This is the standard algorithm for producing unbiased random permutations.
 * "Unbiased" means every possible ordering of the elements is equally likely.
 *
 * How it works (example with [A, B, C, D]):
 *   i=3: pick random j in [0,3]. Swap arr[3] ↔ arr[j]. (D moves somewhere)
 *   i=2: pick random j in [0,2]. Swap arr[2] ↔ arr[j]. (C moves somewhere)
 *   i=1: pick random j in [0,1]. Swap arr[1] ↔ arr[j]. (B moves somewhere)
 *   i=0: only one element left, nothing to do.
 * Working backwards ensures each element is swapped into a truly random slot.
 *
 * @param {Array} arr - The array to shuffle.
 * @returns {Array} A new array with the same elements in random order.
 *
 * @example
 *   shuffleArray([1, 2, 3, 4]);  // → e.g. [3, 1, 4, 2]
 *   shuffleArray(['a', 'b']);    // → ['a','b'] or ['b','a'] with equal probability
 */
function shuffleArray(arr) {
    /*
       Array.prototype.slice() with no arguments creates a SHALLOW COPY.
       "Shallow" means nested objects inside are not cloned, but for a
       flat array of primitives or references, this is what we want.
    */
    const copy = arr.slice();

    /*
       Start from the last index (copy.length - 1) and work backwards to 1.
       At each step i, pick a random index j in [0, i] and swap.
       The element at the end of each step is now in its final shuffled place.
    */
    for (let i = copy.length - 1; i > 0; i--) {
        const j = randomInt(0, i);

        /*
           ES6 "destructuring assignment" swap — a clean way to swap
           two array elements without a temporary variable:
               [a, b] = [b, a]
           The right side creates a temporary array [b, a], then
           the left side unpacks it back into a and b.
        */
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}


/* ============================================================
   NUMBER HELPERS
   ============================================================ */

/**
 * Clamps a number so it stays within [min, max].
 * If value < min, returns min.
 * If value > max, returns max.
 * Otherwise returns value unchanged.
 *
 * @param {number} value - The number to constrain.
 * @param {number} min   - The lower bound.
 * @param {number} max   - The upper bound.
 * @returns {number} The clamped value.
 *
 * @example
 *   clamp(150, 1, 100);  // → 100  (too high)
 *   clamp(-5,  1, 100);  // → 1    (too low)
 *   clamp(42,  1, 100);  // → 42   (within range, unchanged)
 */
function clamp(value, min, max) {
    /*
       Math.max(value, min) ensures the result is at least min.
       Math.min(..., max) then ensures it doesn't exceed max.
       The two calls are nested: the inner result feeds into the outer.
    */
    return Math.min(Math.max(value, min), max);
}


/**
 * Generates an array of integers from start to end (inclusive).
 * Similar to Python's range() built-in.
 *
 * @param {number} start      - First integer.
 * @param {number} end        - Last integer (included in the result).
 * @param {number} [step=1]   - Increment between values. Must be positive.
 * @returns {number[]} Array of integers.
 *
 * @example
 *   range(1, 5);      // → [1, 2, 3, 4, 5]
 *   range(0, 10, 2);  // → [0, 2, 4, 6, 8, 10]
 *   range(5, 5);      // → [5]
 */
function range(start, end, step = 1) {
    const result = [];
    for (let i = start; i <= end; i += step) {
        result.push(i);
    }
    return result;
}


/* ============================================================
   STRING HELPERS
   ============================================================ */

/**
 * Converts a number to a string with an ordinal suffix.
 * (1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", etc.)
 *
 * SPECIAL CASES:
 * Numbers ending in 11, 12, or 13 use "th" regardless of their
 * last digit (11th, 12th, 13th — NOT 11st, 12nd, 13rd).
 *
 * @param {number} n - A positive integer.
 * @returns {string} The number with its ordinal suffix appended.
 *
 * @example
 *   ordinal(1);   // → "1st"
 *   ordinal(11);  // → "11th"  (exception)
 *   ordinal(21);  // → "21st"
 *   ordinal(23);  // → "23rd"
 */
function ordinal(n) {
    const suffixMap = ['th', 'st', 'nd', 'rd'];
    const mod100 = n % 100;

    /*
       Check for the 11–13 exception first.
       Otherwise, mod the number by 10 to get the last digit,
       and look up the suffix. If the last digit is > 3, use 'th'.
    */
    const suffix = (mod100 >= 11 && mod100 <= 13)
        ? 'th'
        : (suffixMap[n % 10] || 'th');

    return n + suffix;
}


/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 *
 * WHY THIS MATTERS:
 * If you ever put user-supplied text directly into innerHTML, a
 * malicious user could inject <script> tags or event handlers.
 * Always escape text that comes from outside your code before
 * inserting it into the DOM as HTML.
 *
 * @param {string} str - The string to escape.
 * @returns {string} The string with HTML characters replaced by entities.
 *
 * @example
 *   escapeHtml('<b>Hello</b>');  // → '&lt;b&gt;Hello&lt;/b&gt;'
 *   escapeHtml('1 & 2');         // → '1 &amp; 2'
 */
function escapeHtml(str) {
    /*
       We create a temporary <div> element (not attached to the page),
       set its text content (which is automatically safe), then read
       back the innerHTML — the browser has done the escaping for us.
    */
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


/* ============================================================
   DOM HELPERS
   ============================================================ */

/**
 * Shorthand for document.getElementById().
 * Reduces boilerplate when selecting elements by ID.
 *
 * @param {string} id - The element's id attribute.
 * @returns {HTMLElement|null} The found element, or null if not found.
 *
 * @example
 *   const btn = getById('submit-btn');
 *   btn.addEventListener('click', handleSubmit);
 */
function getById(id) {
    return document.getElementById(id);
}


/**
 * Shows an element by removing its 'u-hidden' class (defined in base.css).
 * @param {HTMLElement} el - The element to make visible.
 */
function showElement(el) {
    el.classList.remove('u-hidden');
}


/**
 * Hides an element by adding its 'u-hidden' class (defined in base.css).
 * @param {HTMLElement} el - The element to hide.
 */
function hideElement(el) {
    el.classList.add('u-hidden');
}
