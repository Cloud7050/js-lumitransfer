class QuestionData {
	constructor(
		mainText,
		inputData
	) {
		Object.assign(
			this,
			{
				mainText,
				inputData
			}
		);
	}
}

class QuestionElements {
	constructor(
		inputElements
	) {
		Object.assign(
			this,
			{ inputElements }
		);
	}
}

class InputData {
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

class BlanksInputData extends InputData {
	constructor(
		entries,

		referenceText
	) {
		// Angular fill-in-blanks
		super(
			"fib",
			entries
		);

		Object.assign(
			this,
			{ referenceText }
		);
	}
}

class ResponsesInputData extends InputData {
	constructor(
		entries
	) {
		// Angular multiple response question
		super(
			"mrq",
			entries
		);
	}
}

class InputElements {
	constructor(
		entryElements
	) {
		Object.assign(
			this,
			{ entryElements }
		);
	}
}

class BlanksInputElements extends InputElements {}

class ResponsesInputElements extends InputElements {}

class BlanksEntryData {
	constructor(
		value
	) {
		Object.assign(
			this,
			{ value }
		);
	}
}

class ResponsesEntryData {
	constructor(
		text,
		checked
	) {
		Object.assign(
			this,
			{
				text,
				checked
			}
		);
	}
}

class BlanksEntryElements {
	constructor(
		control
	) {
		Object.assign(
			this,
			{ control }
		);
	}
}

class ResponsesEntryElements {
	constructor(
		checkbox
	) {
		Object.assign(
			this,
			{ checkbox }
		);
	}
}

class Mode {
	constructor(
		extractMode,
		questionHolders
	) {
		Object.assign(
			this,
			{
				extractMode,
				questionHolders
			}
		);
	}
}

class QuestionPairs {
	constructor(
		data,
		elements
	) {
		Object.assign(
			this,
			{
				data,
				elements
			}
		);
	}
}

class InputPair {
	constructor(
		inputData,
		inputElements
	) {
		Object.assign(
			this,
			{
				inputData,
				inputElements
			}
		);
	}
}

function L(content, addText = true) {
	if (addText) content = `>>> ${content}`;
	console.log(content);
}

function W(content, addText = true) {
	if (addText) content = `[!] ${content}!`;
	console.warn(content);
}

function E(content, addText = true) {
	if (addText) content = `ERR ${content}!`;
	console.error(content);
}

function D(content, addText = true) {
	if (addText) content = `*** ${content}`;
	console.debug(content);
}

function getByTag(parent, tag, returnFirstElement = true) {
	let elements = parent.getElementsByTagName(tag);
	return (!returnFirstElement)
		? elements
		: elements?.[0] ?? null;
}

function getByClass(parent, className, returnFirstElement = true) {
	let elements = parent.getElementsByClassName(className);
	return (!returnFirstElement)
		? elements
		: elements?.[0] ?? null;
}

function detectMode() {
	let extractMode = true;

	let quizHolder = getByTag(document, "quiz-question-results");
	if (quizHolder !== null) {
		// Results quiz holder
		L("📤 Using extractor mode");
	} else {
		quizHolder = getByTag(document, "quiz-question-all");
		if (quizHolder === null) {
			E("No quiz holder found in page");
			return null;
		}

		// Ongoing quiz holder
		extractMode = false;
		L("📥 Using importer mode");
	}

	let questionHolders = getByTag(quizHolder, "quiz-question-view", false)
	if (questionHolders.length === 0) {
		E("No question holders found in quiz holder");
		return null;
	}

	return new Mode(
		extractMode,
		questionHolders
	);
}

function extract(questionHolders) {
	let questionsExtracted = 0;
	let questionCounter = 0;
	let data = [];
	let elements = [];

	for (let questionHolder of questionHolders) {
		questionCounter++;
		L(`Extracting question #${questionCounter}...`);

		let header = getByClass(questionHolder, "question-header");
		if (header === null) {
			W("No header found in question holder");
			continue;
		}

		let mainText = extractMainText(header);
		if (mainText === null) continue;

		let inputPair = tryExtractBlanks(questionHolder)
			?? tryExtractResponses(questionHolder);
		if (inputPair === null) {
			W("⚠️ Question type not supported");
			continue;
		}

		let questionData = new QuestionData(
			mainText,
			inputPair.inputData
		);
		D(questionData, false);

		data.push(questionData);
		elements.push(
			new QuestionElements(
				inputPair.inputElements
			)
		);

		questionsExtracted++;
	}

	if (data.length === 0) {
		E("Nothing extractable found in question holders");
		return null;
	}

	L(`Extracted ${questionsExtracted}/${questionCounter} question(s)`);

	let questionPairs = new QuestionPairs(
		data,
		elements
	);
	D(questionPairs, false);
	return questionPairs;
}
function extractMainText(header) {
	let mainText = Array.from(header.children).reduce(
		(output, child) => {
			// To prevent mismatches due to weird extra elements containing whitespace when viewing results
			let trimmed = child.innerText.trim();
			return output + trimmed;
		},
		""
	);

	// Ignore marks, would not be present in results if per-question marks are hidden
	mainText = /^([\s\S]+?)(?:\(\d*\.?\d* marks?\))?$/.exec(mainText)?.[1];
	if (mainText === undefined) {
		W("No main text found in header");
		return null;
	}

	return mainText;
}
function tryExtractBlanks(questionHolder) {
	let blanksHolder = getByTag(questionHolder, "question-view-fib");
	if (blanksHolder === null) return null;

	let referenceText = null;
	let question = getByClass(blanksHolder, "question");
	if (question === null) L("No question found in blanks holder");
	else referenceText = question.innerText.trim();

	let inputs = getByClass(blanksHolder, "input", false);
	if (inputs.length === 0) {
		W("No inputs found in blanks holder");
		return null;
	}

	let entries = [];
	let entryElements = [];
	for (let input of inputs) {
		// Results have an additional textarea
		let textarea = getByClass(input, "answer-fib");
		let value = textarea?.value ?? null;

		let control = getByClass(input, "form-control");
		if (control === null) {
			W("No control found in input");
			continue;
		}

		entries.push(
			new BlanksEntryData(value)
		);
		entryElements.push(
			new BlanksEntryElements(control)
		);
	}

	if (entries.length === 0) {
		E("No extractable entries found in question holder");
		return null;
	}

	return new InputPair(
		new BlanksInputData(
			entries,

			referenceText
		),
		new BlanksInputElements(entryElements)
	);
}
function tryExtractResponses(questionHolder) {
	let responsesHolder = getByTag(questionHolder, "question-view-mrq");
	if (responsesHolder === null) return null;

	let options = getByClass(responsesHolder, "option-content", false);
	if (options.length === 0) {
		W("No options found in responses holder");
		return null;
	}

	let entries = [];
	let entryElements = [];
	for (let option of options) {
		let textHolder = getByClass(option, "text");
		if (textHolder === null) {
			W("No text holder found in option");
			continue;
		}

		let text = textHolder.innerText.trim();
		if (text.length === 0) {
			W("No text found in text holder");
			continue;
		}

		let checkboxHolder = getByClass(option, "checkbox");
		if (checkboxHolder === null) {
			W("No checkbox holder found in option");
			continue;
		}

		let span = getByTag(checkboxHolder, "span");
		if (span === null) {
			W("No span found in checkbox holder");
			continue;
		}

		let styleDeclaration = window.getComputedStyle(span, "::before");
		let backgroundImage = styleDeclaration.getPropertyValue("background-image");
		let checked = backgroundImage !== "none";

		let checkbox = getByTag(checkboxHolder, "input");
		if (checkbox === null) {
			W("No checkbox found in checkbox holder");
			continue;
		}

		entries.push(
			new ResponsesEntryData(
				text,
				checked
			)
		);
		entryElements.push(
			new ResponsesEntryElements(checkbox)
		);
	}

	if (entries.length === 0) {
		E("No extractable entries found in question holder");
		return null;
	}

	return new InputPair(
		new ResponsesInputData(entries),
		new ResponsesInputElements(entryElements)
	);
}

function importUsing(storedData, questionPairs) {
	let questionsImported = 0;
	let questionCounter = 0;

	for (let storedQuestionData of storedData) {
		questionCounter++;
		L(`Importing stored question #${questionCounter}...`);

		try {
			let success = importOne(storedQuestionData, questionPairs.data, questionPairs.elements);
			if (success) questionsImported++;
		} catch (error) {
			E("Stored question data is in wrong format");
			E(error, false);
		}
	}

	L(`Imported ${questionsImported}/${questionCounter} question(s)`);
}
function importOne(storedQuestionData, destinationData, destinationElements) {
	let success = false;
	for (let i = 0; i < destinationData.length; i++) {
		let destinationQuestionData = destinationData[i];
		let destinationQuestionElements = destinationElements[i];

		if (storedQuestionData.mainText !== destinationQuestionData.mainText) continue;

		let storedInputData = storedQuestionData.inputData;
		let destinationInputData = destinationQuestionData.inputData;
		let destinationInputElements = destinationQuestionElements.inputElements;

		if (storedInputData.type !== destinationInputData.type) continue;

		switch (storedInputData.type) {
			case "fib":
				success = tryImportBlanks(
					storedInputData,
					destinationInputData,
					destinationInputElements
				);
				break;
			default:
				W("Stored question type not supported");
				return false;
		}

		if (success) {
			// Remove for efficiency
			destinationData.splice(i, 1);
			destinationElements.splice(i, 1);
			break;
		};
	}

	if (!success) W("No matches for stored question data");

	return success;
}

function tryImportBlanks(
	storedInputData,
	destinationInputData,
	destinationInputElements
) {
	if (storedInputData.referenceText !== destinationInputData.referenceText) return false;

	let storedEntries = storedInputData.entries;
	let destinationEntryElements = destinationInputElements.entryElements;
	for (let i = 0; i < storedEntries.length; i++) {
		let entryData = storedEntries[i];
		let entryDom = destinationEntryElements[i];

		entryDom.control.value = entryData.value;
	}

	return true;
}

function storeData(data) {
	localStorage.setItem(
		"LumiTransfer",
		JSON.stringify(data)
	);
}

function retrieveData() {
	let rawData = localStorage.getItem("LumiTransfer");
	if (rawData === null) {
		E("⛔ No stored data found. Run this script on the quiz results to extract from first");
		return null;
	}

	let data;
	try {
		data = JSON.parse(rawData);
	} catch (syntaxError) {
		E("Stored data unreadable");
		E(syntaxError, false);
		return null;
	}

	D(data, false);
	return data;
}

(() => {
	let mode = detectMode();
	if (mode === null) return;

	if (mode.extractMode) {
		let questionPairs = extract(mode.questionHolders);
		if (questionPairs === null) return;

		storeData(questionPairs.data);
		L("✅ Data extracted & stored. Run this script again on the ongoing quiz to import into");
	} else {
		let storedData = retrieveData();
		if (storedData === null) return;

		let questionPairs = extract(mode.questionHolders);
		if (questionPairs === null) return;

		importUsing(storedData, questionPairs);
		L("✅ Data retrieved & imported. Matching questions overwritten");
	}
})();
