import {readFileSync, existsSync, writeFileSync, appendFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {plan} from './webkit-ssr-stability.mjs';

export function expectedGroups() {
 return ['photo','dash'].flatMap(mode => [
  ...['baseline','ssr-first'].map(order => ({name:`webkit-stability-${mode}-${order}`,mode,order,index:null,trials:plan(mode,order)})),
  ...Array.from({length:10},(_,i)=>({name:`isolated-${mode}-${i+1}`,mode,order:'baseline',index:String(i+1),trials:[plan(mode)[i]]}))
 ]);
}
// Count missing evidence separately. A cancelled job is not a proven product failure.
export function summarize(read, sha, runId, attempt) {
 const groups=expectedGroups().map(group=>{
  let data; try { data=read(group.name); } catch { data=null; }
  const valid=data?.schema===1 && data.sha===sha && String(data.runId)===String(runId)
   && String(data.attempt)===String(attempt) && data.mode===group.mode && data.order===group.order
   && (data.isolatedIndex??null)===group.index && Array.isArray(data.rows);
  const rows=valid?data.rows:[];
  let passed=0,failed=0,incomplete=0;
  for(const trial of group.trials){
   const matches=rows.filter(row=>row.mode===group.mode&&row.kind===trial.kind&&row.attempt===trial.attempt&&row.rarity===trial.rarity);
   if(matches.length!==1 || typeof matches[0].ok!=='boolean') incomplete++;
   else if(matches[0].ok) passed++; else failed++;
  }
  return {name:group.name,expected:group.trials.length,passed,failed,incomplete,evidence:valid?'matched':'missing-or-invalid'};
 });
 const total=groups.reduce((a,g)=>({expected:a.expected+g.expected,passed:a.passed+g.passed,failed:a.failed+g.failed,incomplete:a.incomplete+g.incomplete}),{expected:0,passed:0,failed:0,incomplete:0});
 return {schema:1,sha,runId:String(runId),attempt:String(attempt),...total,status:total.failed?'failed':total.incomplete?'incomplete':'passed',groups};
}
export function markdown(s){
 return ['## WebKit trial coverage',`Commit: ${s.sha}`,`Expected ${s.expected}; passed ${s.passed}; failed ${s.failed}; incomplete ${s.incomplete}.`,
 'Missing/cancelled evidence is not a browser failure and is never counted as a pass. These are trial counts, not independent workflow runs.',
 '| Group | Passed | Failed | Incomplete |','|---|---:|---:|---:|',...s.groups.map(g=>`| ${g.name} | ${g.passed} | ${g.failed} | ${g.incomplete} |`),''].join('\n');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const [dir,sha,runId,attempt]=process.argv.slice(2);
 if(!dir||!sha||!runId||!attempt) throw Error('usage: node scripts/webkit-stability-summary.mjs ARTIFACT_DIR SHA RUN_ID ATTEMPT');
 const summary=summarize(name=>{const p=join(dir,name,'results.json');return existsSync(p)?JSON.parse(readFileSync(p,'utf8')):null;},sha,runId,attempt);
 writeFileSync('webkit-stability-summary.json',JSON.stringify(summary,null,2)+'\n');
 const report=markdown(summary); process.stdout.write(report);
 if(process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,report);
 if(summary.status!=='passed') process.exitCode=1;
}
