#!/usr/bin/env node
// Manual, single-repository planning controller. It never starts a coding worker.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildSnapshot } from './dev-resume.mjs';

const REPOSITORY = 'b-w-hiroki/shinso-gacha';
const COMMANDS = new Set(['plan', 'stop', 'resume']);
const STATE_STATUSES = new Set(['planned', 'stopped', 'resume_ready']);
const SHA = /^[0-9a-f]{40}$/;
const LIMITS = Object.freeze({
  max_duration_minutes: 5,
  max_attempts: 1,
  max_cost_usd: 0,
  max_issues: 1
});

function finiteNonnegative(value, name) {
  if (!Number.isFinite(value) || value < 0) throw new Error(name + ' must be non-negative');
  return value;
}

function validatePrevious(previous, repository) {
  if (!previous || typeof previous !== 'object' || Array.isArray(previous)) {
    throw new Error('previous state is required');
  }
  if (previous.schema_version !== 1 || previous.controller !== 'autodev-dry-run') {
    throw new Error('unsupported previous state');
  }
  if (previous.repository !== repository || repository !== REPOSITORY) {
    throw new Error('previous state repository mismatch');
  }
  if (!STATE_STATUSES.has(previous.status) || !SHA.test(previous.main_sha || '')) {
    throw new Error('invalid previous state');
  }
  if (!Number.isSafeInteger(previous.issue?.number) || previous.issue.number < 1) {
    throw new Error('previous state issue missing');
  }
  return previous;
}

function baseState(snapshot, now, command) {
  return {
    schema_version: 1,
    controller: 'autodev-dry-run',
    repository: snapshot.repository,
    command,
    observed_at: now.toISOString(),
    main_sha: snapshot.main_sha,
    limits: { ...LIMITS },
    usage: {
      attempts: 0,
      elapsed_minutes: 0,
      cost_usd: 0,
      cost_source: 'unavailable-no-executor'
    },
    issue: null,
    run_key: null,
    status: 'triage_required',
    reason: 'No explicitly approved issue is eligible.',
    execution: {
      enabled: false,
      started: false,
      isolated_environment_created: false,
      tests_started: false,
      pull_request_created: false,
      automatic_merge: false
    }
  };
}

export function createDryRunState(snapshot, options = {}) {
  if (!snapshot || snapshot.repository !== REPOSITORY || !SHA.test(snapshot.main_sha || '')) {
    throw new Error('dry-run is restricted to ' + REPOSITORY + ' with an immutable main SHA');
  }
  const command = options.command || 'plan';
  if (!COMMANDS.has(command)) throw new Error('command must be plan, stop, or resume');
  const now = options.now instanceof Date ? options.now : new Date();
  if (Number.isNaN(now.valueOf())) throw new Error('invalid current time');
  const state = baseState(snapshot, now, command);
  const selected = snapshot.queue?.selected || null;

  if (command === 'plan') {
    if (!selected) return state;
    state.issue = { number: selected.number, title: selected.title, url: selected.url };
    state.run_key = snapshot.repository + '#issue-' + selected.number + '@' + snapshot.main_sha;
    state.status = 'planned';
    state.reason = 'Eligible issue reserved for inspection only; no coding worker exists.';
    return state;
  }

  const previous = validatePrevious(options.previous, snapshot.repository);
  state.issue = { ...previous.issue };
  state.run_key = previous.run_key;
  state.usage.attempts = finiteNonnegative(previous.usage?.attempts ?? 0, 'attempts');
  state.usage.elapsed_minutes = finiteNonnegative(
    previous.usage?.elapsed_minutes ?? 0, 'elapsed_minutes');
  state.usage.cost_usd = finiteNonnegative(previous.usage?.cost_usd ?? 0, 'cost_usd');

  if (command === 'stop') {
    state.status = 'stopped';
    state.reason = 'Stopped by an explicit manual command; execution remains disabled.';
    return state;
  }

  if (previous.status !== 'stopped') throw new Error('resume requires a stopped state');
  if (!selected || selected.number !== previous.issue.number) {
    throw new Error('resume target is no longer the single eligible issue');
  }
  if (state.usage.attempts >= LIMITS.max_attempts) throw new Error('attempt limit reached');
  if (state.usage.elapsed_minutes >= LIMITS.max_duration_minutes) {
    throw new Error('duration limit reached');
  }
  if (state.usage.cost_usd > LIMITS.max_cost_usd) throw new Error('cost limit reached');
  state.issue = { number: selected.number, title: selected.title, url: selected.url };
  state.status = 'resume_ready';
  state.reason = 'Resume guard passed for the same issue; execution remains disabled.';
  return state;
}

async function parsePrevious(args) {
  const index = args.indexOf('--previous');
  if (index >= 0) {
    if (!args[index + 1]) throw new Error('--previous requires a path');
    return JSON.parse(await readFile(args[index + 1], 'utf8'));
  }
  if (process.env.AUTODEV_PREVIOUS_STATE_JSON) {
    return JSON.parse(process.env.AUTODEV_PREVIOUS_STATE_JSON);
  }
  return undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf('--output');
  if (outputIndex < 0 || !args[outputIndex + 1]) throw new Error('--output is required');
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const command = process.env.AUTODEV_COMMAND || 'plan';
  if (repository !== REPOSITORY) throw new Error('repository is not allowlisted');
  async function api(path) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) headers.Authorization = 'Bearer ' + token;
    const response = await fetch('https://api.github.com' + path, {
      headers,
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) throw new Error('GitHub API status ' + response.status + ' for ' + path);
    return response.json();
  }
  const snapshot = await buildSnapshot(repository, api);
  const state = createDryRunState(snapshot, { command, previous: await parsePrevious(args) });
  await writeFile(args[outputIndex + 1], JSON.stringify(state, null, 2) + '\n', 'utf8');
  console.log('Autodev dry-run: ' + state.status + '; execution_started=false');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    console.error('Autodev dry-run failed:', error.message);
    process.exitCode = 1;
  });
}

