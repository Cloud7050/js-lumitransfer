# LumiNUS Quiz Transfer Automation

This easy-to-use script aims to make transferring LumiNUS quiz answers from your results page into your next attempt a breeze, thereby reducing tedium, frustration, and wasted time.

Helpful for:

- Quizzes that need individual pasting (eg many fill-in-blanks questions)
- Quizzes that need many attempts (eg not showing marks per question)
- Quizzes with randomised question & option order
- Quizzes that are simply long

Supported question types:

- Fill-in-blanks questions
- Multiple Response Questions (MRQs)
- Multiple Choice Questions (MCQs) & true-or-false questions

This script works by extracting & storing your quiz results' questions & answers locally. It can then retrieve & import that into your ongoing attempts. Additionally, it stores your marks per question (if shown), to use when importing to highlight the answers you may wish to modify.

⚠️ Strictly not to be used for academic dishonesty!

## Instructions

You do not need to download/install anything or know how to code to use these scripts.

1. **Copy script**: Open the script's contents and copy them in their *entirety* (try <kbd>Ctrl</kbd>-<kbd>A</kbd> + <kbd>Ctrl</kbd>-<kbd>C</kbd>). [Here's a convenient link to it](https://raw.githubusercontent.com/Cloud7050/js-lumitransfer/master/script.js)
2. **Go to quiz results**: Go to the page with your quiz *results* that you want to extract (*not* an ongoing attempt)
3. **Run script to extract**: Open your browser's DevTools (try F12 for Google Chrome). Go to its *console* tab and paste the script in. Press <kbd>Enter</kbd>. You should see some logs, then a success message at the end
4. **Go to ongoing quiz**: Go to the page with your *ongoing* quiz attempt that you want to import your answers into
5. **Run script again to import**: Open your browser's DevTools again, paste the script into the *console*, and press <kbd>Enter</kbd>. You should see some more logs, then another success message at the end

Repeatedly running the script as needed should enable the rapid transfer of your answers to each next attempt for further modification. You could keep the script in your clipboard for this, or you could just press <kbd>↑</kbd> while in the console to bring back what you last entered (useful if your clipboard gets filled with other things between attempts, eg from composing math formulae or code to answer questions).

Video showcase (older footage): <https://youtu.be/pnGHU86THv4>

## Note

Keep an eye out for any yellow warnings (or even red errors) that the script may log while running. You may need to respond appropriately to issues the script encounters (eg checking that an impacted question has the expected answers after importing). Feel free to contact me about bugs or features on Discord @ Cloud#4535
