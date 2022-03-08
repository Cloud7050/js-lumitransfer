(() => {
	const QuestionType = {
		// Angular fill-in-blanks
		BLANKS: "fib",

		// Angular multiple response question
		RESPONSES: "mrq",

		// Angular multiple choice question
		// Angular true or false
		CHOICES: "mcq-tof"
	};

	class TextPart {
		constructor(text) {
			Object.assign(
				this,
				{ text }
			);
		}
	}

	class NormalText extends TextPart {}

	class ImageSource extends TextPart {}

	class Scan {
		constructor(
			extractorMode,
			questionHolders,
			saveButton
		) {
			Object.assign(
				this,
				{
					extractorMode,
					questionHolders,
					saveButton
				}
			);
		}
	}

	class Question {
		constructor(
			textParts,
			input
		) {
			Object.assign(
				this,
				{
					textParts,
					input
				}
			);
		}
	}

	class Input {
		constructor(
			type,
			entries
		) {
			Object.assign(
				this,
				{
					type,
					entries
				}
			);
		}
	}

	class BlanksInput extends Input {
		constructor(
			textParts,
			entries
		) {
			super(
				QuestionType.BLANKS,
				entries
			);

			Object.assign(
				this,
				{ textParts }
			);
		}
	}

	class ResponsesInput extends Input {
		constructor(entries) {
			super(
				QuestionType.RESPONSES,
				entries
			);
		}
	}

	class ChoicesInput extends Input {
		constructor(entries) {
			super(
				QuestionType.CHOICES,
				entries
			);
		}
	}

	class Entry {
		constructor(control) {
			Object.assign(
				this,
				{ control }
			);
		}
	}

	class BlanksEntry extends Entry {
		constructor(
			text,
			control
		) {
			super(control);

			Object.assign(
				this,
				{ text }
			);
		}
	}

	class CheckedEntry extends Entry {
		constructor(
			textParts,
			checked,
			control
		) {
			super(control);

			Object.assign(
				this,
				{
					textParts,
					checked
				}
			);
		}
	}

	class ResponsesEntry extends CheckedEntry {}

	class ChoicesEntry extends CheckedEntry {}



	function l(content, group = false) {
		let f = (!group) ? console.log : console.group;
		f(
			// Skip instanceof check for type object + class String from new String()s
			(typeof content !== "string")
				? content
				: `>>> ${content}`
		);
	}

	function w(content) {
		console.warn(
			(typeof content !== "string")
				? content
				: `[!] ${content}!`
		);
	}

	function e(content) {
		console.error(
			(typeof content !== "string")
				? content
				: `ERR ${content}!`
		);
	}

	function d(content) {
		console.debug(
			(typeof content !== "string")
				? content
				: `*** ${content}`
		);
	}

	function extractTextParts(element) {
		let textParts = [];

		if (element.children.length === 0) {
			// Base case

			if (!element.matches("img")) {
				textParts.push(
					new NormalText(element.textContent)
				);
			} else {
				textParts.push(
					new ImageSource(element.src)
				);
			}
		} else {
			// Recurse

			[...element.children].forEach((child) => {
				textParts = [...textParts, ...extractTextParts(child)];
			});
		}

		return textParts;
	}

	function onScan() {
		let extractorMode;
		let saveButton;
		let quizHolder = document.querySelector("quiz-question-results");

		if (quizHolder !== null) {
			// Results quiz holder
			l("📈 Using extractor mode");
			extractorMode = true;
			saveButton = null;
		} else {
			quizHolder = document.querySelector("quiz-question-all");
			if (quizHolder === null) {
				e("No quiz holder found in page");
				return null;
			}

			// Ongoing quiz holder
			l("🪄 Using importer mode");
			extractorMode = false;

			let buttons = quizHolder.querySelectorAll("div.buttons > button");
			saveButton = [...buttons].find((button) => button.innerText === "Save For Later") ?? null;
			if (saveButton === null) w("No save button found among buttons");
		}

		let questionHolders = quizHolder.querySelectorAll("quiz-question-view");
		if (questionHolders.length === 0) {
			e("No question holders found in quiz holder");
			return null;
		}

		return new Scan(
			extractorMode,
			questionHolders,
			saveButton
		);
	}

	function onProcess(questionHolders, extractorMode) {
		let successCount = 0;
		let questionCount = 0;
		let questions = [];

		for (let questionHolder of questionHolders) {
			questionCount++;
			l(`⚙️ Processing page's Q${questionCount}...`, true);

			let headerQuestion = questionHolder.querySelector("div.question-header > *");
			if (headerQuestion === null) {
				e("No header question found in question holder");
				console.groupEnd();
				continue;
			}

			let textParts = extractTextParts(headerQuestion);
			if (textParts.length === 0) {
				e("No text parts extracted from header question");
				console.groupEnd();
				continue;
			}

			let input = tryProcessBlanks(questionHolder, extractorMode)
				?? tryProcessResponses(questionHolder, extractorMode)
				?? tryProcessChoices(questionHolder, extractorMode);
			if (input === null) {
				e("⚠️ Question type not supported");
				console.groupEnd();
				continue;
			}

			let question = new Question(textParts, input);
			d(question);

			questions.push(question);
			successCount++;
			console.groupEnd();
		}

		if (questions.length === 0) {
			e("No questions extracted from question holders");
			return null;
		}

		l(`📦 Processed ${successCount}/${questionCount} questions`);
		d(questions);
		return questions;
	}
	function tryProcessBlanks(questionHolder, extractorMode) {
		// Check if is this question type
		let blanksHolder = questionHolder.querySelector("question-view-fib");
		if (blanksHolder === null) return null;

		let blanksQuestion = blanksHolder.querySelector("span.question");
		if (blanksQuestion === null) {
			e("No blanks question found in blanks holder");
			return null;
		}

		let textParts = extractTextParts(blanksQuestion);
		if (textParts.length === 0) {
			e("No text parts extracted from blanks question");
			return null;
		}

		let entryHolders = blanksHolder.querySelectorAll("div.input");
		if (entryHolders.length === 0) {
			e("No entry holders found in blanks holder");
			return null;
		}

		let successCount = 0;
		let entryCount = 0;
		let entries = [];
		for (let entryHolder of entryHolders) {
			entryCount++;
			l(`⚙️ Processing entry #${entryCount}...`, true);

			let text;
			let input;
			if (extractorMode) {
				let textarea = entryHolder.querySelector("textarea.answer-fib");
				if (textarea === null) {
					e("No textarea found in entry holder");
					console.groupEnd();
					continue;
				}

				text = textarea.value;

				input = null;
			} else {
				text = null;

				input = entryHolder.querySelector("input.form-control");
				if (input === null) {
					e("No input found in entry holder");
					console.groupEnd();
					continue;
				}
			}

			entries.push(
				new BlanksEntry(text, input)
			);
			successCount++;
			console.groupEnd();
		}

		if (entries.length === 0) {
			e("No entries extracted from entry holders");
			return null;
		}

		l(`📦 Processed ${successCount}/${entryCount} entries`);
		return new BlanksInput(textParts, entries);
	}
	function tryProcessResponses(questionHolder, extractorMode) {
		let responsesHolder = questionHolder.querySelector("question-view-mrq");
		if (responsesHolder === null) return null;

		let entryHolders = responsesHolder.querySelectorAll("div.option-content");
		if (entryHolders.length === 0) {
			e("No entry holders found in responses holder");
			return null;
		}

		let successCount = 0;
		let entryCount = 0;
		let entries = [];
		for (let entryHolder of entryHolders) {
			entryCount++;
			l(`⚙️ Processing entry #${entryCount}...`, true);

			let textHolder = entryHolder.querySelector("div.text");
			if (textHolder === null) {
				e("No text holder found in entry holder");
				console.groupEnd();
				continue;
			}

			let textParts = extractTextParts(textHolder);
			if (textParts.length === 0) {
				e("No text parts extracted from text holder");
				console.groupEnd();
				continue;
			}

			let checkbox = entryHolder.querySelector("input[type=checkbox]");
			if (checkbox === null) {
				e("No checkbox found in entry holder");
				console.groupEnd();
				continue;
			}

			let checked = extractorMode
				? checkbox.checked
				: null;

			entries.push(
				new ResponsesEntry(
					textParts,
					checked,
					checkbox
				)
			);
			successCount++;
			console.groupEnd();
		}

		if (entries.length === 0) {
			e("No entries extracted from entry holders");
			return null;
		}

		l(`📦 Processed ${successCount}/${entryCount} entries`);
		return new ResponsesInput(entries);
	}
	function tryProcessChoices(questionHolder, extractorMode) {
		let choicesHolder = questionHolder.querySelector("question-view-mcq")
			?? questionHolder.querySelector("question-view-tof");
		if (choicesHolder === null) return null;

		let entryHolders = choicesHolder.querySelectorAll("div.option-content");
		if (entryHolders.length === 0) {
			e("No entry holders found in choices holder");
			return null;
		}

		let successCount = 0;
		let entryCount = 0;
		let entries = [];

		let soleButton = null;

		for (let entryHolder of entryHolders) {
			entryCount++;
			l(`⚙️ Processing entry #${entryCount}...`, true);

			let textHolder = entryHolder.querySelector("div.text");
			if (textHolder === null) {
				e("No text holder found in entry holder");
				console.groupEnd();
				continue;
			}

			let textParts = extractTextParts(textHolder);
			if (textParts.length === 0) {
				e("No text parts extracted from text holder");
				console.groupEnd();
				continue;
			}

			let button = entryHolder.querySelector("input[type=radio]");
			if (button === null) {
				e("No button found in entry holder");
				console.groupEnd();
				continue;
			}

			let checked;
			if (extractorMode) {
				checked = button.checked;

				if (checked) {
					if (soleButton !== null) {
						e("Multiple checked buttons found in entry holders");
						console.groupEnd();
						return null;
					}

					soleButton = button;
				}
			} else checked = null;

			entries.push(
				new ChoicesEntry(
					textParts,
					checked,
					button
				)
			);
			successCount++;
			console.groupEnd();
		}

		if (entries.length === 0) {
			e("No entries extracted from entry holders");
			return null;
		}

		l(`📦 Processed ${successCount}/${entryCount} entries`);
		return new ChoicesInput(entries);
	}



	let scan = onScan();
	if (scan === null) return;

	let questions = onProcess(scan.questionHolders, scan.extractorMode);
	if (questions === null) return;
})();
