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
console.log('GitHub pilot task/decision/bug forms, PR template and resume pointers verified.');
