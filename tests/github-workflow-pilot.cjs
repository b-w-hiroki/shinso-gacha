const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=file=>fs.readFileSync(path.join(root,file),'utf8');

const cases=[
 ['.github/ISSUE_TEMPLATE/task.yml',['目的・ユーザー価値','Done条件','判断主体','- [ ]']],
 ['.github/ISSUE_TEMPLATE/decision.yml',['決めたいこと・その理由','選択肢・メリット・リスク','決定者','Decision状態','pending']],
 ['.github/ISSUE_TEMPLATE/investigation.yml',['再現手順','証拠（main SHA','Done条件','初回失敗']],
 ['.github/pull_request_template.md',['Refs #','Fixes','未完了','mainマージ後']]
];
for(const [file,terms] of cases){
 const data=load(file);
 for(const needle of terms)assert(data.includes(needle),file+' lacks '+needle);
}
const policy=load('docs/GITHUB-WORKFLOW-PILOT.md');
assert(policy.includes('状態：pilot'),'pilot must never be implied adopted');
assert(policy.includes('studio-playbook'),'shared contract referenced');
assert(policy.includes('手動ブラウザ・スクリーンショットQAは省略'),
 'manual QA opt-out should not disable automatic QA');
const resume=load('docs/AI-RESUME.md');
assert(resume.includes('GITHUB-WORKFLOW-PILOT.md'),'resume entrypoint should expose pilot');
assert(resume.includes('[Decision]'),'resume should surface decisions');
const workflow=load('.github/workflows/dev-resume-context.yml');
assert(workflow.includes('node --test tests/dev-resume.cjs'));
const dryRun=load('.github/workflows/autodev-dry-run.yml');
for(const term of ['workflow_dispatch:','permissions:','contents: read','timeout-minutes: 5',
  'cancel-in-progress: false','tests/autodev-dry-run.cjs','autodev-state-${{ github.run_id }}',
  'unauthenticated input','excludes GitHub Actions runner']){
  assert(dryRun.includes(term),'dry-run workflow lacks '+term);
}
assert(!dryRun.includes('pull-requests: write'),'dry-run must not create PRs');
assert(!dryRun.includes('issues: write'),'dry-run must not mutate Issues');
const dryRunDoc=load('docs/AUTODEV-DRY-RUN.md');
for(const term of ['実行器も費用計測器もない','未実装（実装済みと扱わない）',
  'autopilot:ready','stop/resume','未認証の入力','main SHA更新',
  'GitHub Actionsのrunner利用','workflow自体はdefault branchに未導入のため未実行']) {
  assert(dryRunDoc.includes(term),'dry-run doc lacks '+term);
}
console.log('GitHub pilot task/decision/bug forms, PR template and resume pointers verified.');
