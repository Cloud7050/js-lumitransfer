const QuestionType = {
	// Angular fill-in-blanks
	BLANKS: "fib",

	// Angular multiple response question
	RESPONSES: "mrq",

	// Angular multiple choice question
	// Angular true or false
	CHOICES: "mcq-tof"
}

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
	constructor(inputElements) {
		Object.assign(
			this,
			{ inputElements }
		);
	}
}

class InputData {
	constructor(
		type,
		entriesData
	) {
		Object.assign(
			this,
			{
				type,
				entriesData
			}
		);
	}
}

class BlanksInputData extends InputData {
	constructor(
		entriesData,
		referenceText
	) {
		super(
			QuestionType.BLANKS,
			entriesData
		);

		Object.assign(
			this,
			{ referenceText }
		);
	}
}

class ResponsesInputData extends InputData {
	constructor(entriesData) {
		super(
			QuestionType.RESPONSES,
			entriesData
		);
	}
}

class ChoicesInputData extends InputData {
	constructor(entriesData) {
		super(
			QuestionType.CHOICES,
			entriesData
		);
	}
}

class InputElements {
	constructor(entriesElements) {
		Object.assign(
			this,
			{ entriesElements }
		);
	}
}

class BlanksInputElements extends InputElements {}

class ResponsesInputElements extends InputElements {}

class ChoicesInputElements extends InputElements {}

class BlanksEntryData {
	constructor(value) {
		Object.assign(
			this,
			{ value }
		);
	}
}

class MultiEntryData {
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

class ResponsesEntryData extends MultiEntryData {}

class ChoicesEntryData extends MultiEntryData {}

class EntryElements {
	constructor(control) {
		Object.assign(
			this,
			{ control }
		);
	}
}

class BlanksEntryElements extends EntryElements {}

class ResponsesEntryElements extends EntryElements {}

class ChoicesEntryElements extends EntryElements {}

class Mode {
	constructor(
		extractorMode,
		questionHolders
	) {
		Object.assign(
			this,
			{
				extractorMode,
				questionHolders
			}
		);
	}
}

class QuestionsPair {
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

function L(content) {
	console.log(
		// Skip instanceof check for type object + class String from new String()s
		(typeof content !== "string")
			? content
			: `>>> ${content}`
	);
}

function W(content) {
	console.warn(
		(typeof content !== "string")
			? content
			: `[!] ${content}!`
	);
}

function E(content) {
	console.error(
		(typeof content !== "string")
			? content
			: `ERR ${content}!`
	);
}

function D(content) {
	console.debug(
		(typeof content !== "string")
			? content
			: `*** ${content}`
	);
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
	let extractorMode = true;

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
		extractorMode = false;
		L("📥 Using importer mode");
	}

	let questionHolders = getByTag(quizHolder, "quiz-question-view", false)
	if (questionHolders.length === 0) {
		E("No question holders found in quiz holder");
		return null;
	}

	return new Mode(
		extractorMode,
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
			?? tryExtractResponses(questionHolder)
			?? tryExtractChoices(questionHolder);
		if (inputPair === null) {
			W("⚠️ Question type not supported");
			continue;
		}

		let questionData = new QuestionData(
			mainText,
			inputPair.inputData
		);
		D(questionData);

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

	let questionsPair = new QuestionsPair(
		data,
		elements
	);
	D(questionsPair);
	return questionsPair;
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

	// Ignore marks, would be missing from results if marks per question are hidden
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

	let entriesData = [];
	let entriesElements = [];
	for (let input of inputs) {
		// Results have an additional textarea
		let textarea = getByClass(input, "answer-fib");
		let value = textarea?.value ?? null;

		let control = getByClass(input, "form-control");
		if (control === null) {
			W("No control found in input");
			continue;
		}

		entriesData.push(
			new BlanksEntryData(value)
		);
		entriesElements.push(
			new BlanksEntryElements(control)
		);
	}

	if (entriesData.length === 0) {
		W("No extractable entries found in question holder");
		return null;
	}

	return new InputPair(
		new BlanksInputData(
			entriesData,
			referenceText
		),
		new BlanksInputElements(entriesElements)
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

	let entriesData = [];
	let entriesElements = [];
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

		let checkbox = getByTag(checkboxHolder, "input");
		if (checkbox === null) {
			W("No checkbox found in checkbox holder");
			continue;
		}

		let checked = checkbox.checked;

		entriesData.push(
			new ResponsesEntryData(
				text,
				checked
			)
		);
		entriesElements.push(
			new ResponsesEntryElements(checkbox)
		);
	}

	if (entriesData.length === 0) {
		W("No extractable entries found in question holder");
		return null;
	}

	return new InputPair(
		new ResponsesInputData(entriesData),
		new ResponsesInputElements(entriesElements)
	);
}
function tryExtractChoices(questionHolder) {
	let choicesHolder = getByTag(questionHolder, "question-view-mcq")
		?? getByTag(questionHolder, "question-view-tof");
	if (choicesHolder === null) return null;

	let options = getByClass(choicesHolder, "option-content", false);
	if (options.length === 0) {
		W("No options found in choices holder");
		return null;
	}

	let entriesData = [];
	let entriesElements = [];
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

		let buttonHolder = getByClass(option, "radio");
		if (buttonHolder === null) {
			W("No button holder found in option");
			continue;
		}

		let button = getByTag(buttonHolder, "input");
		if (button === null) {
			W("No button found in button holder");
			continue;
		}

		let checked = button.checked;

		entriesData.push(
			new ResponsesEntryData(
				text,
				checked
			)
		);
		entriesElements.push(
			new ChoicesEntryElements(button)
		);
	}

	if (entriesElements.length === 0) {
		W("No extractable entries found in question holder");
		return null;
	}

	return new InputPair(
		new ChoicesInputData(entriesData),
		new ChoicesInputElements(entriesElements)
	);
}

function importUsing(storedData, questionsPair) {
	// Clone for importOne() to splice later as questions get overwritten
	let destinationData = [...questionsPair.data];
	let destinationElements = [...questionsPair.elements];

	let questionsImported = 0;
	let questionCounter = 0;

	for (let storedQuestionData of storedData) {
		questionCounter++;
		L(`Importing stored question #${questionCounter}...`);

		try {
			let success = importOne(storedQuestionData, destinationData, destinationElements);
			if (success) questionsImported++;
		} catch (error) {
			E("Stored question data is in wrong format");
			E(error);
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
			case QuestionType.BLANKS:
				success = tryImportBlanks(
					storedInputData,
					destinationInputData,
					destinationInputElements
				);
				break;
			case QuestionType.RESPONSES:
				success = tryImportResponses(
					storedInputData,
					destinationInputData,
					destinationInputElements
				);
				break;
			case QuestionType.CHOICES:
				success = tryImportChoices(
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

	let storedEntriesData = storedInputData.entriesData;
	let destinationEntriesElements = destinationInputElements.entriesElements;
	for (let i = 0; i < storedEntriesData.length; i++) {
		let entryData = storedEntriesData[i];
		let entryElements = destinationEntriesElements[i];

		entryElements.control.value = entryData.value;
	}

	return true;
}
function tryImportResponses(
	storedInputData,
	destinationInputData,
	destinationInputElements
) {
	let storedEntriesData = storedInputData.entriesData;
	let destinationEntriesData = destinationInputData.entriesData;
	let destinationEntriesElements = destinationInputElements.entriesElements;

	let orderedCheckboxes = [];

	// Check if all entries have a match.
	// Eg question main text may be identical for different sets of entries
	outerLoop:
	for (let storedEntryData of storedEntriesData) {
		for (let i = 0; i < destinationEntriesData.length; i++) {
			let destinationEntryData = destinationEntriesData[i];
			let destinationEntryElement = destinationEntriesElements[i];

			if (
				storedEntryData.text === destinationEntryData.text
			) {
				orderedCheckboxes.push(destinationEntryElement.control)
				continue outerLoop;
			}
		}

		return false;
	}

	// Safe to start overwriting
	for (let i = 0; i < storedEntriesData.length; i++) {
		let storedEntryData = storedEntriesData[i];
		let checkbox = orderedCheckboxes[i];

		checkbox.checked = storedEntryData.checked;
	}

	return true;
}
function tryImportChoices(
	storedInputData,
	destinationInputData,
	destinationInputElements
) {
	let storedEntriesData = storedInputData.entriesData;
	let destinationEntriesData = destinationInputData.entriesData;
	let destinationEntriesElements = destinationInputElements.entriesElements;

	let buttonToCheck = null;

	outerLoop:
	for (let storedEntryData of storedEntriesData) {
		let storeMatchingButton = storedEntryData.checked;

		for (let i = 0; i < destinationEntriesData.length; i++) {
			let destinationEntryData = destinationEntriesData[i];
			let destinationEntryElement = destinationEntriesElements[i];

			if (
				storedEntryData.text === destinationEntryData.text
			) {
				if (storeMatchingButton) {
					buttonToCheck = buttonToCheck ?? destinationEntryElement.control;
				}

				continue outerLoop;
			}
		}

		return false;
	}

	if (buttonToCheck === null) {
		W("No button to check in stored input data");
		return true;
	}

	buttonToCheck.checked = true;

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
		E(syntaxError);
		return null;
	}

	D(data);
	return data;
}

(() => {
	let mode = detectMode();
	if (mode === null) return;

	let questionsPair = extract(mode.questionHolders);
	if (questionsPair === null) return;

	if (mode.extractorMode) {
		storeData(questionsPair.data);
		L("✅ Data extracted & stored. Run this script again on the ongoing quiz to import into");
	} else {
		let storedData = retrieveData();
		if (storedData === null) return;

		importUsing(storedData, questionsPair);
		L("✅ Data retrieved & imported. Matching questions overwritten");
	}
})();
