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

has(/class="agent-footer"/, "agent home must use the lite-style fixed footer");
has(/id="agent-primary"/, "agent event primary CTA missing");
has(/primary\.textContent = e\.label;[\s\S]*primary\.dataset\.desk = e\.action;/, "agent primary CTA must follow the current event");
has(/body:has\(\.agent-home:not\(\[hidden\]\)\) \.nav \{ display:none; \}/, "global nav must not compete with the agent first view");

has(/id="radar-distance"/, "radar distance indicator missing");
has(/function radarSignal\(\)/, "functional radar signal model missing");
has(/ゲーム内観測/, "radar location must be explicitly fictional in-world observation");
has(/renderRadar\(\);/, "radar must update with the current desk event");
has(/DANGER \/ 接近中/, "danger radar state missing");

has(/data-desk="evidence"/, "radar evidence entry point missing");
has(/function openAnomalyEvidence\(\)/, "anomaly evidence sheet missing");
has(/ゲーム内観測値/, "evidence location must remain explicitly fictional");

has(/function resolveCase\(choice\)/, "anomaly response decision loop missing");
has(/現地確認[\s\S]*遠隔封鎖[\s\S]*経過観察/, "three anomaly response choices missing");
has(/SEALED \/ 封鎖済/, "sealed radar result missing");
has(/ON SITE \/ 現地確認/, "on-site radar result missing");
has(/WATCH \/ 経過観察/, "watch radar result missing");
has(/S\.caseLog\[dayKey\(\)\]/, "case decision must persist");

has(/function caseAftermath\(\)/, "case aftermath system missing");
has(/RECUR \/ 再発/, "field investigation aftermath missing");
has(/LEAK \/ 漏出/, "remote seal aftermath missing");
has(/CLOSER \/ 接近/, "watch aftermath missing");
has(/action:"evidence", label:"再検出を確認する"/, "aftermath must return to evidence investigation");
assert(html.includes('line.dataset.aftermath = "1"'), "aftermath thread signal missing");

has(/id="wallet" type="button"/, "suspicion points must be tappable");
has(/function openWalletDetail\(\)/, "suspicion point rate detail missing");
assert(html.includes("<span>1時間</span><b>約"), "hourly passive estimate missing");
has(/次の \+1pt まで/, "next passive gain countdown missing");
has(/const EVIDENCE_TYPES = \["cctv","map","audio","intercom","transit","photo"\]/, "expanded evidence set missing");
has(/const AFTERMATH = \{/, "varied aftermath table missing");
has(/FOLLOW \/ 追随/, "field aftermath variety missing");
has(/SHIFT \/ 境界変位/, "seal aftermath variety missing");
has(/SPLIT \/ 分岐/, "watch aftermath variety missing");
has(/\.agent-home \.home-sniff\{display:none\}/, "secondary sniff action must leave the mobile first view");

has(/class="wallet-detail"/, "wallet detail must use compact mobile grid");
has(/駅の時計、1台だけ4分遅れてる/, "expanded everyday-horror thread corpus missing");
has(/今日の任務、住所がうちの最寄りと一文字違い/, "thread corpus variety missing");
has(/data-kind="\$\{e\.type\}"/, "evidence visual kind hook missing");

assert(!html.includes('data-htab="comms"'), "obsolete log tab must stay removed");
assert(!html.includes('data-hpane="comms"'), "obsolete log pane must stay removed");
has(/ANOMALY DETECTION SYSTEM/, "radar terminal HUD missing");
has(/SECTOR-A7 \/ SIM/, "fictional radar sector HUD missing");
has(/grid-template-columns:1fr 1fr/, "agent footer must stay two-tab after log removal");

assert(!html.includes('data-stab="gacha:rank"'), "rank must not remain a gacha mode");
assert(!html.includes('data-spane="gacha:rank"'), "rank pane must leave gacha");
has(/class="rankcard wallet-rank"/, "rank status must live in suspicion point detail");
