const fs = require('fs');

function parseLine(line) {
	line = line.replace(/#.*/, '');
	line = line.trim();
	if (line.length === 0) {
		return null;
	}

	let parts = line.split(';').map(s => s.trim());

	if (/\.\./.test(parts[0])) {
		const range = parts[0].split('..');
		return { from: parseInt(range[0], 16), to: parseInt(range[1], 16), type: parts[1] };
	}

	return { from: parseInt(parts[0], 16), to: parseInt(parts[0], 16), type: parts[1] };
}

function parseFile(filename) {
	const fileContents = fs.readFileSync(filename).toString('utf8');
	const lines = fileContents.split('\n');
	const result = [];
	for (let i = 0; i < lines.length; i++) {
		let line = parseLine(lines[i]);
		if (line) {
			result.push(line);
		}
	}
	return result;
}

const typeToInt = {
	'Prepend': 1,
	'CR': 2,
	'LF': 3,
	'Control': 4,
	'Extend': 5,
	'Regional_Indicator': 6,
	'SpacingMark': 7,
	'L': 8,
	'V': 9,
	'T': 10,
	'LV': 11,
	'LVT': 12,
	'ZWJ': 13,
	'Emoji_Presentation': 14
}

const tuples = [];
parseFile('./GraphemeBreakProperty.txt').forEach(item => tuples.push({ from:item.from, to:item.to, type: typeToInt[item.type] }));
parseFile('./emoji-data.txt').filter(item => item.type === 'Emoji_Presentation').forEach(item => tuples.push({ from:item.from, to:item.to, type: typeToInt[item.type] }));
tuples.sort((t1, t2) => t1.from - t2.from);

let tuplesTree = [];
function buildTree(fromIndex, toIndex, outIndex) {
	const midIndex = ((fromIndex + toIndex) / 2) | 0;
	tuplesTree[outIndex] = tuples[midIndex];

	if (fromIndex < midIndex) {
		// left subtree
		buildTree(fromIndex, midIndex - 1, 2 * outIndex);
	}
	if (midIndex < toIndex) {
		// right subtree
		buildTree(midIndex + 1, toIndex, 2 * outIndex + 1);
	}
}
buildTree(0, tuples.length - 1, 1);

let result = [0,0,0];
tuplesTree.forEach(t => result.push(t.from, t.to, t.type));

console.log(JSON.stringify(result));
