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
has(/rescue-flash/, "fragment 33 visual rescue reset missing");
assert(!html.includes("必要なら、こちらへ"), "obsolete voluntary recruitment copy returned");
assert(!html.includes("まだ一般人でいるのか"), "obsolete voluntary recruitment implication returned");
has(/PROTECTIVE CLEARANCE/, "agent transition must read as protective clearance");
has(/n === 35[\s\S]*保護通信[\s\S]*見てはいけないところまで来た/, "fragment 35 protected communication missing");
has(/n === 36[\s\S]*保護手続き[\s\S]*action:"apply"[\s\S]*事情聴取を受ける/, "fragment 36 interview handoff missing");
has(/if \(liteTotal\(\) < 36\)/, "interview must stay locked until fragment 36");
has(/\.lite-footer\.nav-only \.lite-pull \{ display:none; \}/, "large CTA must be hidden outside the open tab");
has(/const RESEARCH_COST\s*=\s*\[0,\s*8,\s*14,\s*22\]/, "re-investigation costs changed");
has(/S\.weekSeen !== w\.key && S\.pulls >= 20/, "weekly anomaly gate changed");
has(/S\.pursuerPending = true/, "new-agent pursuer numbering trigger missing");
has(/if \(assignNo && !S\.pursuerNo && pursuerTotal > 0\)/, "pursuer number persistence guard missing");
has(/\[hidden\] \{ display: none !important; \}/, "hidden visibility safety rule missing");
has(/@media \(max-width: 599px\)[\s\S]*\.lite-event \{ min-height:clamp\(270px,43dvh,360px\)/, "mobile lite-event composition missing");
has(/\.desk-event \{ min-height:clamp\(245px,38dvh,320px\)/, "mobile investigation desk composition missing");
has(/aria-label="調査デスクの表示切替"/, "investigation desk accessible label missing");

console.log("shinso-gacha smoke checks passed");

has(/class="thread-radar"/, "thread radar must be on the agent first view");
has(/id="radar-posts"/, "thread radar feed missing");
has(/radar\.prepend\(line\)/, "thread posts must feed the radar");
has(/body:not\(\.lite\) #pursuer-signal \{ display:none !important; \}/, "pursuer count must not occupy the agent home");
assert(!/aid\.innerHTML[^\n]*pursuerNo/.test(html), "pursuer ordinal must not remain in the persistent report card");
