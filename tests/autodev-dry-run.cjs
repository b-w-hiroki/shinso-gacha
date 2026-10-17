const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');

const repo = 'b-w-hiroki/shinso-gacha';
const sha = 'a'.repeat(40);
let mod;
test.before(async () => {
  mod = await import(pathToFileURL(resolve(__dirname, '../scripts/autodev-dry-run.mjs')).href);
});
function snapshot(selected = null, repository = repo) {
  return { repository, main_sha: sha, queue: { selected } };
}
const issue = { number: 204, title: 'P2: harmless fixture',
  url: 'https://github.com/b-w-hiroki/shinso-gacha/issues/204' };

test('no approved issue is a non-executing triage result', () => {
  const state = mod.createDryRunState(snapshot(), { now: new Date('2026-10-17T04:00:00Z') });
  assert.equal(state.status, 'triage_required');
  assert.equal(state.issue, null);
  assert.equal(state.execution.enabled, false);
  assert.equal(state.execution.started, false);
  assert.equal(state.limits.max_cost_usd, 0);
  assert.equal(state.usage.cost_source, 'unavailable-no-executor');
});

test('one approved fixture gets a stable reservation without executing', () => {
  const state = mod.createDryRunState(snapshot(issue));
  assert.equal(state.status, 'planned');
  assert.equal(state.issue.number, 204);
  assert.equal(state.run_key, repo + '#issue-204@' + sha);
  assert.deepEqual(state.execution, {
    enabled: false, started: false, isolated_environment_created: false,
    tests_started: false, pull_request_created: false, automatic_merge: false
  });
});

test('repository allowlist and immutable SHA are enforced', () => {
  assert.throws(() => mod.createDryRunState(snapshot(issue, 'other/repo')), /restricted/);
  assert.throws(() => mod.createDryRunState({ ...snapshot(issue), main_sha: 'main' }), /restricted/);
});

test('manual stop persists and resume requires the same still-eligible issue', () => {
  const planned = mod.createDryRunState(snapshot(issue));
  const stopped = mod.createDryRunState(snapshot(issue), { command: 'stop', previous: planned });
  assert.equal(stopped.status, 'stopped');
  assert.equal(stopped.run_key, planned.run_key);
  const resumed = mod.createDryRunState(snapshot(issue), { command: 'resume', previous: stopped });
  assert.equal(resumed.status, 'resume_ready');
  assert.equal(resumed.execution.started, false);
  assert.throws(() => mod.createDryRunState(snapshot(null),
    { command: 'resume', previous: stopped }), /no longer/);
  assert.throws(() => mod.createDryRunState(snapshot({ ...issue, number: 205 }),
    { command: 'resume', previous: stopped }), /no longer/);
});

test('resume fails closed at attempt, duration, and zero-cost limits', () => {
  const planned = mod.createDryRunState(snapshot(issue));
  const stopped = mod.createDryRunState(snapshot(issue), { command: 'stop', previous: planned });
  assert.throws(() => mod.createDryRunState(snapshot(issue), { command: 'resume',
    previous: { ...stopped, usage: { ...stopped.usage, attempts: 1 } } }), /attempt limit/);
  assert.throws(() => mod.createDryRunState(snapshot(issue), { command: 'resume',
    previous: { ...stopped, usage: { ...stopped.usage, elapsed_minutes: 5 } } }), /duration limit/);
  assert.throws(() => mod.createDryRunState(snapshot(issue), { command: 'resume',
    previous: { ...stopped, usage: { ...stopped.usage, cost_usd: 0.01 } } }), /cost limit/);
});

test('tampered or cross-repository state is rejected', () => {
  const planned = mod.createDryRunState(snapshot(issue));
  assert.throws(() => mod.createDryRunState(snapshot(issue),
    { command: 'resume', previous: { ...planned, status: 'stopped', repository: 'other/repo' } }),
    /repository mismatch/);
  assert.throws(() => mod.createDryRunState(snapshot(issue),
    { command: 'stop', previous: { issue } }), /unsupported/);
  assert.throws(() => mod.createDryRunState(snapshot(issue),
    { command: 'stop', previous: { ...planned, usage: { attempts: -1 } } }), /non-negative/);
});

