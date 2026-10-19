const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');

const dir=path.resolve('docs');
const required=[
 'INDEX.md','CURRENT-SPEC.md','SYSTEM-ARCHITECTURE.md','EXPERIENCE-DESIGN.md',
 'ASSET-PRODUCTION-WORKFLOW.md','DEVELOPMENT-WORKFLOW.md','QA-RELEASE-CHECKLIST.md',
 'REUSABLE-PLAYBOOK.md','IMPLEMENTATION-AUDIT-2026-10-11.md','SPEC-DESIGN-WORKFLOW.md'
];
for(const name of required){
 const filename=path.join(dir,name);
 assert(fs.existsSync(filename),'Missing documentation: '+name);
 const text=fs.readFileSync(filename,'utf8');
 assert(text.startsWith('# '),'Document must have a title: '+name);
 assert(text.trim().length>500,'Document is too short: '+name);
 for(const [,destination] of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){
  if(/^(?:https?:|mailto:|#)/.test(destination))continue;
  const target=destination.split('#')[0].split('?')[0];
  if(target)assert(fs.existsSync(path.resolve(dir,target)),name+' has broken local link: '+destination);
 }
}
const main=fs.readFileSync('index.html','utf8');
const obs=fs.readFileSync('assets/observation.js','utf8');
const person=fs.readFileSync('assets/personnel-discrepancies-model.js','utf8');
assert(main.includes('const RANK_NEED = [0, 10, 25'),'Rank progression is missing');
assert(main.includes('const CLEARANCE_BANDS = ['),'Rank/clearance bands are missing');
assert(main.includes('shinso_gacha_state_v1'),'Save compatibility key is missing');
assert(obs.includes('const WATCH_AUTOMATION_AVAILABLE=true'),'Update docs if observation automation policy changes');
assert(person.includes('const CASES=['),'Personnel record specification needs review');
assert(fs.existsSync('.github/workflows/smoke.yml'),'CI workflow missing');
const index=fs.readFileSync('docs/INDEX.md','utf8');
for(const name of required.slice(1))assert(index.includes(name),'Documentation index omits '+name);
console.log('Documentation contract: files, links, rank/save/automation anchors passed');
