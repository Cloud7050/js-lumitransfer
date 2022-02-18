# LumiNUS Quiz Transfer Automation

This easy-to-use pair of scripts aims to make transferring LumiNUS quiz answers from your results page into your next attempt a breeze, thereby reducing tedium, frustration & wasted time.

Helpful for:

- Quizzes that need individual pasting (eg many fill-in-blanks)
- Quizzes that need many attempts (eg not showing per-question marks)
- Quizzes that randomly order their questions & answers
- Quizzes that are simply long

**Currently only supports fill-in-blanks questions. Not MCQs or MRQs (yet?).**

⚠️ Strictly not to be used for academic dishonesty!

## Instructions

You do not need to download/install anything or know how to code to use these scripts.

1. Navigate to the `extractor` script's contents. ([Here's a convenient link](https://raw.githubusercontent.com/Cloud7050/js-lumitransfer/master/extractor.js).) Copy the script in its *entirety*
2. Navigate to the page with your quiz *results* that you want to extract (*not* an ongoing attempt)
3. Open your browser's DevTools (try F12 for Google Chrome). Go to its *console* tab & paste the `extractor` script in
4. Press enter. You should see some logs, then a success message at the end
5. Navigate to the `importer` script's contents. ([Here's a convenient link](https://raw.githubusercontent.com/Cloud7050/js-lumitransfer/master/importer.js).) Copy the script in its *entirety*
6. Navigate to the page with your *ongoing* quiz attempt that you want to import your answers into
7. Open your browser's DevTools again, go to its *console* tab, & paste the `importer` script in
8. Press enter. You should see some more logs, then another success message at the end

Video showcase (older process): <https://youtu.be/VEKyakTH0CU>

## Limitations

- If an MRQ option has no text whatsoever (eg only an *image* of $\overline{X}$), due to potentially randomised option order, the option cannot be uniquely identified & so gets skipped with a yellow warning
