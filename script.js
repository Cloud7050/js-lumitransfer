(() => {
	const TextPartType = {
		NORMAL: "normal",
		ANSWER: "answer",
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

	class AnswerBlank extends TextPart {
		constructor(
			blankNumber,
			answer
		) {
			super(
				TextPartType.ANSWER,
				blankNumber
			);

			Object.assign(
				this,
				{ answer }
			);
		}
	}

	class ImageSource extends TextPart {
		constructor(source) {
			super(
				TextPartType.IMAGE,
				source
			);
		}
	}

	class Scan {
		constructor(
			extractorMode,
			questionRows,
			saveButton
		) {
			Object.assign(
				this,
				{
					extractorMode,
					questionRows,
					saveButton
				}
			);
		}
	}

	class Question {
		constructor(
			textParts,
			actualMarks,
			maxMarks,
			input,
			questionRow,
			marksHint
		) {
			Object.assign(
				this,
				{
					textParts,
					actualMarks,
					maxMarks,
					input,
					questionRow,
					marksHint
				}
			);
		}

		export() {
			return {
				textParts: this.textParts,
				actualMarks: this.actualMarks,
				maxMarks: this.maxMarks,
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

	function extractTextParts(node, parentNode = null) {
		let whitelistedNodes = [
			Node.ELEMENT_NODE,
			Node.TEXT_NODE
		];
		let children = [...node.childNodes].filter(
			(child) => whitelistedNodes.includes(child.nodeType)
		);

		let textParts = [];

		if (children.length === 0) {
			// Base case

			let textPart = extractTextPart(node, parentNode);
			if (textPart === null) return [];

			textParts.push(textPart);
		} else {
			// Recurse

			children.forEach((child) => {
				textParts = [...textParts, ...extractTextParts(child, node)];
			});
		}

		return textParts;
	}
	function extractTextPart(node, parentNode) {
		let text = node.textContent;

		if (
			parentNode !== null
			&& parentNode.matches("em.question-blank")
		) {
			let regex = /^(?<blankNumber>\d+)(?:\. (?<answer>[\s\S]*))?$/u;
			let result = regex.exec(text);
			if (result === null) {
				e("Unrecognised blank format in answer blank");
				return null;
			}

			let resultGroups = result.groups;
			return new AnswerBlank(
				resultGroups.blankNumber,
				resultGroups.answer ?? null
			);
		}

		if (
			node.nodeType === Node.ELEMENT_NODE
			&& node.matches("img")
		) return new ImageSource(node.src);

		return new NormalText(text);
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
			saveButton = [...buttons].find((button) => button.textContent === "Save For Later") ?? null;
			if (saveButton === null) w("No save button found among buttons");
		}

		let questionRows = quizHolder.querySelectorAll("div.question-view");
		if (questionRows.length === 0) {
			e("No question rows found in quiz holder");
			return null;
		}

		return new Scan(
			extractorMode,
			questionRows,
			saveButton
		);
	}

	function onProcess(questionRows, extractorMode) {
		let successCount = 0;
		let questionCount = 0;
		let questions = [];

		for (let questionRow of questionRows) {
			questionCount++;
			l(`⚙️ Processing page's Q${questionCount}...`, true);

			let headerQuestion = questionRow.querySelector("div.question-header > *");
			if (headerQuestion === null) {
				e("No header question found in question row");
				console.groupEnd();
				continue;
			}

			let textParts = extractTextParts(headerQuestion);
			if (textParts.length === 0) {
				e("No text parts extracted from header question");
				console.groupEnd();
				continue;
			}

			let actualMarks = null;
			let maxMarks = null;
			if (extractorMode) {
				let marksReport = questionRow.querySelector("div.mark-obtained > span");
				if (marksReport !== null) {
					let regex = /^You scored (?<actualMarks>\d+(?:\.\d+)?) \/ (?<maxMarks>\d+(?:\.\d+)?) marks?$/u;
					let result = regex.exec(marksReport.textContent);
					if (result === null) w("Unrecognised marks format in marks report");
					else {
						let resultGroups = result.groups;
						actualMarks = parseFloat(resultGroups.actualMarks);
						maxMarks = parseFloat(resultGroups.maxMarks);
					}
				}
			}

			let input = tryProcessBlanks(questionRow, extractorMode)
				?? tryProcessResponses(questionRow, extractorMode)
				?? tryProcessChoices(questionRow, extractorMode);
			if (input === null) {
				e("⚠️ This script doesn't support this type of question");
				console.groupEnd();
				continue;
			}

			let marksHint = null;
			if (!extractorMode) {
				marksHint = questionRow.querySelector(
					"div.question-header > small:nth-child(2)"
				);
				if (marksHint === null) {
					e("No marks hint found in question row");
					console.groupEnd();
					continue;
				}
			}

			let question = new Question(
				textParts,
				actualMarks,
				maxMarks,
				input,
				questionRow,
				marksHint
			);
			d(question);

			questions.push(question);
			successCount++;
			console.groupEnd();
		}

		if (questions.length === 0) {
			e("No questions extracted from question rows");
			return null;
		}

		l(`📦 Processed ${successCount}/${questionCount} questions`);
		d(questions);
		return questions;
	}
	function tryProcessBlanks(questionRow, extractorMode) {
		// Check if is this question type
		let blanksHolder = questionRow.querySelector("question-view-fib");
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
		let answerBlanks = textParts.filter((textPart) => textPart.type === TextPartType.ANSWER);

		let entryHolders = blanksHolder.querySelectorAll("div.input");
		if (entryHolders.length === 0) {
			e("No entry holders found in blanks holder");
			return null;
		}

		let answerBlankCount = answerBlanks.length;
		let entryHolderCount = entryHolders.length;
		if (answerBlankCount !== entryHolderCount) {
			e(`Number of answer blanks (${answerBlankCount}) doesn't match number of entry holders (${entryHolderCount})`);
			return null;
		}

		let successCount = 0;
		let entries = [];
		for (let i = 0; i < answerBlanks.length; i++) {
			let answerBlank = answerBlanks[i];
			let entryHolder = entryHolders[i];

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
				if (text === "") text = answerBlank.answer;

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
	function tryProcessResponses(questionRow, extractorMode) {
		let responsesHolder = questionRow.querySelector("question-view-mrq");
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
	function tryProcessChoices(questionRow, extractorMode) {
		let choicesHolder = questionRow.querySelector("question-view-mcq")
			?? questionRow.querySelector("question-view-tof");
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

				let actualMarks = storedQuestion.actualMarks;
				let maxMarks = storedQuestion.maxMarks;
				if (
					actualMarks !== null
					&& maxMarks !== null
				) {
					let isWarning = actualMarks < maxMarks;
					let rgb = (isWarning)
						? "255 170 0" // Orange
						: "85 255 170"; // Greenish blue

					let rowStyle = pageQuestion.questionRow.style;
					rowStyle["background-color"] = `rgb(${rgb} / 10%)`;
					rowStyle["box-shadow"] = `0px 0px 25px 25px rgb(${rgb} / 10%)`;
					rowStyle["border-radius"] = "50px";

					let newDiv = document.createElement("div");
					newDiv.setAttribute("tag-custom", "");
					newDiv.textContent = `☁️ Imported Marks: ${actualMarks}/${maxMarks}`;

					let divStyle = newDiv.style;
					divStyle.display = "inline-block";
					divStyle["line-height"] = "1";
					divStyle.padding = "5px";
					divStyle["font-size"] = "15px";
					divStyle["font-weight"] = "bold";
					divStyle["background-color"] = `rgb(${rgb} / 40%)`;
					divStyle["border-radius"] = "5px";

					let oldSmall = pageQuestion.marksHint;
					let potentialExistingDiv = oldSmall.nextSibling;
					if (
						potentialExistingDiv?.nodeType === Node.ELEMENT_NODE
						&& potentialExistingDiv.hasAttribute("tag-custom")
					) potentialExistingDiv.remove();

					oldSmall.style.display = "none";
					let potentialNextSibling = oldSmall.nextSibling;
					// Inserts at the end if potentialNextSibling is null (if oldSmall is already last node)
					oldSmall.parentNode.insertBefore(newDiv, potentialNextSibling);
				}

				return true;
			}
		}

		e("⚠️ Your stored answer doesn't match any of this quiz's processed questions");
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

		l("✨ Stored answers retrieved");
		d(data);
		return data;
	}

	function onProperSave(saveButton) {
		if (saveButton === null) return;

		saveButton.click();
	}



	let scan = onScan();
	if (scan === null) return;

	let questions = onProcess(scan.questionRows, scan.extractorMode);
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
