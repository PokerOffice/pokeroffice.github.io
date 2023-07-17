const grid = document.getElementById("grid");
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const ACTIONS = [
  { "id": "Raise", "color": "red" },
  { "id": "Call", "color": "green" },
  { "id": "Fold", "color": "blue" },
];

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
  for (let action of ACTIONS) {
	let area = document.createElement("div");
	area.id = "grid-" + name + "-" + action.id;
	area.style.backgroundColor = action.color;
	area.style.flexBasis = "21%";
	square.appendChild(area);
  }

  return cell;
}

function refreshGrid(grid) {
  grid.innerHTML = "";
  for (let i1 = 0; i1 < RANKS.length; i1++) {
	let r1 = RANKS[i1];
	let row = document.createElement("tr");
	for (let i2 = 0; i2 < RANKS.length; i2++) {
	  let r2 = RANKS[i2];

	  if (i1 > i2) {
	  	row.appendChild(generateCell(r2 + r1 + "o"));
	  }
	  else if (i1 < i2) {
	  	row.appendChild(generateCell(r1 + r2 + "s"));
	  }
	  else {
	  	row.appendChild(generateCell(r1 + r2 + "o"));
	  	row.appendChild(generateCell(r1 + r2 + "s"));
	  }
	}
	grid.appendChild(row);
  }
}

refreshGrid(grid);
