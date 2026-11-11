// Correctness tests for the two search methods. No browser, internet or install needed.
// Run from the project folder:  node test/correctness.js
const { setDexList, buildIndex, indexSearch, dynamicSearch } = require("../search.js");

let failures = 0;
function check(name, condition) {
  if (!condition) { failures++; console.log("FAIL:", name); }
}

// Independent check on the number of matches (a different method from both searches):
// pairs a < b with a + b = target and 1 <= a, b <= n
function expectedCount(target, n) {
  const low = Math.max(1, target - n);
  const high = Math.floor((target - 1) / 2);
  return Math.max(0, high - low + 1);
}

// Every date in a leap year as a birthday number (1/1 -> 101 ... 12/31 -> 1231)
const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const targets = [];
for (let m = 1; m <= 12; m++)
  for (let d = 1; d <= daysInMonth[m - 1]; d++) targets.push(m * 100 + d);

// Test 1: full dataset (Pokédex numbers 1 to 1025), every date
const N = 1025;
setDexList(Array.from({ length: N }, (_, i) => i + 1));
buildIndex();

for (const t of targets) {
  const fromIndex = indexSearch(t);
  const fromDynamic = dynamicSearch(t);
  check(`${t}: both methods return the same pairs`, JSON.stringify(fromIndex) === JSON.stringify(fromDynamic));
  check(`${t}: match count is ${expectedCount(t, N)}`, fromDynamic.length === expectedCount(t, N));
  check(`${t}: every pair sums to the date, is unordered, and has no repeated Pokémon`,
        fromDynamic.every(([a, b]) => a + b === t && a < b));
  check(`${t}: no duplicate pairs`, new Set(fromDynamic.map(p => p.join(","))).size === fromDynamic.length);
}
console.log(`Full dataset: checked ${targets.length} dates`);

// Test 2: a date with no matches returns an empty list from both methods
setDexList([1, 2, 3]);
buildIndex();
check("no matches: dynamic returns an empty list", dynamicSearch(1231).length === 0);
check("no matches: index returns an empty list", indexSearch(1231).length === 0);
console.log("Small dataset: checked the no-match case");

console.log(failures === 0 ? "ALL TESTS PASSED" : `${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
