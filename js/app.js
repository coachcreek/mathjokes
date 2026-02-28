/*
 * Global variables provided by scripts loaded before this one in index.html.
 * Declaring them here prevents IDE "variable not found" warnings.
 * These are NOT redeclared — they are just annotations telling static
 * analysis tools that these names exist at runtime as browser globals.
 *
 * From js/utils.js:
 *   randomChoice, shuffleArray, clamp, getById, showElement, hideElement
 * From js/jokes.js:
 *   jokes
 * From js/worksheet.js:
 *   PROBLEM_SUBTYPES, createProblemList, getSampleProblems,
 *   createAnswerDict, generateWorksheetPDF
 */
/* global randomChoice, getById, showElement, hideElement */
/* global jokes, prodJokes */
/* global PROBLEM_SUBTYPES, createProblemList, getSampleProblems, createAnswerDict, generateWorksheetPDF */

/**
 * app.js — Main Application Controller
 *
 * This file connects the HTML dropdown to the worksheet logic.
 * It is responsible for:
 *   1. Reading the teacher's chosen problem subtype from the dropdown.
 *   2. Validating the selection and displaying error messages if needed.
 *   3. Updating the "Example Problems" preview whenever the selection changes.
 *   4. Triggering PDF generation when the "Create Worksheet" button is clicked.
 *
 * DESIGN CHANGE FROM THE ORIGINAL VERSION:
 *   The previous design used four range sliders (min/max for each operand).
 *   While flexible, sliders required teachers to understand the mathematical
 *   implications of arbitrary number ranges, which was confusing and error-prone.
 *
 *   The new design uses a single dropdown that lists specific, curriculum-aligned
 *   problem subtypes (e.g. "×7 table", "Subtracting 1–3 from numbers"). All
 *   number-range logic lives inside worksheet.js (in PROBLEM_SUBTYPES), keeping
 *   this file focused on UI behaviour only.
 *
 * JAVASCRIPT EVENT-DRIVEN PROGRAMMING (overview):
 *   Browser JavaScript is REACTIVE — you register functions (called "event
 *   listeners" or "callbacks") to run when something happens (a click, a
 *   selection change, etc.).
 *
 *   The pattern is:
 *     element.addEventListener('eventName', function() { … });
 *
 *   Common event names:
 *     'click'   — user clicks or taps the element
 *     'change'  — fires when the user finishes changing a value
 *     'input'   — fires continuously as the user types or drags
 *
 * DEPENDENCIES (must be loaded before this file in index.html):
 *   - js/utils.js   (randomChoice, getById, showElement, hideElement)
 *   - js/jokes.js          (the "jokes" array)
 *   - js/worksheet.js      (PROBLEM_SUBTYPES, createProblemList,
 *                           getSampleProblems, createAnswerDict,
 *                           generateWorksheetPDF)
 */


/* ============================================================
   PAGE INITIALIZATION

   The 'DOMContentLoaded' event fires when the browser has finished
   parsing the HTML into a tree of elements (the DOM = Document
   Object Model). It fires BEFORE images and fonts finish loading,
   which is fine — we only need the HTML structure to be ready.

   All setup code lives inside this listener so we are certain that
   every element we reference (buttons, selects, etc.) exists by
   the time we try to find it.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       ELEMENT REFERENCES

       We grab all the HTML elements we need and store them in
       variables. This is faster than calling getElementById()
       repeatedly and makes the code easier to read.
    ---------------------------------------------------------- */

    /* The <select> dropdown populated with problem subtype options */
    const problemTypeSelect = getById('problem-type');

    /* The <ul> that shows 3 sample equations in the preview panel */
    const examplesListEl    = getById('examples-list');

    /* The <select> for choosing a specific joke (or leaving it on Random) */
    const jokeSelectEl      = getById('joke-select');

    /* The main "Create Worksheet PDF" button */
    const generateBtn       = getById('generate-btn');

    /* Error message: outer container div (shown/hidden) */
    const errorEl           = getById('error-message');

    /* Error message: inner span where the error text is written */
    const errorTextEl       = getById('error-text');

    /* Success / informational status message */
    const statusEl          = getById('status-message');


    /* ----------------------------------------------------------
       EVENT LISTENERS

       We attach one listener to the dropdown and one to the button.
       The dropdown fires 'change' whenever the user picks a new item.
       The button fires 'click' when the user clicks it.

       These are the only two interaction points in the simplified UI.
    ---------------------------------------------------------- */

    /*
       Whenever the teacher picks a different problem subtype from the
       dropdown, refresh the 3 example problems in the preview panel.
    */
    problemTypeSelect.addEventListener('change', updateExamples);

    /* The main "Generate Worksheet" button */
    generateBtn.addEventListener('click', handleGenerate);


    /* ----------------------------------------------------------
       FORM VALUE READER

       Reads the currently selected subtype from the dropdown and
       returns it along with the operator sign for that subtype.

       Having this as a function means we only write the reading
       logic once, and all callers just use the returned object.
    ---------------------------------------------------------- */

    /**
     * Returns the current UI state as a plain object.
     *
     * @returns {{ subtypeKey: string, sign: string }}
     *   subtypeKey — The value attribute of the selected <option>
     *                (e.g. 'multiplication-by-7').
     *   sign       — The operator symbol for that subtype
     *                (e.g. '×'), looked up from PROBLEM_SUBTYPES.
     */
    function getFormValues() {
        const subtypeKey = problemTypeSelect.value;

        /*
           PROBLEM_SUBTYPES is defined in worksheet.js and is available
           as a browser global because that file was loaded first.
        */
        const subtype = PROBLEM_SUBTYPES[subtypeKey];

        /*
           jokeId is either the string "random" (the default option) or a
           numeric id string like "1000007" (a specific joke chosen by the teacher).
        */
        const jokeId = jokeSelectEl.value;

        return {
            subtypeKey,
            sign:   subtype ? subtype.sign : '+',   /* safe fallback */
            jokeId,
        };
    }


    /* ----------------------------------------------------------
       INPUT VALIDATION

       Returns a descriptive error string if the selected subtype
       is somehow unusable, or null if everything looks good.

       In practice, all pre-defined subtypes in PROBLEM_SUBTYPES
       have well-sized problem pools, so this check should never
       fail during normal use. It exists as a safety net.
    ---------------------------------------------------------- */

    /**
     * Validates the selected problem subtype.
     *
     * @param {string} subtypeKey - The currently selected subtype key.
     * @returns {string|null} An error message, or null if valid.
     */
    function validateInputs(subtypeKey) {
        /*
           Generate the full problem list and count how many entries
           we got. We need at least a handful for the worksheet to work.
        */
        const problems = createProblemList(subtypeKey);

        if (problems.length < 5) {
            /*
               This would only happen if a custom/malformed subtype key
               were somehow passed in. For all built-in subtypes the pool
               is well above this threshold.
            */
            return (
                `This problem type only produces ${problems.length} problem(s). ` +
                'Please select a different problem type.'
            );
        }

        return null;   /* null = "no error" */
    }


    /* ----------------------------------------------------------
       EXAMPLE PROBLEMS PREVIEW

       Updates the 3 sample equations displayed in the preview card.
       Called when the page first loads and on every dropdown change.
    ---------------------------------------------------------- */

    /**
     * Regenerates the example-problems list based on the current selection.
     * Clears and rewrites the <ul id="examples-list"> in the preview panel.
     */
    function updateExamples() {
        const values = getFormValues();
        const error  = validateInputs(values.subtypeKey);

        if (error) {
            showError(error);
            examplesListEl.innerHTML = '';   /* Clear the example list */
            return;
        }

        hideError();

        /*
           Build the full problem pool for this subtype, then draw
           3 random examples from it for the preview.
        */
        const problems = createProblemList(values.subtypeKey);
        const samples  = getSampleProblems(problems, values.sign, 3);

        /*
           Array.map(fn) transforms each item: each equation string
           becomes an <li> HTML element string.
           Array.join('') merges them into one HTML string with no separator.
           We assign that string to innerHTML so the browser parses and
           renders the list items.

           NOTE: all values here come from our own controlled problem
           generation, not from user input, so innerHTML is safe to use.
        */
        examplesListEl.innerHTML = samples
            .map(s => `<li class="example-item">${s}</li>`)
            .join('');
    }


    /* ----------------------------------------------------------
       GENERATE BUTTON HANDLER

       Validates the selection, picks a random joke, builds the
       answer dictionary, and triggers the PDF download.
    ---------------------------------------------------------- */

    /**
     * Handles the "Create Worksheet PDF" button click.
     * Validates inputs, generates the PDF, and shows feedback to the user.
     */
    function handleGenerate() {
        const values = getFormValues();
        const error  = validateInputs(values.subtypeKey);

        if (error) {
            showError(error);
            return;
        }

        hideError();
        hideStatus();

        /*
           Disable the button while PDF generation runs to prevent
           accidental double-clicks (which could trigger two downloads).
        */
        generateBtn.disabled    = true;
        generateBtn.textContent = 'Generating…';

        /*
           setTimeout with 0 ms yields control back to the browser briefly.
           This allows the browser to repaint (showing the "Generating…"
           text and the disabled state) before the CPU-intensive PDF work
           begins. Without this, the button change would never be visible
           because the browser would not repaint until after the function
           returns.
        */
        setTimeout(function () {
            try {
                /* Build the full problem pool for the selected subtype */
                const problems = createProblemList(values.subtypeKey);

                /*
                   Resolve which joke to use:
                     "random" → pick one at random from prodJokes (different every click).
                     A numeric id string → find that specific joke in prodJokes.

                   We search only within prodJokes so that a joke with is_prod: false
                   can never be selected, even if its id is somehow passed in directly.

                   The fallback (|| randomChoice(prodJokes)) handles the unlikely
                   case where the stored id no longer matches any production joke
                   (e.g. if a joke was demoted to is_prod: false after being bookmarked).
                */
                const joke = (values.jokeId === 'random')
                    ? randomChoice(prodJokes)
                    : (prodJokes.find(j => String(j.id) === values.jokeId) || randomChoice(prodJokes));

                /*
                   Map each letter of the joke's answer to a unique math problem.
                   The returned array drives both the decode grid and the
                   problem grid in the PDF.
                */
                const answerDict = createAnswerDict(joke.joke_a, problems);

                /* Generate the PDF and trigger the browser's download dialog */
                generateWorksheetPDF(joke, answerDict, values.subtypeKey);

                /* Tell the teacher what joke was used so they can preview it */
                showStatus(`Worksheet downloaded! Joke: "${joke.joke_q}"`);

            } catch (err) {
                /*
                   If anything fails during generation, show a friendly error
                   in the UI rather than silently breaking. We also log to the
                   browser's developer console for debugging.
                   (Open DevTools with F12 → Console tab to see it.)
                */
                showError('Something went wrong generating the PDF. Please try again.');
                console.error('PDF generation error:', err);

            } finally {
                /*
                   "finally" always runs, even if an error was thrown above.
                   Re-enable the button so the teacher can generate another worksheet.
                */
                generateBtn.disabled    = false;
                generateBtn.textContent = '📄 Create Worksheet PDF';
            }
        }, 0);
    }


    /* ----------------------------------------------------------
       UI FEEDBACK HELPERS

       Small, focused functions for showing and hiding the error
       and status message boxes. Centralising these means we never
       repeat the same DOM manipulation in multiple places.
    ---------------------------------------------------------- */

    /**
     * Shows the error message box with the given text.
     * The ⚠️ icon in the HTML is preserved because we write only to
     * the inner text span (id="error-text"), not to the outer wrapper.
     *
     * @param {string} message - Human-readable error description.
     */
    function showError(message) {
        errorTextEl.textContent = message;
        showElement(errorEl);   /* showElement() defined in js/utils.js */
    }

    /**
     * Hides the error message box and clears its text.
     */
    function hideError() {
        hideElement(errorEl);   /* hideElement() defined in js/utils.js */
        errorTextEl.textContent = '';
    }

    /**
     * Shows the success / status message box.
     *
     * @param {string} message - Text to display.
     */
    function showStatus(message) {
        statusEl.textContent = message;
        showElement(statusEl);
    }

    /**
     * Hides the success / status message box.
     */
    function hideStatus() {
        hideElement(statusEl);
        statusEl.textContent = '';
    }


    /* ----------------------------------------------------------
       JOKE DROPDOWN POPULATION

       Appends one <option> per joke to the joke selector.
       We do this in JavaScript rather than in the HTML because:
         • The jokes array (in jokes.js) is the single source of truth.
         • Hard-coding 82 <option> tags in HTML would be error-prone
           and would drift out of sync whenever jokes are added or removed.

       Option format:  "[question] [answer]"
         The question is what students see on the worksheet.
         The answer (in brackets) helps the teacher identify the joke
         so they know what their class will be decoding.

       This function must be called AFTER DOMContentLoaded so the
       <select> element exists, and AFTER jokes.js has loaded so the
       global "jokes" array is available.
    ---------------------------------------------------------- */

    /**
     * Populates the joke <select> with one option per production-ready joke.
     * Uses "prodJokes" (defined in jokes.js) which contains only jokes where
     * is_prod is true — draft/candidate jokes are automatically excluded.
     *
     * The "Random" option already exists in the HTML; this function
     * appends the specific-joke options below it.
     */
    function populateJokeSelect() {
        for (const joke of prodJokes) {
            /*
               document.createElement('option') creates a new <option> element
               in memory but does not yet add it to the page.
               We set its properties, then append it to the <select>.
            */
            const option = document.createElement('option');

            /*
               The value is the joke's numeric id, stored as a string.
               HTML attribute values are always strings; we compare with
               String(j.id) in handleGenerate() to match them correctly.
            */
            option.value = String(joke.id);

            /*
               Display text: the full question so the teacher can recognise
               it, then the answer in square brackets to confirm the choice.
               Example: "What kind of dogs can tell time? [Watch Dogs]"
            */
            option.textContent = `${joke.joke_q} [${joke.joke_a}]`;

            jokeSelectEl.appendChild(option);
        }
    }


    /* ----------------------------------------------------------
       INITIAL STATE

       Run these once immediately when the page loads so that:
         • The joke dropdown is fully populated before the teacher
           interacts with it.
         • The example problems list is populated right away.
         • The user sees something useful without having to interact first.
    ---------------------------------------------------------- */

    populateJokeSelect();
    updateExamples();

});   /* End of DOMContentLoaded */
