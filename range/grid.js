const grid = document.getElementById("grid");
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"]

const ACTIONS = [
	{"id": "Raise", "color": "red"},
	{"id": "Call", "color": "green"},
	{"id": "Fold", "color": "blue"},
];


function generateCell(name) {
	let cell = document.createElement("td", {"id": name});

	// Label
	let content = document.createElement("div", {"class": "content"});
	content.appendChild(document.createTextNode(name));
	cell.appendChild(content);

	// Areas
	for action in ACTIONS {
		let area = document.createElement("div", {"id": "grid-" + name + "-" + action.id});
		area.updateStyle({
			"background-color": action.color,
			"flex-basis": "21%",
		});
	}

	return cell;
}

function refreshGrid(grid) {
	grid.setInnerHTML("");
	for i1, r1 in enumerate(RANKS) {
		let row = document.createElement("tr");
		for i2, r2 in enumerate(RANKS) {
			let cell = generateCell(r1 + r2);
			row.appendChild(cell);
		}
		grid.appendChild(row);
	}
}

refreshGrid(grid);
