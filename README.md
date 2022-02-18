# LumiNUS Quiz Transfer Automation

This easy-to-use pair of scripts aims to make transferring LumiNUS quiz answers from your results page into your next attempt a breeze, thereby reducing tedium, frustration & wasted time.

Helpful for:

- Quizzes that need individual pasting (eg many open-ended blanks)
- Quizzes that need many attempts (eg not showing per-question marks)
- Quizzes that randomly order their questions & answers
- Quizzes that are simply long

**Currently only supports open-ended questions. Not MCQs or MRQs (yet?).**

⚠️ Strictly not to be used for academic dishonesty!

## Instructions

You do not need to know how to code or install anything to use these scripts.

1. Navigate to the `extractor` script's contents. ([Here's a convenient link](https://raw.githubusercontent.com/Cloud7050/js-lumitransfer/master/extractor.js).) Copy the script in its *entirety*
2. Navigate to the page with your quiz *results* that you want to extract (*not* an ongoing attempt)
3. Open your browser's DevTools (try F12 on Chrome). Go to its *console* tab & paste the `extractor` script in
4. Press enter. You should see a bunch of logs, then a huge chunk of gibberish at the bottom, something like `[{"headerText":"Fill in the blanks","bodyText":" ...`. Copy that chunk of data in its *entirety* & paste it to a temporary location (eg Notepad)
5. Navigate to the `importer` script's contents. ([Here's a convenient link](https://raw.githubusercontent.com/Cloud7050/js-lumitransfer/master/importer.js).) Copy the script in its *entirety*
6. Navigate to the page with your *ongoing* quiz attempt that you want to import the data into
7. Open your browser's DevTools again, go to its *console* tab, & paste the `importer` script in
8. Press enter. You should be prompted to paste your data in. Do so, then press ok
9. The data should now have been used to overwrite the fields of any matching questions

Video showcase: <https://youtu.be/VEKyakTH0CU>
