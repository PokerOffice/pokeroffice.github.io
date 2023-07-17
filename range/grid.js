const grid = document.getElementById("grid");
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const ACTIONS = [
	{ "id": "Raise", "color": "red" },
	{ "id": "Call", "color": "green" },
	{ "id": "Fold", "color": "blue" },
];

var combos = {};
var suitedness = new Set(["ss", "hh", "dd", "cc"]);

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
