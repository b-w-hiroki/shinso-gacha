/* Isolated WebKit stability trials. Never retry or hide a failing first run.
 * Each attempt executes the original real-pointer browser QA in a fresh Node process.
 * The aggregate fails when ANY attempt fails, even if later attempts pass. */
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
// Only aggregate machine resource figures are saved, never process command
// lines, environment secrets or device/account identifiers.
function systemUsage(){
 let availableKb=null,cgroupBytes=null,cgroupLimitBytes=null,cgroupOomKills=null,webkitProcesses=0,webkitRssKb=0;
 try{const m=readFileSync('/proc/meminfo','utf8').match(/^MemAvailable:\s*(\d+) kB/m);
  if(m)availableKb=Number(m[1]);}catch{}
 try{const n=Number(readFileSync('/sys/fs/cgroup/memory.current','utf8').trim());
  if(Number.isFinite(n))cgroupBytes=n;}catch{}
 try{const n=readFileSync('/sys/fs/cgroup/memory.max','utf8').trim();
  if(n!=='max'&&Number.isFinite(Number(n)))cgroupLimitBytes=Number(n);}catch{}
 try{const m=readFileSync('/sys/fs/cgroup/memory.events','utf8').match(/^oom_kill\s+(\d+)$/m);
  if(m)cgroupOomKills=Number(m[1]);}catch{}
 try{
  const ps=spawnSync('ps',['-eo','rss=,comm='],{encoding:'utf8',timeout:2500});
  if(ps.status===0)for(const line of ps.stdout.split('\n')){
   const row=line.trim().match(/^(\d+)\s+(.+)$/);
   if(row&&/WebKit|MiniBrowser|pw_run/i.test(row[2])){
    webkitProcesses++;webkitRssKb+=Number(row[1]);
   }
  }
 }catch{}
 return {availableKb,cgroupBytes,cgroupLimitBytes,cgroupOomKills,webkitProcesses,webkitRssKb};
}
// Extract only fixed diagnostic categories/stage names into the summary; full logs stay artifacts.
export function classifyTrial(output,exitCode,signal,oomKillsDelta){
 const stage=[...output.matchAll(/WEBKIT_STRESS_STAGE\\s+([a-z-]+:(?:photo|dash|cctv|vision):[0-3])/g)].at(-1)?.[1]??null;
 const crashed=/WEBKIT_PAGE_CRASH|Target page, context or browser has been closed|WEBKIT_BROWSER_DISCONNECTED/.test(output);
 const timedOut=/timed out|TimeoutError|ETIMEDOUT/i.test(output);
 const reason=oomKillsDelta!==null&&oomKillsDelta>0?'cgroup-oom':
  crashed?'webkit-page-closed':timedOut?'timeout':signal?'process-signal':exitCode===0?'passed':'other-failure';
 return {lastStage:stage,failureKind:reason};
}
export const rarities=Object.freeze([0,1,2,3,3,3,3]);
export function plan(mode){
 if(!['photo','dash'].includes(mode))throw new Error('WebKit stability requires photo or dash mode');
 return [
  ...[1,2,3].map(attempt=>({kind:'lowlight',attempt,rarity:null})),
  ...rarities.map((rarity,index)=>({kind:'photo',attempt:index+1,rarity}))
 ];
}
export async function runTrials(mode,execute,onResult=()=>{}){
 const rows=[];
 for(const trial of plan(mode)){
  let result;
  try{result=await execute({...trial,mode});}
  catch(err){result={ok:false,exitCode:null,error:String(err?.message||err)};}
  const item={...trial,mode,ok:result?.ok===true,exitCode:Number.isInteger(result?.exitCode)?result.exitCode:null,
   signal:result?.signal??null,error:result?.error??null,
   durationMs:Number.isFinite(result?.durationMs)?result.durationMs:null,
   usageBefore:result?.usageBefore??null,usageAfter:result?.usageAfter??null,
   oomKillsDelta:result?.oomKillsDelta??null,
   lastStage:result?.lastStage??null,failureKind:result?.failureKind??null};
  rows.push(item);
  await onResult(item,[...rows]);
 }
 return {mode,total:rows.length,passed:rows.filter(row=>row.ok).length,failed:rows.filter(row=>!row.ok).length,rows};
}
function runNodeTrial(trial,outputDir,index){
 const script=trial.kind==='lowlight'?'tests/observation-lowlight-isolated.cjs':'tests/observation-location-variants.cjs';
 const label=String(index).padStart(2,'0')+'-'+trial.kind+'-'+trial.attempt;
 const start=Date.now(),usageBefore=systemUsage();
 const child=spawnSync(process.execPath,[script],{
  cwd:root,env:{...process.env,DEBUG:[process.env.DEBUG,'pw:browser'].filter(Boolean).join(','),
   QA_WEBKIT:'1',QA_OBSERVATION_MODE:trial.mode,
   QA_SOURCE_ONLY:'1',QA_LOWLIGHT_ISOLATED:'1',
   ...(trial.rarity===null?{}:{QA_OBSERVATION_RARITY:String(trial.rarity)})},
  encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024
 });
 const usageAfter=systemUsage();
 const oomKillsDelta=usageBefore.cgroupOomKills===null||usageAfter.cgroupOomKills===null
  ?null:usageAfter.cgroupOomKills-usageBefore.cgroupOomKills;
 const classification=classifyTrial((child.stdout||'')+'\n'+(child.stderr||''),child.status,child.signal,oomKillsDelta);
 writeFileSync(join(outputDir,label+'.log'),
  'mode='+trial.mode+' kind='+trial.kind+' attempt='+trial.attempt+' rarity='+trial.rarity+
  '\nexit='+child.status+' signal='+child.signal+' error='+(child.error?.message||'')+
  '\nresource_before='+JSON.stringify(usageBefore)+'\nresource_after='+JSON.stringify(usageAfter)+
  '\nnew_cgroup_oom_kills='+String(oomKillsDelta)+
  '\n--- stdout ---\n'+(child.stdout||'')+'\n--- stderr ---\n'+(child.stderr||''));
 return {ok:child.status===0&&!child.error,exitCode:child.status,signal:child.signal,
  error:child.error?.message??null,durationMs:Date.now()-start,usageBefore,usageAfter,oomKillsDelta,...classification};
}
async function main(){
 const mode=process.env.QA_OBSERVATION_MODE;
 const dir=resolve(root,'docs/qa-webkit-stability');
 mkdirSync(dir,{recursive:true});
 const summary={schema:1,observedAt:new Date().toISOString(),sha:process.env.GITHUB_SHA||'unknown',
  runId:process.env.GITHUB_RUN_ID||'local',attempt:process.env.GITHUB_RUN_ATTEMPT||'1',
  mode,platform:'playwright-webkit',status:'incomplete',rows:[]};
 const persist=()=>writeFileSync(join(dir,'results.json'),JSON.stringify(summary,null,2)+'\n');
 persist();
 let index=0;
 const result=await runTrials(mode,trial=>runNodeTrial(trial,dir,++index),(row,rows)=>{
  summary.rows=rows;
  persist();
  process.stdout.write('WebKit '+row.mode+' '+row.kind+' #'+row.attempt+
   (row.rarity===null?'':' rarity='+row.rarity)+' '+(row.ok?'PASS':'FAIL')+
   ' duration='+row.durationMs+'ms'+(row.ok?'':' failure='+row.failureKind+' stage='+(row.lastStage||'unknown'))+'\n');
 });
 Object.assign(summary,{status:result.failed?'failed':'passed',total:result.total,
  passed:result.passed,failed:result.failed,completedAt:new Date().toISOString()});
 persist();
 process.stdout.write('WebKit '+mode+': '+result.passed+'/'+result.total+' first-attempt trials succeeded\n');
 if(result.failed)process.exitCode=1;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 main().catch(err=>{console.error(err);process.exitCode=1;});
}
