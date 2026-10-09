import fs from 'node:fs';
import assert from 'node:assert/strict';
const yaml=fs.readFileSync('.github/workflows/cleanup-merged-branches.yml','utf8');
const script=yaml.split('          script: |\n')[1].split('\n').map(l=>l.replace(/^            /,'')).join('\n');
const run=new (Object.getPrototypeOf(async function(){}).constructor)('github','context','core',script);
const repo={full_name:'test/game',default_branch:'main'};
const pr=(name,extra={})=>({number:1,merged_at:'2026-10-09',head:{ref:name,sha:'merged',repo},base:{ref:'main'},...extra});
async function check(candidate,{sha='merged',protectedBranch=false,open=[],refSha=sha,error=null}={}){
 const deleted=[];const list=()=>{};
 const github={paginate:async()=>open,rest:{repos:{get:async()=>({data:repo}),getBranch:async()=>{if(error)throw {status:error};return {data:{protected:protectedBranch,commit:{sha}}};}},pulls:{list},git:{getRef:async()=>({data:{object:{sha:refSha}}}),deleteRef:async x=>deleted.push(x.ref)}}};
 await run(github,{repo:{owner:'test',repo:'game'},eventName:'pull_request_target',payload:{pull_request:candidate}},{info(){},warning(){}});return deleted;
}
assert.deepEqual(await check(pr('feat/done')),['heads/feat/done']);
for(const name of ['main','master','develop','staging','production','release/1.0'])assert.deepEqual(await check(pr(name)),[]);
for(const options of [{sha:'new-work'},{protectedBranch:true},{refSha:'raced-new-work'},{error:404},{error:403},{error:422},{open:[pr('feat/done')]},{open:[pr('other',{base:{ref:'feat/done'}})]}])assert.deepEqual(await check(pr('feat/done'),options),[]);
assert.deepEqual(await check(pr('feat/done',{merged_at:null})),[]);
assert.deepEqual(await check(pr('feat/done',{base:{ref:'develop'}})),[]);
assert.deepEqual(await check(pr('feat/done',{head:{ref:'feat/done',sha:'merged',repo:{full_name:'fork/game'}}})),[]);
assert(!yaml.includes('actions/checkout'));assert(yaml.includes('types: [closed]'));
console.log('Cleanup preserves protected/default/environment, changed, dependent, fork and unmerged branches');
// Installation/manual sweeps use closed PRs, deduplicate heads and keep a reused head.
for(const eventName of ['push','workflow_dispatch']){
 const deleted=[],list=()=>{};
 const candidates=[pr('feat/old',{number:2}),pr('feat/old'),pr('feat/reused',{merged_at:null}),pr('feat/reused'),pr('release/1')];
 const github={paginate:async(fn,args)=>args.state==='closed'?candidates:[],rest:{repos:{get:async()=>({data:repo}),getBranch:async()=>({data:{protected:false,commit:{sha:'merged'}}})},pulls:{list},git:{getRef:async()=>({data:{object:{sha:'merged'}}}),deleteRef:async x=>deleted.push(x.ref)}}};
 await run(github,{repo:{owner:'test',repo:'game'},eventName,payload:{}},{info(){},warning(){}});
 assert.deepEqual(deleted,['heads/feat/old']);
}
console.log('Initial installation and manual sweeps deduplicate and preserve reused branches');
