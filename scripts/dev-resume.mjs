#!/usr/bin/env node
// Read-only, one-repository live resume context. No untrusted Issue body is executed.
// Output is metadata, not a command, a work claim, or an authorization to merge.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SHA = /^[0-9a-f]{40}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const STOP = new Set(['autopilot:blocked', 'human-required', 'production-only',
  'security-review', 'do-not-automate']);
const CLOSES = /\b(?:close[sd]?|fix(?:es|ed)?|resolve[sd]?)\s+#(\d+)\b/gi;
const DONE = /^\s*[-*]\s*\[\s\]\s+\S/im;

function labels(item) {
  return (item.labels || []).map(x => typeof x === 'string' ? x : x.name)
    .filter(x => typeof x === 'string').map(x => x.toLowerCase());
}
function rank(item) {
  const tags = labels(item);
  for (const [i, p] of ['priority:p0', 'priority:p1', 'priority:p2'].entries()) {
    if (tags.includes(p)) return i;
  }
  const m = /^P([012])\s*[:：]/i.exec(item.title || '');
  return m ? Number(m[1]) : 3;
}
function publicIssue(item, repo) {
  return { number: item.number, title: String(item.title || '').slice(0, 180),
    url: 'https://github.com/' + repo + '/issues/' + item.number,
    priority: rank(item), labels: labels(item) };
}
function list(value, field) {
  if (!Array.isArray(value)) throw new Error('GitHub did not return ' + field);
  if (value.length >= 100) throw new Error(field + ' results may be truncated; paginate before selecting');
  return value;
}
export function chooseWork(issues, pulls, repo) {
  const claimed = new Set();
  for (const pr of pulls) {
    for (const m of (pr.body || '').matchAll(CLOSES)) claimed.add(Number(m[1]));
  }
  const sorted = [...issues].filter(x => !x.pull_request && x.state === 'open')
    .sort((a,b) => rank(a) - rank(b) || a.number - b.number);
  const human = sorted.filter(x => labels(x).some(l => STOP.has(l)) ||
    /(本番Firebase|iPhone実機|物理端末)/i.test(x.title || ''));
  const candidate = sorted.filter(x => !human.includes(x) && !claimed.has(x.number));
  const opted = candidate.find(x => labels(x).includes('autopilot:ready') &&
    labels(x).some(l => /^priority:p[012]$/.test(l)) && DONE.test(x.body || ''));
  return {
    status: opted ? 'ready_for_authorized_agent_review' : 'triage_required',
    selected: opted ? publicIssue(opted, repo) : null,
    suggested: candidate.slice(0, 5).map(x => publicIssue(x, repo)),
    human_required: human.slice(0, 10).map(x => publicIssue(x, repo)),
    blocked_by_open_pr: [...claimed].filter(n => sorted.some(x => x.number === n)),
    execution_started: false, automatic_merge: false
  };
}
export async function buildSnapshot(repo, api, now = new Date()) {
  if (typeof repo !== 'string' || !REPO.test(repo)) throw new Error('invalid repository');
  const branch = await api('/repos/' + repo + '/branches/main');
  const mainSha = branch?.commit?.sha;
  if (typeof mainSha !== 'string' || !SHA.test(mainSha)) throw new Error('main sha missing');
  const [allIssues, allPulls, allRuns] = await Promise.all([
    api('/repos/' + repo + '/issues?state=open&per_page=100'),
    api('/repos/' + repo + '/pulls?state=open&per_page=100'),
    api('/repos/' + repo + '/actions/runs?head_sha=' + mainSha + '&per_page=100')
  ]);
  const issues = list(allIssues, 'issues').filter(x => !x.pull_request);
  const pulls = list(allPulls, 'pulls');
  const runs = list(allRuns?.workflow_runs, 'runs');
  const seen = new Set();
  const mainChecks = [];
  for (const r of runs) {
    if (r.head_sha !== mainSha || r.event !== 'push' ||
        typeof r.name !== 'string' || seen.has(r.name)) continue;
    seen.add(r.name);
    mainChecks.push({ name: r.name, status: r.status, conclusion: r.conclusion,
      attempt: r.run_attempt, url: r.html_url });
  }
  const final = await api('/repos/' + repo + '/branches/main');
  if (final?.commit?.sha !== mainSha) throw new Error('main advanced during snapshot; retry');
  return {
    schema_version: 1, repository: repo, observed_at: now.toISOString(),
    main_sha: mainSha, main_checks: mainChecks,
    open_pull_requests: pulls.map(x => ({ number: x.number,
      title: String(x.title || '').slice(0, 180), head_sha: x.head?.sha,
      url: 'https://github.com/' + repo + '/pull/' + x.number })),
    open_issue_count: issues.length,
    queue: chooseWork(issues, pulls, repo),
    source: 'authenticated live GitHub API, not cached chat history',
    note: 'Read-only snapshot. Check latest main, PR, Issue comments and CI again before writes.'
  };
}
async function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const index = process.argv.indexOf('--output');
  if (!token || !repo || index < 0 || !process.argv[index+1]) {
    throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY and --output are required');
  }
  async function api(path) {
    const response = await fetch('https://api.github.com' + path, {
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28' }
    });
    if (!response.ok) throw new Error('GitHub API status ' + response.status + ' for ' + path);
    return response.json();
  }
  const result = await buildSnapshot(repo, api);
  await writeFile(process.argv[index+1], JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log('Resume snapshot: ' + result.repository + ' @ ' + result.main_sha);
  console.log('Queue: ' + result.queue.status +
    '; suggested=' + result.queue.suggested.map(i => '#' + i.number).join(', '));
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(e => { console.error('Read-only resume failed:', e.message); process.exitCode = 1; });
}
