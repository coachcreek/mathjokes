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

    /* --- Combobox elements --- */

    /* Outer wrapper div for the whole combobox widget */
    const jokeComboboxEl    = getById('joke-combobox');

    /* The button that users click to open/close the panel */
    const jokeComboboxTrigger = getById('joke-combobox-trigger');

    /* The <span> inside the trigger that shows the selected joke label */
    const jokeComboboxText  = jokeComboboxTrigger.querySelector('.joke-combobox__trigger-text');

    /* The floating panel containing the search input and option list */
    const jokeComboboxPanel = getById('joke-combobox-panel');

    /* The search input inside the panel */
    const jokeComboboxSearch = getById('joke-combobox-search');

    /* The <ul role="listbox"> that holds the <li role="option"> items */
    const jokeComboboxList  = getById('joke-combobox-listbox');

    /* Hidden <input> that stores the machine-readable selected value */
    const jokeValueEl       = getById('joke-value');

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

       problemTypeSelect fires 'change' whenever the user picks a new item.
       generateBtn fires 'click' when the user clicks it.
       The combobox has its own internal event wiring inside initJokeCombobox().
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
        /*
           jokeValueEl is the hidden <input id="joke-value"> whose value is
           updated by the combobox whenever the user selects an option.
           It holds the same values the old <select> did: "random" or a
           numeric id string like "42".
        */
        const jokeId = jokeValueEl.value;

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
       JOKE COMBOBOX

       A custom searchable dropdown that replicates the Streamlit selectbox
       experience: clicking the control opens a panel with an integrated
       search field at the top and a scrollable list of options below.
       Typing immediately filters the list in real time — no separate
       search box required.

       STATE managed by this section:
         jokeValueEl.value       — machine-readable selected value
                                   ("random" or a numeric id string like "42")
         jokeComboboxText content — human-readable label shown on the trigger
         jokeComboboxPanel.hidden — true = closed, false = open
         activeIndex             — keyboard-highlighted option index (−1 = none)

       HOW OPTION NODES ARE BUILT:
         Each <li> in jokeComboboxList stores its value and search text in
         data-* attributes, set once at population time, so filtering only
         needs to read these attributes rather than recompute them.

       ARIA COMBOBOX PATTERN (W3C ARIA 1.2):
         trigger:  role="combobox" aria-haspopup="listbox" aria-expanded
         listbox:  role="listbox"
         options:  role="option"  aria-selected  id (for aria-activedescendant)
    ---------------------------------------------------------- */

    /*
       The index of the option currently highlighted by keyboard navigation.
       −1 means "no keyboard highlight" (mouse is in control, or panel just opened).
       We track this separately from the *selected* value so the user can
       arrow through options without committing a selection until they press Enter.
    */
    let activeIndex = -1;

    /**
     * Populates the combobox list with one <li> per production-ready joke,
     * plus a "Random" item at the top.
     *
     * Uses prodJokes (defined in jokes.js) — draft jokes with is_prod: false
     * are automatically excluded.
     *
     * The list is populated once at page load. Filtering hides/shows items
     * without re-creating them, for efficiency.
     */
    function populateJokeCombobox() {
        /*
           Build the full list of options: Random first, then every prod joke.
           We create one array of plain objects so the loop below is uniform.
        */
        const allOptions = [
            { value: 'random', label: '🎲 Random — a different joke each time', search: 'random' },
            ...prodJokes.map(joke => ({
                value:  String(joke.id),
                label:  `${joke.joke_q} [${joke.joke_a}]`,
                /*
                   search holds the text we match against when the teacher types.
                   Lowercase at creation time so we never have to lowercase it again
                   inside the hot path of filterCombobox().
                */
                search: `${joke.joke_q} ${joke.joke_a}`.toLowerCase(),
            })),
        ];

        allOptions.forEach(function (opt, index) {
            /*
               Each option is an <li> with role="option" (ARIA listbox pattern).
               id="joke-opt-N" lets us reference it via aria-activedescendant
               on the trigger when keyboard navigation highlights this item.
            */
            const li = document.createElement('li');
            li.className       = 'joke-combobox__option';
            li.id              = `joke-opt-${index}`;
            li.role            = 'option';
            li.dataset.value   = opt.value;
            li.dataset.search  = opt.search;
            li.textContent     = opt.label;

            /*
               Mark the first item (Random) as selected on load, matching
               jokeValueEl's initial value of "random".
            */
            li.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

            /*
               Clicking an option selects it and closes the panel.
               We use 'mousedown' instead of 'click' because 'mousedown'
               fires before the search input's 'blur' event. If we used
               'click', the panel would sometimes close (on blur) before
               the click registered, making options un-clickable.
            */
            li.addEventListener('mousedown', function (e) {
                /*
                   Prevent the search input from losing focus, which would
                   trigger the blur → close sequence before this mousedown
                   handler can select the option.
                */
                e.preventDefault();
                selectOption(li);
                closeCombobox();
            });

            jokeComboboxList.appendChild(li);
        });
    }


    /* ----------------------------------------------------------
       OPEN / CLOSE
    ---------------------------------------------------------- */

    /**
     * Opens the combobox panel, clears the search field, shows all options,
     * and moves focus to the search input so the teacher can type immediately.
     */
    function openCombobox() {
        /* Reset search so the full list is visible every time the panel opens */
        jokeComboboxSearch.value = '';
        filterCombobox('');

        /* Reset keyboard highlight */
        activeIndex = -1;

        /* Show the panel */
        jokeComboboxPanel.hidden = false;

        /* Update ARIA state on the trigger */
        jokeComboboxTrigger.setAttribute('aria-expanded', 'true');

        /*
           Move focus into the search input so the teacher can type right away.
           We use a short setTimeout because some browsers need a tick after the
           panel becomes visible before focus() takes effect.
        */
        setTimeout(function () { jokeComboboxSearch.focus(); }, 0);
    }

    /**
     * Closes the combobox panel.
     *
     * @param {boolean} [returnFocus=false] - When true, moves focus back to the
     *   trigger button after closing. Pass true when closing via keyboard (Escape
     *   or Tab) so keyboard users can continue tabbing through the page from a
     *   predictable position. Pass false (or omit) when closing via a mouse click,
     *   so we do NOT steal focus away from whatever the user just clicked on.
     */
    function closeCombobox(returnFocus) {
        jokeComboboxPanel.hidden = true;
        jokeComboboxTrigger.setAttribute('aria-expanded', 'false');
        jokeComboboxTrigger.removeAttribute('aria-activedescendant');
        activeIndex = -1;

        /*
           Only return focus to the trigger when closing via keyboard.
           When closing via mouse click, the browser naturally moves focus
           to whatever was clicked — calling focus() here would steal that
           focus away, which is disruptive and confusing for the user.
        */
        if (returnFocus) {
            jokeComboboxTrigger.focus();
        }
    }


    /* ----------------------------------------------------------
       FILTERING
    ---------------------------------------------------------- */

    /**
     * Filters the option list to show only items whose search text contains
     * the given query. Called on every keystroke in jokeComboboxSearch.
     *
     * @param {string} query - Already lowercased search string.
     */
    function filterCombobox(query) {
        const trimmed = query.trim();
        let visibleCount = 0;

        /* Loop over every <li> option in the list */
        const items = jokeComboboxList.querySelectorAll('.joke-combobox__option');
        items.forEach(function (item) {
            const searchText = item.dataset.search || '';
            /*
               An empty query shows everything.
               "Random" (search text = "random") is always shown, which works
               automatically because "random".includes('') is always true and
               the user is unlikely to type a query that excludes it.
            */
            const matches = trimmed === '' || searchText.includes(trimmed);

            item.hidden = !matches;
            if (matches) { visibleCount++; }
        });

        /*
           Reset keyboard highlight whenever the filter changes,
           since the visible set of items has changed.
        */
        activeIndex = -1;
        jokeComboboxTrigger.removeAttribute('aria-activedescendant');

        return visibleCount;
    }


    /* ----------------------------------------------------------
       SELECTION
    ---------------------------------------------------------- */

    /**
     * Marks an option as selected: updates the hidden value input,
     * the trigger button label, and the aria-selected attributes.
     *
     * @param {HTMLElement} selectedLi - The <li> option element to select.
     */
    function selectOption(selectedLi) {
        /* Write the machine-readable value so getFormValues() can read it */
        jokeValueEl.value = selectedLi.dataset.value;

        /* Update the visible label on the trigger button */
        jokeComboboxText.textContent = selectedLi.textContent;

        /*
           Update aria-selected: clear it on all options, then set it on the
           newly chosen one. This keeps the ARIA state in sync with the UI.
        */
        const items = jokeComboboxList.querySelectorAll('.joke-combobox__option');
        items.forEach(function (item) {
            item.setAttribute('aria-selected', 'false');
        });
        selectedLi.setAttribute('aria-selected', 'true');
    }


    /* ----------------------------------------------------------
       KEYBOARD NAVIGATION
    ---------------------------------------------------------- */

    /**
     * Returns the array of currently visible (non-hidden) option elements.
     * Used by keyboard navigation to step through only the visible items.
     *
     * @returns {HTMLElement[]}
     */
    function getVisibleOptions() {
        return Array.from(
            jokeComboboxList.querySelectorAll('.joke-combobox__option:not([hidden])')
        );
    }

    /**
     * Scrolls a list item into view within the scrollable listbox, if needed.
     * Uses 'nearest' block alignment to avoid unnecessary large scrolls.
     *
     * @param {HTMLElement} item - The option element to scroll to.
     */
    function scrollOptionIntoView(item) {
        item.scrollIntoView({ block: 'nearest' });
    }

    /**
     * Moves the keyboard highlight to the option at the given index within
     * the visible options array. Handles aria-activedescendant and scroll.
     *
     * @param {number} index - Index into the visible options array.
     * @param {HTMLElement[]} visibleOptions - The current visible options.
     */
    function highlightOption(index, visibleOptions) {
        /* Remove highlight class from any previously highlighted item */
        jokeComboboxList
            .querySelectorAll('.joke-combobox__option--active')
            .forEach(function (el) { el.classList.remove('joke-combobox__option--active'); });

        if (index < 0 || index >= visibleOptions.length) {
            /* Index out of range — clear highlight */
            jokeComboboxTrigger.removeAttribute('aria-activedescendant');
            activeIndex = -1;
            return;
        }

        activeIndex = index;
        const item = visibleOptions[index];
        item.classList.add('joke-combobox__option--active');

        /*
           aria-activedescendant points the trigger's ARIA focus to this item,
           so screen readers announce it without moving DOM focus away from the
           search input (which the teacher may still be typing into).
        */
        jokeComboboxTrigger.setAttribute('aria-activedescendant', item.id);

        scrollOptionIntoView(item);
    }


    /* ----------------------------------------------------------
       COMBOBOX EVENT WIRING
    ---------------------------------------------------------- */

    /*
       Trigger: toggle open/close on click.
    */
    jokeComboboxTrigger.addEventListener('click', function () {
        if (jokeComboboxPanel.hidden) {
            openCombobox();
        } else {
            closeCombobox();
        }
    });

    /*
       Search input: filter on every keystroke, plus keyboard navigation.
    */
    jokeComboboxSearch.addEventListener('input', function () {
        filterCombobox(jokeComboboxSearch.value.toLowerCase());
    });

    jokeComboboxSearch.addEventListener('keydown', function (e) {
        const visibleOptions = getVisibleOptions();

        if (e.key === 'ArrowDown') {
            /*
               Move highlight one step down (or wrap to 0 if at the bottom).
               We also handle the case where activeIndex is −1 (no current
               highlight) by starting at 0.
            */
            e.preventDefault();   /* Prevent the page from scrolling */
            const next = activeIndex < visibleOptions.length - 1
                ? activeIndex + 1
                : 0;
            highlightOption(next, visibleOptions);

        } else if (e.key === 'ArrowUp') {
            /*
               Move highlight one step up (or wrap to the last item).
            */
            e.preventDefault();
            const prev = activeIndex > 0
                ? activeIndex - 1
                : visibleOptions.length - 1;
            highlightOption(prev, visibleOptions);

        } else if (e.key === 'Enter') {
            /*
               Confirm the highlighted option, or if nothing is highlighted
               but there is exactly one visible result, select that one.
               Pass returnFocus=true so the trigger is focused after selection,
               keeping the keyboard flow predictable for the user.
            */
            e.preventDefault();
            if (activeIndex >= 0 && visibleOptions[activeIndex]) {
                selectOption(visibleOptions[activeIndex]);
                closeCombobox(true);
            } else if (visibleOptions.length === 1) {
                selectOption(visibleOptions[0]);
                closeCombobox(true);
            }

        } else if (e.key === 'Escape') {
            /* Close without changing the selection; return focus to trigger. */
            closeCombobox(true);

        } else if (e.key === 'Tab') {
            /*
               Tab closes the panel. We do NOT preventDefault here so that
               tab focus continues moving forward in the page normally.
               We also do NOT return focus to the trigger — we let the browser
               move focus to the next focusable element as usual.
            */
            closeCombobox();
        }
    });

    /*
       Close the panel when the search input loses focus, UNLESS focus is
       moving to an option inside the panel (handled by the mousedown listener
       on each option, which calls e.preventDefault() to block this blur).
    */
    jokeComboboxSearch.addEventListener('blur', function () {
        /*
           Use a short delay so that a mousedown on an option (which fires
           before blur) can call e.preventDefault() and prevent this close.
           Without the delay, closeCombobox() would run before mousedown.
        */
        setTimeout(function () {
            /*
               Only close if focus has genuinely left the combobox widget.
               document.activeElement tells us where focus went.
            */
            if (!jokeComboboxEl.contains(document.activeElement)) {
                closeCombobox();
            }
        }, 150);
    });

    /*
       Close the panel when clicking anywhere outside the combobox widget.
       'mousedown' on the document fires before 'click' on any element, so
       we can catch outside clicks before any inner element handles them.
    */
    document.addEventListener('mousedown', function (e) {
        if (!jokeComboboxEl.contains(e.target)) {
            if (!jokeComboboxPanel.hidden) {
                closeCombobox();
            }
        }
    });


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

    populateJokeCombobox();
    restoreProblemType();   /* ← restore before updateExamples so the preview
                                 reflects the restored selection right away */
    updateExamples();

});   /* End of DOMContentLoaded */
