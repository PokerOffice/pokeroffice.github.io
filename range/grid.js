const grid = document.getElementById("grid");
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const SUITS = {
	"s": { "raw": "s", "symbol": "♠", "color": "black" },
	"h": { "raw": "h", "symbol": "♥", "color": "red" },
	"d": { "raw": "d", "symbol": "♦", "color": "blue" },
	"c": { "raw": "c", "symbol": "♣", "color": "darkGreen" }
};

const Game = {
	actions: [],
	tokenCombos: {},  // {"A3s": Set(3) {'Ac3c', 'Ad3d', 'As3s'}}
	comboWeights: {},  // {"AdAh": [0.1, 0.2, 0.3, 0.4]}
	suitedness: new Set(),

	setActions(actions) {
		this.actions = actions;

		const elem = document.getElementById("actionsViewer");
		if (elem !== null) {
			elem.innerHTML = "";
			const table = document.createElement("table");
			for (let action of this.actions) {
				let tr = document.createElement("tr")

				tr.appendChild(generateActionCell(action));

				let tdLabel = document.createElement("td")
				tdLabel.appendChild(document.createTextNode(action.id));
				tr.appendChild(tdLabel);

				table.appendChild(tr);
			}
			elem.appendChild(table);
		}
	},

	resetCombos() {
		this.tokenCombos = {};
		this.comboWeights = {};
	},

	addCombo(combo) {
		const token = getToken(combo);
		if (this.tokenCombos[token] === undefined) {
			this.tokenCombos[token] = new Set();
		}
		this.tokenCombos[token].add(combo);
	},

	refreshTokenCombos() {
		this.tokenCombos = {};
		for (combo in this.comboWeights) this.addCombo(combo);
	},

	setComboWeights (combo, weights) {this.comboWeights[combo] = weights},

	toggleSuitedness(suitCombination) {
		const td = document.getElementById("suitCombination-" + suitCombination);

		if (this.suitedness.has(suitCombination)) {
			this.suitedness.delete(suitCombination);
			td.style.backgroundColor = "white";
		} else {
			this.suitedness.add(suitCombination);
			td.style.backgroundColor = "cyan";
		}

		this.refreshTokenCombos();
		refreshGrid();
	},

	initSuitedness() {
		const game = this;

		// Build HTML
		const suitednessTable = document.getElementById("suitednessTable");
		for (let suit1 of Object.values(SUITS)) {
			const row = document.createElement("tr");
			for (let suit2 of Object.values(SUITS)) {
				const td = document.createElement("td");
				const suitCombination = suit1.raw + suit2.raw;
				td.id = "suitCombination-" + suitCombination;
				td.innerHTML = `${formatSuit(suit1)}${formatSuit(suit2)}`;
				td.style.backgroundColor = "white";
				td.style.cursor = "pointer";
				td.addEventListener("click", function () {
					game.toggleSuitedness(suitCombination);
				});
				row.appendChild(td);
			}
			suitednessTable.appendChild(row);
		}

		// Init
		for (let suit of ["ss", "hh", "dd", "cc"]) game.toggleSuitedness(suit);
	},
}

function formatSuit(suit) {
	return `<span style="color: ${suit.color}">${suit.symbol}</span>`
}

function generateCell(name) {
	let cell = document.createElement("td");
	cell.id = name;
	cell.addEventListener("mouseenter", function () {
		fillCombosHovered(Game.tokenCombos[name]);
	});

	let square = document.createElement("div");
	square.className = "square";
	cell.appendChild(square);

	// Label
	let content = document.createElement("div");
	content.className = "content";
	content.appendChild(document.createTextNode(name));
	square.appendChild(content);

	// Areas
	for (let index = 0; index < Game.actions.length; index++) {
		let action = Game.actions[index];
		let area = document.createElement("div");
		area.id = "grid-" + name + "-" + index;
		area.style.backgroundColor = action.color;
		area.style.flexBasis = "0%";
		square.appendChild(area);
	}

	return cell;
}

function generateActionCell (action) {
	let tdColor = document.createElement("td")
	tdColor.width = "20px";
	tdColor.style.backgroundColor = action.color;
	return tdColor;
}

function fillCombosHovered(combos) {
	const container = document.getElementById("combosHovered");
	if (container !== null) {
		container.innerHTML = "";
		if (!combos) {
			return
		}

		const table = document.createElement("table");
		for (combo of combos.keys()) {
			const weights = Game.comboWeights[combo];

			const row = document.createElement("tr");
			table.appendChild(row);
			row.innerHTML += (`<td>${formatCombo(combo)}</td>`);

			for (let index = 0; index < Game.actions.length; index++) {
				const action = Game.actions[index];
				const weight = weights[index];

				row.appendChild(generateActionCell(action));
				row.innerHTML += (`<td>${weight}</td>`);
			}
		}
		container.appendChild(table);
	}
}

function toHex(value) {
	return value.toString(16).padStart(2, '0');
}

/**
 *
 * Get an RGB code of a gradient from dark red -> red -> yellow.
 *
 * Input: float between 0 and 1
 * Output: RGB code as a string
 *
 * Examples:
 * getRed(0); // "#AA0000"
 * getRed(0.3); // "#DD0000"
 * getRed(0.5); // "#FF0000"
 * getRed(0.7); // "#FF6600"
 * getRed(1); // "#FFFF00"
 */
function getRed(value) {
	if (!(0 <= value && value <= 1)) {
		throw new Error("Invalid gradient: Value must be between 0 and 1.");
	}

	var red = 255;
	var green = 0;
	var blue = 0;

	if (value < 0.5) {
		red = Math.round(170 * (value + 1));  // Linear #AA to #FF
	}
	else {
		green = Math.round(510 * (value - 0.5));  // Linear #00 to #FF
	}

	return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function parseActions(raws) {
	const nbBets = raws.filter(action => action.startsWith("Bet(")).length;
	let counterBets = nbBets;
	const actions = [];

	for (let action of raws) {
		// Get color
		let color = "gray";
		if (["Check", "Call"].includes(action)) {
			color = "green";
		} else if (action.startsWith("AllIn(")) {
			color = "purple";
		} else if (action.startsWith("Bet(")) {
			counterBets--;
			color = getRed(counterBets / nbBets);
		}

		// Push action
		actions.push({ "id": action, "color": color });
	}

	return actions;
}

function formatCard(card) {
	return `<span class="card-${card[1]}">${card[0]}${SUITS[card[1]].symbol}</span>`;
}

function formatCombo(combo) {
    const cards = [];
    for (let i = 0; i < combo.length; i += 2) {
        const card = combo.slice(i, i + 2);
        cards.push(formatCard(card));
    }
    return cards.join('');
}

function formatBoard(raw) {
	return raw.split(',')
		.map(formatCard)
		.join(' ');
}


/**
 * Convert a combo to its generic token.
 * Use Game.suitedness for the suffix, even for pairs.
 *
 * Examples:
 * getToken("JhTh"); // JTs
 * getToken("TsJh"); // JTo
 * getToken("8s8h"); // 88o
 */
function getToken(combo) {
	var rank1 = combo[0];
	var rank2 = combo[2];
	var suit1 = combo[1];
	var suit2 = combo[3];

	if (RANKS.indexOf(rank1) > RANKS.indexOf(rank2)) {
		// Put the highest card first
		[rank1, rank2] = [rank2, rank1];
		[suit1, suit2] = [suit2, suit1];
	}

	const suited = (Game.suitedness.has(suit1 + suit2)) ? "s" : "o";
	return rank1 + rank2 + suited;
}

function getAllTokens() {
	const tokens = {};

	// Regroup weights
	for (let [combo, weights] of Object.entries(Game.comboWeights)) {
		const token = getToken(combo);
		const weightLists = tokens[token] || [];
		for (let i = 0; i < weights.length; i++) {
			weightLists[i] = weightLists[i] || [];
			weightLists[i].push(weights[i]);
		}
		tokens[token] = weightLists;
	}

	// Compute averages
	for (let [token, weights] of Object.entries(tokens)) {
		tokens[token] = weights.map((weightList) => {
			const sum = weightList.reduce((acc, weight) => acc + weight, 0);
			return sum / weightList.length;
		});
	}

	return tokens;
}

function refreshCombos() {
	// Update grid
	for (let [token, weights] of Object.entries(getAllTokens())) {
		for (let index = 0; index < weights.length; index++) {
			const weight = weights[index];
			const area = document.getElementById("grid-" + token + "-" + index);
			area.style.flexBasis = String(weight * 100) + "%";
		}
	}
}

function refreshGrid() {
	grid.innerHTML = "";
	for (let i1 = 0; i1 < RANKS.length; i1++) {
		let r1 = RANKS[i1];
		let row = document.createElement("tr");
		for (let i2 = 0; i2 < RANKS.length; i2++) {
			let r2 = RANKS[i2];

			if (i1 > i2) {
				row.appendChild(generateCell(r2 + r1 + "o"));
			} else if (i1 < i2) {
				row.appendChild(generateCell(r1 + r2 + "s"));
			} else {
				row.appendChild(generateCell(r1 + r2 + "o"));
				row.appendChild(generateCell(r1 + r2 + "s"));
			}
		}
		grid.appendChild(row);
	}

	refreshCombos();
}

function updateGrid() {
	// Parse lines
	const lines = document.getElementById("inputArea").value.split('\n');
	if (lines.length !== 4) {
		alert("Invalid input. Please enter exactly 4 lines of JSON.");
		return;
	}

	// Parse hands and weights as arrays
	let board, actions, hands, weights;
	try {
		[board, actions, hands, weights] = lines.map(JSON.parse);
		board = formatBoard(board);
		actions = parseActions(actions);
	} catch (error) {
		alert(
			"Invalid input. Please enter 4 valid JSON lines.\n\n"
			+ "Error detail:\n" + error
			);
		return;
	}

	// Validate the input
	if (!Array.isArray(hands) || !Array.isArray(weights) || hands.length * actions.length !== weights.length) {
		alert("Invalid input. Please enter valid hands and weights lists.");
		return;
	}

	// Update game variables
	document.getElementById("titleBoard").innerHTML = ' - ' + board;
	Game.setActions(actions);
	Game.resetCombos();

	for (let index = 0; index < hands.length; index++) {
		const combo = hands[index];
		const cWeights = [];
		for (let adex = 0; adex < Game.actions.length; adex++) {
			cWeights.push(weights[index + adex * hands.length]);
		}
		Game.setComboWeights(combo, cWeights);
	}

	// Clear the grid and generate new cells
	Game.refreshTokenCombos();
	refreshGrid();
}

refreshGrid();
Game.initSuitedness();
