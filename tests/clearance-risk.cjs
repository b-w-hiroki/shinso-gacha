const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const start = html.indexOf("const CLEARANCE_BANDS = [");
const end = html.indexOf("const clearanceForRank", start);
assert(start > 0 && end > start, "personnel clearance bands are defined");
const bands = vm.runInNewContext(html.slice(start, end) + "\nCLEARANCE_BANDS");
assert.deepEqual(Array.from(bands, b => b.from), [0, 3, 6, 10, 14, 17]);
assert.equal(bands.length, 6);
for (let rank = 0; rank < 20; rank++) {
  const band = bands.reduce((cur, b) => rank >= b.from ? b : cur, bands[0]);
  assert.equal(band.tier, [0, 3, 6, 10, 14, 17].filter(n => rank >= n).length - 1);
  assert(band.position && band.access && band.warning);
}
assert(html.includes("id=\"rk-clearance\"") && html.includes("id=\"rk-risk\""),
  "personnel records show placement and access warning");
assert(html.includes("clearanceRank:rankIdx()"),
  "incident records snapshot clearance at the time of investigation");
assert(html.includes("Number.isInteger(p.clearanceRank) ? p.clearanceRank : 0"),
  "older saved incidents remain readable");
assert(html.includes("p.at || seed") && html.includes("band.trace"),
  "rank-dependent residual traces are deterministic, not passive penalties");
assert(html.includes("const RANK_NEED = [0, 10, 25"),
  "existing rank progression is preserved");
console.log("Clearance progression checks passed");
