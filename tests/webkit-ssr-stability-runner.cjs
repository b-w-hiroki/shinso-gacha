const assert=require('node:assert/strict');
(async()=>{
 const {plan,rarities,runTrials}=await import('../scripts/webkit-ssr-stability.mjs');
 assert.deepEqual(rarities,[0,1,2,3,3,3,3]);
 for(const mode of ['photo','dash']){
  const expected=plan(mode);
  assert.equal(expected.length,10);
  assert.deepEqual(expected.filter(x=>x.kind==='lowlight').map(x=>x.attempt),[1,2,3]);
  assert.deepEqual(expected.filter(x=>x.kind==='photo').map(x=>x.rarity),[0,1,2,3,3,3,3]);
  let invoked=0,recorded=0;
  const outcome=await runTrials(mode,async trial=>{
   invoked++;
   if(invoked===2)throw Error('browser crash');
   return {ok:true,exitCode:0,durationMs:10};
  },(entry,rows)=>{recorded++;assert.equal(rows.length,recorded);});
  assert.equal(invoked,10,'early crash must not suppress later trials');
  assert.equal(recorded,10,'each trial must emit an independent record');
  assert.equal(outcome.failed,1,'later successes must not erase first failure');
  assert.equal(outcome.passed,9);
  assert.match(outcome.rows[1].error,/browser crash/);
  assert.equal(outcome.rows[9].ok,true);
  const failing=await runTrials(mode,async()=>({ok:false,exitCode:137,signal:'SIGKILL'}));
  assert.equal(failing.failed,10);
  assert.equal(failing.rows[0].exitCode,137);
 }
 const usage={availableKb:2000000,cgroupBytes:120000000,webkitProcesses:1,webkitRssKb:12345,cgroupLimitBytes:500000000,cgroupOomKills:2};
 const measured=await runTrials('photo',async()=>({ok:true,exitCode:0,usageBefore:usage,usageAfter:usage,oomKillsDelta:0}));
 assert.deepEqual(measured.rows[0].usageBefore,usage,'trial preserves resource baseline');
 assert.deepEqual(measured.rows[9].usageAfter,usage,'trial preserves after-run resource count');
 assert.equal(measured.rows[0].oomKillsDelta,0,'zero OOM events must be retained');
 const oom=await runTrials('photo',async()=>({ok:false,exitCode:null,signal:'SIGKILL',oomKillsDelta:1}));
 assert.equal(oom.failed,10);
 assert.equal(oom.rows[0].oomKillsDelta,1,'OOM evidence must survive on failed trials');
 assert.throws(()=>plan('vision'),/photo or dash/);
 console.log('WebKit SSR run recorder: ten independent trials, no masked failures, full accounting passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
