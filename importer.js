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

class QuestionDom {
	constructor(
		inputDom
	) {
		Object.assign(
			this,
			{ inputDom }
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

class InputDom {
	constructor(
		entryDoms
	) {
		Object.assign(
			this,
			{ entryDoms }
		);
	}
}

class BlanksInputDom extends InputDom {}

class ResponsesInputDom extends InputDom {}

class EntryData {
	constructor(
		value
	) {
		Object.assign(
			this,
			{ value }
		);
	}
}

class BlanksEntryData extends EntryData {}

class ResponsesEntryData extends EntryData {
	constructor(
		value,
		entryText
	) {
		super(value);

		Object.assign(
			this,
			{ entryText }
		);
	}
}

class BlanksEntryDom {
	constructor(
		control
	) {
		Object.assign(
			this,
			{ control }
		);
	}
}

class ResponsesEntryDom {
	constructor(
		checkbox
	) {
		Object.assign(
			this,
			{ checkbox }
		);
	}
}

class InputPair {
	constructor(
		inputData,
		inputDom
	) {
		Object.assign(
			this,
			{
				inputData,
				inputDom
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

function assembleData(quizHolderTag, doms = []) {
	let quizHolder = document.getElementsByTagName(quizHolderTag)?.[0];
	if (quizHolder === undefined) {
		E("No quiz holder found in page");
		return null;
	}

	let questionHolders = quizHolder.getElementsByTagName("quiz-question-view");
	if (questionHolders.length === 0) {
		E("No question holders found in quiz holder");
		return null;
	}

	let data = [];
	let questionNumber = 0;
	for (let questionHolder of questionHolders) {
		questionNumber++;
		L(`Extracting question #${questionNumber}:`);

		let header = questionHolder.getElementsByClassName("question-header")?.[0];
		if (header === undefined) {
			W("No header found in question holder");
			continue;
		}

		let mainText = extractMainText(header);
		if (mainText === null) continue;

		let inputPair = tryExtractBlanks(questionHolder)
			?? tryExtractResponses(questionHolder);

		if (inputPair === null) {
			W("Contents in question holder not recognised");
			continue;
		}

		let questionData = new QuestionData(
			mainText,
			inputPair.inputData
		);
		let questionDom = new QuestionDom(
			inputPair.inputDom
		);

		D(questionData, false);
		D(questionDom, false);
		data.push(questionData);
		doms.push(questionDom);
	}

	if (data.length === 0) {
		E("No data found in question holders");
		return null;
	}

	D(data, false);
	D(doms, false);
	return data;
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

	// Ignore marks
	mainText = /^([\s\S]*?)(?:\(\d*\.?\d* marks?\))?$/.exec(mainText)?.[1];
	if (mainText === undefined) {
		W("No main text found in question header");
		return null;
	}

	return mainText;
}
function tryExtractBlanks(questionHolder) {
	let blanksHolder = questionHolder.getElementsByTagName("question-view-fib")?.[0];
	if (blanksHolder === undefined) {
		D("No blanks holder found in question holder, not fill-in-blanks");
		return null;
	}

	let question = blanksHolder.getElementsByClassName("question")?.[0];
	let referenceText = null;
	if (question === undefined) L("No question found in blanks holder");
	else referenceText = question.innerText;

	let inputs = blanksHolder.getElementsByClassName("input");
	if (inputs.length === 0) {
		W("No inputs found in blanks holder");
		return null;
	}

	let entries = [];
	let entryDoms = [];
	for (let input of inputs) {
		let children = Array.from(input.children);

		// Results have an additional textarea
		let textarea = input.getElementsByClassName("answer-fib")?.[0];
		let value = textarea?.value ?? null;

		let control = input.getElementsByClassName("form-control")?.[0];
		if (control === undefined) {
			W("No control found in input");
			continue;
		}

		entries.push(
			new BlanksEntryData(value)
		);
		entryDoms.push(
			new BlanksEntryDom(control)
		);
	}

	return new InputPair(
		new BlanksInputData(
			entries,
			referenceText
		),
		new BlanksInputDom(entryDoms)
	);
}
function tryExtractResponses(questionHolder) {
	let responsesHolder = questionHolder.getElementsByTagName("question-view-mrq")?.[0];
	if (responsesHolder === undefined) {
		D("No responses holder found in question holder, not MRQ");
		return null;
	}

	let options = responsesHolder.getElementsByClassName("option-content");
	if (options.length === 0) {
		W("No options found in responses holder");
		return null;
	}

	let entries = [];
	let entryDoms = [];
	for (let option of options) {
		let textHolder = option.getElementsByClassName("text")?.[0];
		if (textHolder === undefined) {
			W("No text holder found in option");
			continue;
		}

		let entryText = textHolder.innerText;
		if (entryText.length === 0) {
			W("No entry text found in text holder");
			continue;
		}

		let checkbox = option.getElementsByTagName("input")?.[0];
		if (checkbox === undefined) {
			W("No checkbox found in option");
			continue;
		}

		let value = checkbox.value;

		entries.push(
			new ResponsesEntryData(
				value,
				entryText
			)
		);
		entryDoms.push(
			new ResponsesEntryDom(checkbox)
		);
	}

	return new InputPair(
		new ResponsesInputData(entries),
		new ResponsesInputDom(entryDoms)
	);
}

// =============================================================================

function retrieveData() {
	let rawData = localStorage.getItem("userData");
	if (rawData === null) {
		E("⛔ No user data found. Run the extractor before running the importer");
		return null;
	}

	let data;
	try {
		data = JSON.parse(rawData);
	} catch (syntaxError) {
		E("User data unreadable");
		E(syntaxError, false);
		return null;
	}

	D(data, false);
	return data;
}

function useData(userData, pageData, doms) {
	try {
		let questionNumber = 0;

		for (let userQuestionData of userData) {
			questionNumber++;
			L(`Importing what was question #${questionNumber}:`);

			singleImport(userQuestionData, pageData, doms);
		}
	} catch (error) {
		E("Bad user data format");
		E(error, false);
	}
}
function singleImport(userQuestionData, pageData, doms) {
	D(userQuestionData, false);

	let success = false;
	for (let i = 0; i < pageData.length; i++) {
		let pageQuestionData = pageData[i];
		let dom = doms[i];

		if (userQuestionData.mainText !== pageQuestionData.mainText) continue;

		let userInputData = userQuestionData.inputData;
		let pageInputData = pageQuestionData.inputData;
		let inputDom = dom.inputDom;

		if (userInputData.type !== pageInputData.type) continue;

		switch (userInputData.type) {
			case "fib":
				success = tryImportBlanks(userInputData, pageInputData, inputDom);
				break;
			default:
				W("Input data type in user question data not recognised");
				return;
		}

		if (success) {
			// Remove for efficiency
			pageData.splice(i, 1);
			doms.splice(i, 1);
			break;
		};
	}

	if (!success) W("No matches for user question data");
}
function tryImportBlanks(userInputData, pageInputData, inputDom) {
	if (userInputData.referenceText !== pageInputData.referenceText) return false;

	D(pageInputData, false);
	D(inputDom, false);

	let entries = userInputData.entries;
	let entryDoms = inputDom.entryDoms;
	for (let i = 0; i < entries.length; i++) {
		let entryData = entries[i];
		let entryDom = entryDoms[i];

		entryDom.control.value = entryData.value;
	}

	return true;
}

(() => {
	let userData = retrieveData();
	if (userData === null) return;

	let doms = [];
	let pageData = assembleData("quiz-question-all", doms);
	if (pageData === null) return;

	useData(userData, pageData, doms);
	L("✅ Importer done running. Matching questions overwritten");
})();
