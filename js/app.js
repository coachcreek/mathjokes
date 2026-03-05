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

    /* The search box that filters the joke dropdown as you type */
    const jokeSearchEl      = getById('joke-search');

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

    /*
       Filter the joke dropdown as the teacher types in the search box.
       'input' fires on every keystroke (unlike 'change' which only fires
       when the field loses focus), so the dropdown updates in real time.
    */
    jokeSearchEl.addEventListener('input', filterJokeSelect);


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

            /*
               data-search is used by filterJokeSelect() to match against
               the typed query. We store the combined question + answer in
               lowercase so the comparison is case-insensitive.
               Storing it here (once, at creation time) is faster than
               re-reading and lowercasing textContent on every keystroke.
            */
            option.dataset.search = `${joke.joke_q} ${joke.joke_a}`.toLowerCase();

            jokeSelectEl.appendChild(option);
        }
    }


    /* ----------------------------------------------------------
       JOKE SEARCH / FILTER

       Filters the joke <select> options in real time as the teacher
       types in the joke-search input.

       HOW IT WORKS:
         Each <option> in the joke dropdown stores the full search text
         (question + answer) in a data-search attribute, set once when
         the options are created in populateJokeSelect().

         On every keystroke, we compare the typed query against each
         option's data-search value. Non-matching options are hidden
         by setting the "hidden" attribute, which removes them from
         the visible list but keeps them in the DOM so they can
         reappear when the query changes.

         If the currently selected option becomes hidden (i.e. it no
         longer matches the filter), we reset the selection to "Random"
         so the dropdown never silently holds a hidden, invisible value.

         The "Random" option (value="random") is always shown regardless
         of the search query, so the teacher can always clear back to it.
    ---------------------------------------------------------- */

    /**
     * Filters the joke dropdown options based on the current search input.
     * Called on every 'input' event from jokeSearchEl.
     */
    function filterJokeSelect() {
        /*
           Normalize the query: lowercase and trimmed so that "WREC",
           " wrec", and "wrec" all match the same options.
        */
        const query = jokeSearchEl.value.toLowerCase().trim();

        /* Track whether the currently selected option is still visible */
        let selectedOptionIsVisible = false;

        /* Loop over every <option> in the joke dropdown */
        const options = jokeSelectEl.options;
        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            /* Always keep the "Random" option visible */
            if (option.value === 'random') {
                option.hidden = false;
                continue;
            }

            /*
               data-search holds the combined "question [answer]" text,
               set in populateJokeSelect(). We check if it contains the query.
               An empty query matches everything (shows all options).
            */
            const searchText = option.dataset.search || '';
            const matches    = query === '' || searchText.includes(query);

            option.hidden = !matches;

            /* Check if the currently-selected option is still visible */
            if (option.selected && matches) {
                selectedOptionIsVisible = true;
            }
        }

        /*
           If the selected option was hidden by the filter, reset to "Random"
           so the dropdown value is never an invisible, inaccessible entry.
        */
        if (!selectedOptionIsVisible) {
            jokeSelectEl.value = 'random';
        }
    }


    /* ----------------------------------------------------------
       PROBLEM TYPE PERSISTENCE WITH localStorage

       localStorage is a built-in browser feature that lets a web
       page save small pieces of text data that survive page refreshes
       and browser restarts (unlike regular JavaScript variables,
       which reset every time the page loads).

       We use it here to remember the last Problem Type the teacher
       chose. Next time they open the page, the dropdown is pre-set
       to that type instead of defaulting back to the first option.

       Key API calls:
         localStorage.setItem(key, value) — Save a string under a key.
         localStorage.getItem(key)        — Read back a saved string
                                            (returns null if not found).

       We store just the subtype key string (e.g. 'multiplication-by-7').
       That is small and safe — no personal data is stored.
    ---------------------------------------------------------- */

    /* The key we use to store the selection in localStorage */
    const STORAGE_KEY = 'mathjokes_last_problem_type';

    /**
     * Saves the currently selected problem type to localStorage so it
     * can be restored the next time the user visits the page.
     */
    function saveProblemType() {
        /*
           localStorage.setItem writes to the browser's local storage.
           If storage is disabled (e.g. in a private/incognito window
           with strict settings), this can throw an error. We catch it
           silently so the app still works — persistence just won't
           happen in that case.
        */
        try {
            localStorage.setItem(STORAGE_KEY, problemTypeSelect.value);
        } catch (e) {
            /* Storage is unavailable — that is fine, just skip saving */
        }
    }

    /**
     * Restores the previously saved problem type from localStorage.
     * If nothing was saved (first visit) or the saved key no longer
     * exists in PROBLEM_SUBTYPES, the dropdown stays on its default
     * first option.
     */
    function restoreProblemType() {
        let saved;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            /* Storage is unavailable — start fresh */
            return;
        }

        /*
           Only restore if:
             1. Something was actually saved (saved is not null).
             2. That key still exists as a valid subtype in worksheet.js.
                (It might not if a subtype was renamed or removed since
                 the user last visited.)
        */
        if (saved && PROBLEM_SUBTYPES[saved]) {
            problemTypeSelect.value = saved;
        }
    }

    /*
       Hook into the existing 'change' event listener so every time the
       teacher picks a new type, we also save it. We add this listener
       alongside the updateExamples() listener already registered above.
    */
    problemTypeSelect.addEventListener('change', saveProblemType);


    /* ----------------------------------------------------------
       INITIAL STATE

       Run these once immediately when the page loads so that:
         • The joke dropdown is fully populated before the teacher
           interacts with it.
         • The previously chosen problem type is restored (if any).
         • The example problems list is populated for the current
           (possibly restored) selection.
         • The user sees something useful without having to interact first.
    ---------------------------------------------------------- */

    populateJokeSelect();
    restoreProblemType();   /* ← restore before updateExamples so the preview
                                 reflects the restored selection right away */
    updateExamples();

});   /* End of DOMContentLoaded */
