function elementsToText(elements) {
	return elements
		.map(element => element.innerText)
		.reduce(
			(output, text) => output += text
		);
}

function tryImportOe(questionHolders, questionData) {
	for (let questionHolder of questionHolders) {
		let parent = questionHolder.parentElement;
		let parentId = parent?.id;
		let number = parentId?.match(/^question-(\d+)$/)?.[1];
		if (number === undefined) {
			number = "?";

			console.log(">>> No number found around question holder");
		}

		console.debug(`*** Matching against question #${number}:`);

		let header = questionHolder.getElementsByClassName("question-header")?.[0];
		if (header === undefined) {
			console.warn("[!] No question header found in question holder!");
			continue;
		}
		let headerText = header.innerText;
		if (headerText !== questionData.headerText) {
			console.debug("*** headerText mismatch");
			continue;
		}

		let question = questionHolder.getElementsByClassName("question")?.[0];
		let bodyText;
		if (question !== undefined) bodyText = question.innerText;
		else {
			bodyText = null;

			console.log(">>> No question body found in question holder");
		}
		if (bodyText !== questionData.bodyText) {
			console.debug("*** bodyText mismatch");
			continue;
		}

		let inputHolder = questionHolder.getElementsByClassName("input-container")?.[0];
		if (inputHolder === undefined) {
			console.debug("*** No input holder found in question holder, probably not OE");
			continue;
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
		if (inputText !== questionData.input.inputText) {
			console.debug("*** inputText mismatch");
			continue;
		}

		let entries = questionData.input.entries;
		for (let input of inputs) {
			let entry = entries.shift();

			//TODO
			let children = input.children;
			let numberElement = children?.[0];
			let number = numberElement?.innerText;
			if (number === undefined) {
				number = null;

				console.debug("*** No number found in input");
			}
			if (number !== entry.number) {
				console.warn("[!] Entry number mismatch!");
				continue;
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
}

(() => {
	//FIXME
	let rawData = 'REDACTED';
	// console.debug(rawData);

	let data;
	try {
		data = JSON.parse(rawData);
	} catch (syntaxError) {
		console.error("ERR Unreadable input!");
	}
	console.debug(data);

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

	try {
		for (let questionData of data) {
			let {
				number,
				input
			} = questionData;

			console.log(`>>> Importing what was question #${number}:`);

			switch (input.type) {
				case "oe":
					tryImportOe(questionHolders, questionData);
				default:
					console.warn("[!] Unrecognised input type in question data!");
			}
		}
	} catch (error) {
		console.error("ERR Bad input!");
		console.error(error);
	}
})();
