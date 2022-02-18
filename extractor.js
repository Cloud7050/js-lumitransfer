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
		textarea
	) {
		Object.assign(
			this,
			{
				textarea
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

function findQuestionHolders() {
	let quizHolder = document.getElementsByTagName("quiz-question-results")?.[0];
	if (quizHolder === undefined) {
		E("No quiz holder found in page");
		return null;
	}

	let questionHolders = quizHolder.getElementsByTagName("quiz-question-view");
	if (questionHolders.length === 0) {
		E("No question holders found in quiz holder");
		return null;
	}

	return questionHolders;
}

function assembleData(questionHolders, doms = []) {
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

		let headerText = header.innerText;


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

	return data;
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
		let textarea = Array.from(input.children).filter(child => child.tagName === "TEXTAREA")?.[0];
		if (textarea === undefined) {
			W("No textarea found in input!");
			continue;
		}

		let value = textarea.value;

		entries.push(
			new OeEntryData(value)
		);
		entryDoms.push(
			new OeEntryDom(textarea)
		);
	}

	return new InputPair(
		new OeInputData(entries),
		new OeInputDom(entryDoms)
	);
}

// =============================================================================

(() => {
	let questionHolders = findQuestionHolders();
	if (questionHolders === null) return;

	let data = assembleData(questionHolders);

	D(data, false);
	L(JSON.stringify(data), false);
})();
