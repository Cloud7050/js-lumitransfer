class QuestionData {
	constructor(
		headerText,
		bodyText,
		inputData
	) {
		Object.assign(
			this,
			{
				headerText,
				bodyText,
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
			{
				inputDom
			}
		);
	}
}

class InputData {
	constructor(
		type
	) {
		Object.assign(
			this,
			{
				type
			}
		);
	}
}

class OeInputData extends InputData {
	constructor(
		entries
	) {
		super("oe");

		Object.assign(
			this,
			{
				entries
			}
		);
	}
}

class OeInputDom {
	constructor(
		entryDoms
	) {
		Object.assign(
			this,
			{
				entryDoms
			}
		);
	}
}

class OeEntryData {
	constructor(
		value
	) {
		Object.assign(
			this,
			{
				value
			}
		);
	}
}

class OeEntryDom {
	constructor(
		control
	) {
		Object.assign(
			this,
			{
				control
			}
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

function assembleData(quizHolderTag = "quiz-question-results", doms = []) {
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

		let headerText = extractHeaderText(header);

		let question = questionHolder.getElementsByClassName("question")?.[0];
		let bodyText = null;
		if (question === undefined) L("No body found in question header");
		else bodyText = question.innerText;

		let inputPair = tryExtractOe(questionHolder);
		// ?? try()
		//TODO

		if (inputPair === null) {
			W("Contents in question holder not recognised");
			continue;
		}

		let questionData = new QuestionData(
			headerText,
			bodyText,
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
function extractHeaderText(header) {
	return Array.from(header.children).reduce(
		(output, child) => {
			// To prevent mismatches due to weird extra elements containing whitespace when viewing results
			let text = child.innerText.trim();

			// Ignore marks
			if (/\([\d\.]+ marks?\)/.test(text)) text = "";

			return output + text;
		},
		""
	);
}
function tryExtractOe(questionHolder) {
	let inputHolder = questionHolder.getElementsByClassName("input-container")?.[0];
	if (inputHolder === undefined) {
		D("No input holder found in question holder. Probably not OE");
		return null;
	}

	let inputs = Array.from(inputHolder.children).filter(child => child.classList.contains("input"));
	if (inputs.length === 0) {
		W("No inputs found in input holder");
		return null;
	}

	let entries = [];
	let entryDoms = [];
	for (let input of inputs) {
		let children = Array.from(input.children);

		let control = children.filter(child => child.tagName === "INPUT")?.[0];
		if (control === undefined) {
			W("No control found in input");
			continue;
		}

		// Results have an extra element
		let textarea = children.filter(child => child.tagName === "TEXTAREA")?.[0];

		entries.push(
			new OeEntryData(textarea?.value)
		);
		entryDoms.push(
			new OeEntryDom(control)
		);
	}

	return new InputPair(
		new OeInputData(entries),
		new OeInputDom(entryDoms)
	);
}

// =============================================================================

(() => {
	let data = assembleData();
	if (data === null) return;

	L(JSON.stringify(data), false);
})();
