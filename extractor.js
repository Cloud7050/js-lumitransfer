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
		entryText,
		checked
	) {
		Object.assign(
			this,
			{
				entryText,
				checked
			}
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

	// Ignore marks, would not be present in results if per-question marks are hidden
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

		let checkboxHolder = option.getElementsByClassName("checkbox")?.[0];
		if (checkboxHolder === undefined) {
			W("No checkbox holder found in option");
			continue;
		}

		let span = checkboxHolder.getElementsByTagName("span")?.[0];
		if (span === undefined) {
			W("No span found in checkbox holder");
			continue;
		}

		let styleDeclaration = window.getComputedStyle(span, "::before");
		let backgroundImage = styleDeclaration.getPropertyValue("background-image");
		let checked = backgroundImage !== "none";

		let checkbox = checkboxHolder.getElementsByTagName("input")?.[0];
		if (span === undefined) {
			W("No checkbox found in checkbox holder");
			continue;
		}

		entries.push(
			new ResponsesEntryData(
				entryText,
				checked
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

function storeData(data) {
	localStorage.setItem(
		"userData",
		JSON.stringify(data)
	);
}

(() => {
	let data = assembleData("quiz-question-results");
	if (data === null) return;

	storeData(data);
	L("✅ Extractor done running. Run the importer next");
})();
