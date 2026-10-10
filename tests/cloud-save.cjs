const assert=require('node:assert/strict'),C=require('../assets/cloud-save');
(async()=>{
 let saved=null,writes=0;
 const transaction=async fn=>{for(let attempt=0;attempt<5;attempt++){
  const before=saved&&JSON.parse(JSON.stringify(saved));let pending;
  const result=await fn({get:async()=>({exists:()=>!!before,data:()=>before}),set:(_,data)=>pending=data});
  if((saved?.revision||0)!==(before?.revision||0))continue;
  if(pending){saved=pending;writes++;}return result;
 }throw Error('too many retries');};
 const a={currency:110,rewardClaimed:true},b={currency:110,rewardClaimed:true};
 const outcomes=await Promise.allSettled([C.commit(transaction,'user',0,a),C.commit(transaction,'user',0,b)]);
 assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(outcomes.find(r=>r.status==='rejected').reason.code,'save-conflict');
 assert.equal(writes,1);assert.equal(saved.state.currency,110);assert.equal(saved.revision,1);
 assert.deepEqual(a,{currency:110,rewardClaimed:true});
 await assert.rejects(C.commit(transaction,'user',0,{currency:999}),e=>e.code==='save-conflict');assert.equal(saved.state.currency,110);
 const next=await C.commit(transaction,'user',1,{...a,currency:120});assert.equal(next,2);
 await assert.rejects(C.commit(async()=>{throw {code:'unavailable'};},'user',2,a),e=>e.code==='unavailable');assert.equal(saved.revision,2);
 saved={state:{currency:20}};assert.equal(await C.commit(transaction,'user',0,{currency:30}),1,'legacy save migrates once');
 await assert.rejects(C.commit(transaction,'user',null,a),e=>e.code==='save-uninitialized');
 const refs={user:saved,scout:{total:5}};
 const eraseTx=async fn=>{const draft=JSON.parse(JSON.stringify(refs));await fn({get:async ref=>({exists:()=>!!draft[ref],data:()=>draft[ref]}),set:(ref,data)=>{draft[ref]=data;},delete:ref=>{delete draft[ref];}});for(const k of Object.keys(refs))delete refs[k];Object.assign(refs,draft);};
 await C.erase(eraseTx,'user','scout');assert.deepEqual(refs.user.state,{accountDeleted:true});assert(!refs.scout);
 const erased=JSON.stringify(refs);await C.erase(eraseTx,'user','scout');assert.equal(JSON.stringify(refs),erased);
 saved=refs.user;await assert.rejects(C.commit(transaction,'user',saved.revision,a),e=>e.code==='account-deleted');
 console.log('Account tombstone, idempotent erasure, resurrection protection; concurrent CAS, stale revisions, duplicate claim isolation, retry, offline failure and legacy migration passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
