// benchmark.js - runs the evaluation and returns the results as one object.
// Needs search.js to be loaded first. benchmark.html shows the results; the numbers come from here.

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];   // leap year, so 2/29 is included
const BATCH_SIZES = [100, 250, 500, 1000, 2000];                          // simulated request volumes

// Every date in the year as a birthday number (1/1 -> 101 ... 12/31 -> 1231)
function allBirthdayNumbers() {
  const targets = [];
  for (let m = 1; m <= 12; m++)
    for (let d = 1; d <= DAYS_IN_MONTH[m - 1]; d++) targets.push(m * 100 + d);
  return targets;
}

function stats(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const at = fraction => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return { mean, median: at(0.5), p95: at(0.95), min: sorted[0], max: sorted[sorted.length - 1] };
}

// JS heap in MB. Only Chrome and Edge report this, other browsers give null.
function heapMB() {
  return (typeof performance !== "undefined" && performance.memory) ? performance.memory.usedJSHeapSize / 1e6 : null;
}

const tick = () => new Promise(resolve => setTimeout(resolve));   // lets the page repaint between steps

// All requests arrive at once and are handled one after another (the browser is single-threaded),
// so totalMs is how long the last request waited.
function throughput(search, batchSize, targets, thresholdMs) {
  const start = performance.now();
  for (let i = 0; i < batchSize; i++) benchmarkSink += search(targets[i % targets.length]).length;
  const totalMs = performance.now() - start;
  return { requests: batchSize, totalMs, rps: batchSize / (totalMs / 1000), withinThreshold: totalMs <= thresholdMs };
}

// config: { label, runsIndex, runsDynamic, thresholdMs }
// loadInfo: { loadMs, loadedFromCache } measured by the page when it loaded the Pokémon list
async function runBenchmark(config, dexNumbers, loadInfo, onStatus) {
  const targets = allBirthdayNumbers();

  // 1. Startup: index build time, and the JS heap before and after the first build
  onStatus("Measuring startup...");
  await tick();
  setDexList(dexNumbers);
  const heapBefore = heapMB();
  const buildTimes = [buildIndex()];
  const heapAfter = heapMB();
  for (let i = 0; i < 4; i++) buildTimes.push(buildIndex());

  // 2. Correctness: both methods must return identical pairs for every date
  onStatus("Checking that both methods agree on all dates...");
  await tick();
  let mismatches = 0;
  for (const t of targets)
    if (JSON.stringify(indexSearch(t)) !== JSON.stringify(dynamicSearch(t))) mismatches++;

  // 3. Latency: average time per search for each date, then summary numbers across all dates
  onStatus("Timing the precomputed index...");
  await tick();
  const indexMs = targets.map(t => averageMs(indexSearch, t, config.runsIndex));
  onStatus("Timing the dynamic search...");
  await tick();
  const dynamicMs = targets.map(t => averageMs(dynamicSearch, t, config.runsDynamic));

  // 4. Throughput: growing batches of requests, run back to back
  const index = [], dynamic = [];
  for (const size of BATCH_SIZES) {
    onStatus(`Throughput test: ${size} requests...`);
    await tick();
    index.push(throughput(indexSearch, size, targets, config.thresholdMs));
    dynamic.push(throughput(dynamicSearch, size, targets, config.thresholdMs));
  }

  return {
    label: config.label,
    date: new Date().toISOString(),
    environment: {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "node",
      cores: (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || null,
      deviceMemoryGB: (typeof navigator !== "undefined" && navigator.deviceMemory) || null
    },
    settings: {
      pokemonCount: dexNumbers.length, dates: targets.length,
      runsIndex: config.runsIndex, runsDynamic: config.runsDynamic, thresholdMs: config.thresholdMs
    },
    startup: {
      loadMs: loadInfo.loadMs, loadedFromCache: loadInfo.loadedFromCache,
      indexBuildFirstMs: buildTimes[0], indexBuildMedianMs: stats(buildTimes).median,
      indexPairs: indexPairCount(), heapBeforeMB: heapBefore, heapAfterMB: heapAfter
    },
    correctness: { datesChecked: targets.length, mismatches },
    latencyMs: { index: stats(indexMs), dynamic: stats(dynamicMs) },
    throughput: { index, dynamic }
  };
}
