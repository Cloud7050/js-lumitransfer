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
		referenceText,
		entries
	) {
		super("oe");

		Object.assign(
			this,
			{
				referenceText,
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

		let inputPair = tryExtractOe(questionHolder);

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
function tryExtractOe(questionHolder) {
	let oeHolder = questionHolder.getElementsByTagName("question-view-fib")?.[0];
	if (oeHolder === undefined) {
		D("No OE holder found in question holder, not OE");
		return null;
	}

	let question = oeHolder.getElementsByClassName("question")?.[0];
	let referenceText = null;
	if (question === undefined) L("No question found in OE holder");
	else referenceText = question.innerText;

	let inputHolder = oeHolder.getElementsByClassName("input-container")?.[0];
	if (inputHolder === undefined) {
		W("No input holder found in OE holder");
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

		// Results have an additional textarea
		let textarea = children.filter(child => child.tagName === "TEXTAREA")?.[0];
		let value = textarea?.value ?? null;

		let control = children.filter(child => child.tagName === "INPUT")?.[0];
		if (control === undefined) {
			W("No control found in input");
			continue;
		}

		entries.push(
			new OeEntryData(value)
		);
		entryDoms.push(
			new OeEntryDom(control)
		);
	}

	return new InputPair(
		new OeInputData(
			referenceText,
			entries
		),
		new OeInputDom(entryDoms)
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
