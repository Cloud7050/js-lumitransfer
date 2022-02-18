class Question {
	constructor(
		number,
		headerText,
		bodyText,
		input
	) {
		Object.assign(
			this,
			{
				number,
				headerText,
				bodyText,
				input
			}
		);
	}
}

class Input {
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

class OeInput extends Input {
	constructor(
		inputText,
		entries
	) {
		super("oe");

		Object.assign(
			this,
			{
				inputText,
				entries
			}
		);
	}
}

class Entry {
	constructor(
		number,
		value
	) {
		Object.assign(
			this,
			{
				number,
				value
			}
		);
	}
}

function elementsToText(elements) {
	return elements
		.map(element => element.innerText)
		.reduce(
			(output, text) => output += text
		);
}

function tryExtractOe(questionHolder) {
	let inputHolder = questionHolder.getElementsByClassName("input-container")?.[0];
	if (inputHolder === undefined) {
		console.debug("*** No input holder found in question holder, probably not OE");
		return null;
	}

	let inputHolderOthers = [];
	let inputs = [];
	for (let child of inputHolder.children) {
		if (!child.classList.contains("input")) inputHolderOthers.push(child);
		else inputs.push(child);
	}

	let inputText = elementsToText(inputHolderOthers);
	if (inputText.length <= 0) {
		inputText = null;

		console.debug("*** No input text found in input holder");
	}

	let entries = [];
	for (let input of inputs) {
		let children = input.children;
		let numberElement = children?.[0];
		let number = numberElement?.innerText;
		if (number === undefined) {
			number = null;

			console.debug("*** No number found in input");
		}

		let textarea;
		for (let child of children) {
			if (child.tagName === "TEXTAREA") {
				textarea = child;
				break;
			}
		}
		if (textarea === undefined) {
			console.warn("[!] No textarea found in input!");
			return null;
		}
		let value = textarea.value;

		entries.push(
			new Entry(
				number,
				value
			)
		);
	}

	return new OeInput(
		inputText,
		entries
	);
}

(() => {
	let quizHolder = document.getElementsByTagName("quiz-question-results")?.[0];
	if (quizHolder === undefined) {
		console.warn("[!] No quiz holder found in page!");
		return;
	}

	let questionHolders = quizHolder.getElementsByTagName("quiz-question-view");
	if (questionHolders.length <= 0) {
		console.warn("[!] No question holders found in quiz holder!");
		return;
	}

	let data = [];
	for (let questionHolder of questionHolders) {
		let parent = questionHolder.parentElement;
		let parentId = parent?.id;
		let number = parentId?.match(/^question-(\d+)$/)?.[1];
		if (number === undefined) {
			number = "?";

			console.log(">>> No number found around question holder");
		}

		console.log(`>>> Extracting question #${number}:`);

		let header = questionHolder.getElementsByClassName("question-header")?.[0];
		if (header === undefined) {
			console.warn("[!] No question header found in question holder!");
			continue;
		}
		let headerText = header.innerText;

		let question = questionHolder.getElementsByClassName("question")?.[0];
		let bodyText;
		if (question !== undefined) bodyText = question.innerText;
		else {
			bodyText = null;

			console.log(">>> No question body found in question holder");
		}

		let input = tryExtractOe(questionHolder);
		// ?? try()
		//TODO

		if (input === null) {
			console.warn("[!] Contents in question holder not recognised!");
			continue;
		}

		let questionData = new Question(
			number,
			headerText,
			bodyText,
			input
		);

		console.debug(questionData);
		data.push(questionData);
	}

	console.log(data);
	console.log(JSON.stringify(data));
})();
