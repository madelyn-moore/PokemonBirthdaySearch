// search.js - the two search methods and the timing helper.
// index.html, benchmark.html and test/correctness.js all use this one file, so every
// page and test measures exactly the same code.

const MAX_BIRTHDAY_NUMBER = 1231;   // 12/31, the largest date encoding (month * 100 + day)

let dexList = [];                   // every Pokédex number
const indexTable = new Map();       // birthday number (like 1020) -> list of [a, b] pairs
let benchmarkSink = 0;              // stops the browser from skipping searches whose result is unused

function setDexList(numbers) {
  dexList = numbers.slice();
  indexTable.clear();
}

// Precomputed lookup index: built once at startup. Returns how long the build took (ms).
function buildIndex() {
  const start = performance.now();
  indexTable.clear();
  for (let i = 0; i < dexList.length; i++) {
    for (let j = i + 1; j < dexList.length; j++) {
      const sum = dexList[i] + dexList[j];
      if (sum <= MAX_BIRTHDAY_NUMBER) {
        if (!indexTable.has(sum)) indexTable.set(sum, []);
        indexTable.get(sum).push([dexList[i], dexList[j]]);
      }
    }
  }
  return performance.now() - start;
}

// How many pairs the index is holding (used when reporting memory)
function indexPairCount() {
  let count = 0;
  for (const pairs of indexTable.values()) count += pairs.length;
  return count;
}

// Both search methods take a birthday number and return a list of [a, b] pairs,
// so averageMs and the benchmark can time either one the same way.
function indexSearch(target) {
  return indexTable.get(target) || [];
}

// Baseline: dynamic query-time search. Does the work again on every request.
function dynamicSearch(target) {
  const result = [];
  for (let i = 0; i < dexList.length; i++)
    for (let j = i + 1; j < dexList.length; j++)
      if (dexList[i] + dexList[j] === target) result.push([dexList[i], dexList[j]]);
  return result;
}

// Average time (ms) of one search, over several runs
function averageMs(search, target, runs) {
  const start = performance.now();
  for (let r = 0; r < runs; r++) benchmarkSink += search(target).length;
  return (performance.now() - start) / runs;
}

if (typeof module !== "undefined") {
  module.exports = { setDexList, buildIndex, indexPairCount, indexSearch, dynamicSearch, averageMs };
}
