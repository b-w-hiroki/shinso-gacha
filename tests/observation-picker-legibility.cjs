const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('assets/observation.css','utf8');
for(const token of ['.watch-target-regions button:focus-visible','outline:3px solid #e6d1a8','text-decoration:underline','forced-colors:active','overflow-wrap:anywhere']) assert.ok(css.includes(token),token);
assert.ok(!/watch-target-regions[^{}]*nth-child/.test(css),'no correct-location styling');
console.log('region picker style contract passed (not browser QA)');
