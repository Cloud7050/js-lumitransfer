(() => {
	const TextPartType = {
		NORMAL: "normal",
		IMAGE: "image"
	};

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
		constructor(
			type,
			text
		) {
			Object.assign(
				this,
				{
					type,
					text
				}
			);
		}
	}

	class NormalText extends TextPart {
		constructor(text) {
			super(
				TextPartType.NORMAL,
				text
			);
		}
	}

	class ImageSource extends TextPart {
		constructor(text) {
			super(
				TextPartType.IMAGE,
				text
			);
		}
	}

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

		export() {
			return {
				textParts: this.textParts,
				input: this.input.export()
			};
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

		export() {
			return {
				type: this.type,
				entries: this.entries.map((entry) => entry.export())
			};
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

		export() {
			return {
				...super.export(),

				textParts: this.textParts
			};
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

		export() {
			return {};
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

		export() {
			return {
				...super.export(),

				text: this.text
			};
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

		export() {
			return {
				...super.export(),

				textParts: this.textParts,
				checked: this.checked
			};
		}
	}

	class ResponsesEntry extends CheckedEntry {}

	class ChoicesEntry extends CheckedEntry {}



	function l(content, group = false) {
		let consoleFunction = (!group) ? console.log : console.group;
		consoleFunction(
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
		let whitelistedNodes = [
			Node.ELEMENT_NODE,
			Node.TEXT_NODE
		];
		let children = [...element.childNodes].filter(
			(child) => whitelistedNodes.includes(child.nodeType)
		);

		let textParts = [];

		if (children.length === 0) {
			// Base case

			let isImage = element.nodeType === Node.ELEMENT_NODE
				&& element.matches("img");
			if (!isImage) {
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

			children.forEach((child) => {
				textParts = [...textParts, ...extractTextParts(child)];
			});
		}

		return textParts;
	}

	function compareTextParts(textParts1, textParts2) {
		if (textParts1.length !== textParts2.length) return false;

		return textParts1.every((textPart1, index) => {
			let textPart2 = textParts2[index];
			return textPart1.type === textPart2.type
				&& textPart1.text === textPart2.text;
		});
	}

	function triggerUpdate(
		element,
		type = "change"
	) {
		element.dispatchEvent(
			new Event(type)
		);
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
				e("⚠️ This script doesn't support this type of question");
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
		let entries = [];
		for (let entryHolder of entryHolders) {
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

		l(`(Processed ${successCount}/${entryHolders.length} entries)`);
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
		let entries = [];
		for (let entryHolder of entryHolders) {
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

		l(`(Processed ${successCount}/${entryHolders.length} entries)`);
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
		let entries = [];

		let soleButton = null;

		for (let entryHolder of entryHolders) {
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

		l(`(Processed ${successCount}/${entryHolders.length} entries)`);
		return new ChoicesInput(entries);
	}

	function onImport(_pageQuestions, storedData) {
		// Clone for importOne() to progressively remove overwritten questions
		let pageQuestions = [..._pageQuestions];

		let successCount = 0;
		let questionCount = 0;
		for (let storedQuestion of storedData) {
			questionCount++;
			l(`🔮 Importing stored question #${questionCount}...`, true);

			try {
				let success = importOne(storedQuestion, pageQuestions);
				if (success) successCount++;
			} catch (error) {
				e("⛔ Your stored answer is in a different format. You may be running a newer version of the script on outdated data - try reimporting your answers");
				e(error);
			}

			console.groupEnd();
		}

		l(`☁️ Imported ${successCount}/${questionCount} questions`);
	}
	function importOne(storedQuestion, pageQuestions) {
		let success = false;

		for (let i = 0; i < pageQuestions.length; i++) {
			let pageQuestion = pageQuestions[i];

			let headerQuestionsMatch = compareTextParts(
				storedQuestion.textParts,
				pageQuestion.textParts
			);
			if (!headerQuestionsMatch) continue;

			let storedInput = storedQuestion.input;
			let pageInput = pageQuestion.input;
			if (storedInput.type !== pageInput.type) continue;

			switch (storedInput.type) {
				case QuestionType.BLANKS:
					success = tryImportBlanks(
						storedInput,
						pageInput
					);
					break;
				case QuestionType.RESPONSES:
					success = tryImportResponses(
						storedInput,
						pageInput
					);
					break;
				case QuestionType.CHOICES:
					success = tryImportChoices(
						storedInput,
						pageInput
					);
					break;
				default:
					e("Stored question type not supported");
					return false;
			}

			if (success) {
				// Remove for efficiency
				pageQuestions.splice(i, 1);
				return true;
			}
		}

		e("⚠️ Your stored answer doesn't match any of this quiz's questions");
		return false;
	}
	function tryImportBlanks(storedInput, pageInput) {
		let inputQuestionsMatch = compareTextParts(
			storedInput.textParts,
			pageInput.textParts
		);
		if (!inputQuestionsMatch) return false;

		let storedEntries = storedInput.entries;
		let pageEntries = pageInput.entries;
		if (storedEntries.length !== pageEntries.length) return false;

		for (let i = 0; i < storedEntries.length; i++) {
			let storedEntry = storedEntries[i];
			let pageEntry = pageEntries[i];

			let control = pageEntry.control;

			control.value = storedEntry.text;
			triggerUpdate(control, "input");
		}

		return true;
	}
	function tryImportResponses(storedInput, pageInput) {
		let storedEntries = storedInput.entries;
		let pageEntries = [...pageInput.entries];
		if (storedEntries.length !== pageEntries.length) return false;

		let orderedCheckboxes = [];

		// Check if all entries have a match.
		// Eg header question is likely identical for different sets of entries
		outerLoop:
		for (let storedEntry of storedEntries) {
			for (let i = 0; i < pageEntries.length; i++) {
				let pageEntry = pageEntries[i];

				if (compareTextParts(
					storedEntry.textParts,
					pageEntry.textParts
				)) {
					orderedCheckboxes.push(pageEntry.control);
					// Remove for efficiency, end loop as array mutated
					pageEntries.splice(i, 1);
					continue outerLoop;
				}
			}

			// No page entries matched the stored entry
			return false;
		}

		// Safe to start overwriting
		for (let i = 0; i < storedEntries.length; i++) {
			let storedEntry = storedEntries[i];
			let checkbox = orderedCheckboxes[i];

			checkbox.checked = storedEntry.checked;
			triggerUpdate(checkbox);
		}

		return true;
	}
	function tryImportChoices(storedInput, pageInput) {
		let storedEntries = storedInput.entries;
		let pageEntries = [...pageInput.entries];

		let buttonToCheck = null;

		outerLoop:
		for (let storedEntry of storedEntries) {
			for (let i = 0; i < pageEntries.length; i++) {
				let pageEntry = pageEntries[i];

				if (compareTextParts(
					storedEntry.textParts,
					pageEntry.textParts
				)) {
					if (storedEntry.checked) buttonToCheck = pageEntry.control;

					pageEntries.splice(i, 1);
					continue outerLoop;
				}
			}

			return false;
		}

		if (buttonToCheck === null) {
			w("No button to check in stored entries");
			return true;
		}

		buttonToCheck.checked = true;
		triggerUpdate(buttonToCheck);

		return true;
	}

	function onStore(questions) {
		let data = questions.map((question) => question.export());
		d(data);
		localStorage.setItem(
			"LumiTransfer",
			JSON.stringify(data)
		);
	}

	function onRetrieve() {
		let rawData = localStorage.getItem("LumiTransfer");
		if (rawData === null) {
			e("⛔ Did not find any stored answers to import. Run this script on your quiz results (not an ongoing attempt) to extract those answers first");
			return null;
		}

		let data;
		try {
			data = JSON.parse(rawData);
		} catch (syntaxError) {
			e("Stored data unreadable");
			e(syntaxError);
			return null;
		}

		l("✨ Stored data retrieved");
		d(data);
		return data;
	}

	function onProperSave(saveButton) {
		if (saveButton === null) return;

		saveButton.click();
	}



	let scan = onScan();
	if (scan === null) return;

	let questions = onProcess(scan.questionHolders, scan.extractorMode);
	if (questions === null) return;

	if (scan.extractorMode) {
		onStore(questions);
		l("✅ Your answers have been extracted & stored. Run this script again on an ongoing quiz attempt to import them");
	} else {
		let storedData = onRetrieve();
		if (storedData === null) return;

		onImport(questions, storedData);

		onProperSave(scan.saveButton);
		l("✅ Your answers have been retrieved & imported. Matching questions have been overwritten");
	}
})();
