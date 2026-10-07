import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("index.html", "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, "inline script not found");

// Syntax regression guard for the single-file app.
new Function(scriptMatch[1]);

const has = (re, message) => assert.match(html, re, message);

has(/if \(n <= 10\) return "calm";[\s\S]*if \(n <= 18\) return "uneasy";[\s\S]*if \(n <= 27\) return "danger";[\s\S]*if \(n <= 32\) return "crisis";[\s\S]*return "rescue";/, "chapter 0 phase boundaries changed");
has(/n === 33[\s\S]*緊急介入[\s\S]*接続を遮断しました/, "fragment 33 rescue intervention missing");
has(/n === 35[\s\S]*保護通信[\s\S]*見てはいけないところまで来た/, "fragment 35 protected communication missing");
has(/n === 36[\s\S]*保護手続き[\s\S]*action:"apply"[\s\S]*事情聴取を受ける/, "fragment 36 interview handoff missing");
has(/if \(liteTotal\(\) < 36\)/, "interview must stay locked until fragment 36");
has(/\.lite-footer\.nav-only \.lite-pull \{ display:none; \}/, "large CTA must be hidden outside the open tab");
has(/const RESEARCH_COST\s*=\s*\{[^}]*1:8[^}]*2:14[^}]*3:22[^}]*\}/, "re-investigation costs changed");
has(/S\.weekSeen !== w\.key && S\.pulls >= 20/, "weekly anomaly gate changed");
has(/S\.pursuerPending = true/, "new-agent pursuer numbering trigger missing");
has(/if \(assignNo && !S\.pursuerNo && pursuerTotal > 0\)/, "pursuer number persistence guard missing");
has(/\[hidden\] \{ display: none !important; \}/, "hidden visibility safety rule missing");

console.log("shinso-gacha smoke checks passed");
