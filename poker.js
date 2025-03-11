function getGradientColor(value) {
	value = Math.max(-100, Math.min(100, value));
	let red = Math.max(0, Math.min(255, (value > 0 ? 255 : 255 + value * 2.55)));
	let green = Math.max(0, Math.min(255, (value < 0 ? 255 : 255 - value * 2.55)));
	let blue = 0;
	return `rgb(${red}, ${green}, ${blue})`;
}

function colorizeCards(text) {
    return text.replace(/([AKQJT2-9])([♠♥♣♦cdhs])/g, (match, rank, suit) => {
        let suitClass;
        let suitSymbol = suit; // Default to the same suit if it's already a symbol

        switch (suit.toLowerCase()) {
            case 'h': suitClass = 'heart'; suitSymbol = '♥'; break;
            case 's': suitClass = 'spade'; suitSymbol = '♠'; break;
            case 'c': suitClass = 'club'; suitSymbol = '♣'; break;
            case 'd': suitClass = 'diamond'; suitSymbol = '♦'; break;
            case '♥': suitClass = 'heart'; break;
            case '♠': suitClass = 'spade'; break;
            case '♣': suitClass = 'club'; break;
            case '♦': suitClass = 'diamond'; break;
            default: return match; // In case something unexpected appears
        }

        return `<span class="${suitClass}">${rank}${suitSymbol}</span>`;
    });
}

async function fetchCSV(filename) {
	const response = await fetch(filename); // Load CSV file
	const text = await response.text(); // Read file content
	
	// Convert CSV text into an array of rows
	const rows = text.trim().split("\n").map(row => row.split(","));
	return rows;
}
