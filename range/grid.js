const grid = document.getElementById("grid");
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const SUITS = [
	{"raw": "s", "symbol": "&spades;", "color": "black"},
	{"raw": "h", "symbol": "&hearts;", "color": "red"},
	{"raw": "d", "symbol": "&diams;", "color": "blue"},
	{"raw": "c", "symbol": "&clubs;", "color": "darkGreen"},
];

const ACTIONS = [
	{ "id": "Raise", "color": "red" },
	{ "id": "Call", "color": "green" },
	{ "id": "Fold", "color": "blue" },
];

var combos = {};
var suitedness = new Set();

function toggleSuitedness(suitCombination) {
	const td = document.getElementById("suitCombination-" + suitCombination);

	if (suitedness.has(suitCombination)) {
		suitedness.delete(suitCombination);
		td.style.backgroundColor = "white";
	} else {
		suitedness.add(suitCombination);
		td.style.backgroundColor = "cyan";
	}

	refreshGrid();
}

function formatSuit(suit) {
	return `<span style="color: ${suit.color}">${suit.symbol}</span>`
}

function initSuitedness() {
	// Build HTML
	const suitednessTable = document.getElementById("suitednessTable");
	for (let suit1 of SUITS) {
		const row = document.createElement("tr");
		for (let suit2 of SUITS) {
			const td = document.createElement("td");
			const suitCombination = suit1.raw + suit2.raw;
			td.id = "suitCombination-" + suitCombination;
			td.innerHTML = `${formatSuit(suit1)}${formatSuit(suit2)}`;
			td.style.backgroundColor = "white";
			td.style.cursor = "pointer";
			td.addEventListener("click", function () {
				toggleSuitedness(suitCombination);
			});
			row.appendChild(td);
		}
		suitednessTable.appendChild(row);
	}

	// Init
	for (let suit of ["ss", "hh", "dd", "cc"]) toggleSuitedness(suit);
}

function generateCell(name) {
	let cell = document.createElement("td");
	cell.id = name;
	let square = document.createElement("div");
	square.className = "square";
	cell.appendChild(square);

	// Label
	let content = document.createElement("div");
	content.className = "content";
	content.appendChild(document.createTextNode(name));
	square.appendChild(content);

	// Areas
	for (let index = 0; index < ACTIONS.length; index++) {
		let action = ACTIONS[index];
		let area = document.createElement("div");
		area.id = "grid-" + name + "-" + index;
		area.style.backgroundColor = action.color;
		area.style.flexBasis = "0%";
		square.appendChild(area);
	}

	return cell;
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

/**
 * Convert a combo to its generic token.
 * Use global variable suitedness for the suffix, even for pairs.
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

	const suited = (suitedness.has(suit1 + suit2)) ? "s" : "o";
	return rank1 + rank2 + suited;
}

function getAllTokens() {
	const tokens = {};

	// Regroup weights
	for (let [combo, weights] of Object.entries(combos)) {
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

refreshGrid();
initSuitedness();
