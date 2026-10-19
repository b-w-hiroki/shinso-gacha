const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
assert.match(html, /<meta name="description" content="[^"]+">/);
assert.match(html, /<link rel="canonical" href="https:\/\/shinso-gacha\.birdman-studio\.com\/">/);
assert.match(html, /<meta property="og:title" content="[^"]+">/);
assert.match(html, /<meta property="og:description" content="[^"]+">/);
assert.match(html, /<meta property="og:url" content="https:\/\/shinso-gacha\.birdman-studio\.com\/">/);
assert.match(html, /<script type="application\/ld\+json">[\s\S]*"@type": "VideoGame"/);
assert.match(html, /<noscript>[\s\S]*<h1>真相ガチャ<\/h1>[\s\S]*ブラウザーゲーム/);

const robots = fs.readFileSync("robots.txt", "utf8");
assert.ok(!robots.includes("Disallow:"), "shared URLs must remain fetchable for canonical and link previews");
assert.ok(robots.includes("Sitemap: https://shinso-gacha.birdman-studio.com/sitemap.xml"));

const sitemap = fs.readFileSync("sitemap.xml", "utf8");
assert.ok(sitemap.includes("<loc>https://shinso-gacha.birdman-studio.com/</loc>"));
assert.ok(!sitemap.includes("?ref="), "shared observation URL leaked into sitemap");

console.log("search discovery contract passed");
