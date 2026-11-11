// tools/code-metrics.js - Q3: lines of code and cyclomatic complexity of each approach.
// Run from the project folder:  node tools/code-metrics.js
const fs = require("fs");
const source = fs.readFileSync(__dirname + "/../search.js", "utf8");

// Which functions in search.js make up each approach
const approaches = {
  "Baseline: dynamic search": ["dynamicSearch"],
  "Precomputed lookup index": ["buildIndex", "indexSearch"]
};

// Returns the text of `function name(...) { ... }`
function getFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start === -1) throw new Error("Could not find function " + name);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
}

const withoutComments = text => text.split("\n").map(line => line.replace(/\/\/.*$/, "")).join("\n");

// Lines of code: lines that are not blank and not only a comment
function linesOfCode(text) {
  return text.split("\n").filter(line => line.trim() !== "" && !line.trim().startsWith("//")).length;
}

// Cyclomatic complexity: 1 + the number of decision points (if, for, while, case, catch, &&, ||, ?:)
function complexity(text) {
  const decisions = withoutComments(text).match(/\b(if|for|while|case|catch)\b|&&|\|\||\?(?!\.)/g) || [];
  return 1 + decisions.length;
}

console.log("Q3: code size and complexity (from search.js)\n");
for (const [approach, names] of Object.entries(approaches)) {
  const functions = names.map(name => ({ name, text: getFunction(name) }));
  const loc = functions.reduce((sum, f) => sum + linesOfCode(f.text), 0);
  const perFunction = functions.map(f => `${f.name} ${complexity(f.text)}`).join(", ");
  console.log(approach);
  console.log(`  Functions:                ${names.join(", ")}`);
  console.log(`  Lines of code:            ${loc}`);
  console.log(`  Cyclomatic complexity:    ${perFunction}\n`);
}
console.log("Counts skip blank lines and comments. Complexity is counted by keyword, so it is a close estimate; cross-check with lizard if you can.");
