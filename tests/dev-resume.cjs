const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');
const repo='b-w-hiroki/shinso-gacha',sha='1'.repeat(40);
let mod;
test.before(async()=>{mod=await import(pathToFileURL(resolve(__dirname,'../scripts/dev-resume.mjs')).href);});
function fake({issues=[],pulls=[],runs=[],drift=false}={}){
 let reads=0;
 return async p=>{
  if(p.includes('/branches/main'))return {commit:{sha:++reads>1&&drift?'2'.repeat(40):sha}};
  if(p.includes('/issues?'))return issues;
  if(p.includes('/pulls?'))return pulls;
  if(p.includes('/actions/runs?'))return {workflow_runs:runs};
  throw Error('Unexpected '+p);
 };
}
test('SHA-matched CI, opt-in, blocking and secrecy',async()=>{
 const issue={number:15,state:'open',title:'P1: improve diagram',
  labels:[{name:'priority:p1'},{name:'autopilot:ready'}],
  body:'- [ ] rendered diagram\nprivate detail not for snapshot'};
 const run={name:'smoke',event:'push',head_sha:sha,status:'completed',
  conclusion:'success',run_attempt:2,html_url:'https://github.com/example/runs/1'};
 const s=await mod.buildSnapshot(repo,fake({issues:[issue,
  {number:75,state:'open',title:'公開前QA: 本番FirebaseとiPhone実機'}],
  runs:[{...run,head_sha:'f'.repeat(40),conclusion:'failure'},run]}),
  new Date('2026-10-13T05:00:00Z'));
 assert.equal(s.main_sha,sha);
 assert.equal(s.queue.selected.number,15);
 assert.equal(s.queue.human_required[0].number,75);
 assert.equal(s.main_checks[0].attempt,2);
 assert.equal(s.queue.execution_started,false);
 assert.equal(s.queue.automatic_merge,false);
 assert.ok(!JSON.stringify(s).includes('private detail'));
});
test('open PR locks issue and missing opt-in does not execute',async()=>{
 const issue={number:12,state:'open',title:'P0: repair image',
  labels:['autopilot:ready','priority:p0'],body:'- [ ] fixed'};
 const x=await mod.buildSnapshot(repo,fake({issues:[issue],
  pulls:[{number:11,title:'existing',body:'Fixes #12',head:{sha}}]}));
 assert.equal(x.queue.selected,null);
 assert.deepEqual(x.queue.blocked_by_open_pr,[12]);
 const y=await mod.buildSnapshot(repo,fake({issues:[{number:141,state:'open',
  title:'P0: WebKit instability',body:'- [ ] fix'}]}));
 assert.equal(y.queue.status,'triage_required');
 assert.equal(y.queue.suggested[0].number,141);
});
test('pilot resume separates Decisions, Epics and ready tasks without leaking private body',async()=>{
 const decision={number:182,state:'open',title:'[Decision] 採用する原本の方針',
  labels:[],body:'private option text; - [ ] still waiting'};
 const epic={number:89,state:'open',title:'真相ガチャ｜残タスク総覧・ロードマップ',
  labels:[],body:'- [ ] all tasks'};
 const task={number:183,state:'open',title:'P1: [Asset] 本番用の差分を統合',
  labels:[],body:'- [ ] images verified'};
 const s=await mod.buildSnapshot(repo,fake({issues:[decision,epic,task]}));
 assert.equal(s.queue.status,'triage_required');
 assert.equal(s.queue.selected,null);
 assert.deepEqual(s.queue.decisions_pending.map(x=>x.number),[182]);
 assert.deepEqual(s.queue.epic_context.map(x=>x.number),[89]);
 assert.deepEqual(s.queue.suggested.map(x=>x.number),[183]);
 assert.equal(s.project_v2.items_included,false);
 assert.equal(s.project_v2.access,'not_checked_by_this_snapshot');
 assert.ok(!JSON.stringify(s).includes('private option text'));
 const labeled={...decision,number:184,title:'選択',
  labels:[{name:'type:decision'},{name:'priority:p0'},{name:'autopilot:ready'}]};
 const s2=await mod.buildSnapshot(repo,fake({issues:[labeled,task]}));
 assert.equal(s2.queue.selected,null,
  'a Decision cannot receive execution rights solely from label opt-in');
 assert.deepEqual(s2.queue.suggested.map(x=>x.number),[183]);
});
test('pilot honors explicit Decision dependencies, never executes approved-by-label Decision',async()=>{
 const decide={number:200,state:'open',title:'[Decision] public roadmap view',
  labels:['priority:p0','autopilot:ready'],body:'Choose public/private'};
 const dependent={number:201,state:'open',title:'P0: [Task] create public view',
  labels:['priority:p0','autopilot:ready'],body:'- [ ] view exists\\nBlocked by Decision #200'};
 const independent={number:202,state:'open',title:'P1: [Task] audit sources',
  labels:['priority:p1','autopilot:ready'],body:'- [ ] audit CI success\\nRefs #200'};
 const s=await mod.buildSnapshot(repo,fake({issues:[decide,dependent,independent]}));
 assert.equal(s.queue.selected.number,202,'blocked P0 cannot outrank ready P1');
 assert.deepEqual(s.queue.decisions_pending.map(x=>x.number),[200]);
 assert.deepEqual(s.queue.blocked_by_decision.map(x=>({n:x.number,ids:x.pending_decisions})),
   [{n:201,ids:[200]}]);
 assert(!s.queue.suggested.some(x=>x.number===201));
 assert.equal(s.queue.execution_started,false);
 assert.ok(!JSON.stringify(s).includes('Choose public/private'));
 const settled=await mod.buildSnapshot(repo,fake({issues:[dependent,independent]}));
 assert.equal(settled.queue.selected.number,201,'no longer-open Decision releases explicit dependency');
});
test('rejects SHA race, invalid repo and truncated pages',async()=>{
 await assert.rejects(mod.buildSnapshot(repo,fake({drift:true})),/main advanced/);
 await assert.rejects(mod.buildSnapshot(repo,fake({issues:Array(100).fill({})})),/truncated/);
 await assert.rejects(mod.buildSnapshot('bad',fake()),/invalid repository/);
});
