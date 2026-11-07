import assert from 'node:assert/strict';
import {expectedGroups,summarize,markdown} from '../scripts/webkit-stability-summary.mjs';
const fixtures=()=>Object.fromEntries(expectedGroups().map(g=>[g.name,{schema:1,sha:'abc',runId:'123',attempt:'1',mode:g.mode,order:g.order,isolatedIndex:g.index,status:'passed',rows:g.trials.map(t=>({...t,mode:g.mode,ok:true}))}]));
const run=x=>summarize(n=>x[n],'abc','123','1');
let data=fixtures(),s=run(data);
assert.equal(s.expected,60);assert.equal(s.passed,60);assert.equal(s.status,'passed');assert.equal(s.groups.length,24);
delete data['isolated-dash-3'];s=run(data);assert.equal(s.incomplete,1);assert.equal(s.failed,0);assert.equal(s.status,'incomplete');
data=fixtures();data['webkit-stability-photo-baseline'].rows.splice(3);s=run(data);assert.equal(s.incomplete,7);
data=fixtures();data['isolated-photo-4'].rows[0].ok=false;s=run(data);assert.equal(s.failed,1);assert.equal(s.passed,59);
delete data['isolated-dash-3'];s=run(data);assert.equal(s.failed,1);assert.equal(s.incomplete,1);assert.equal(s.status,'failed');
for(const field of ['sha','runId','attempt']) {data=fixtures();data['webkit-stability-photo-baseline'][field]='stale';assert.equal(run(data).incomplete,10);}
data=fixtures();data['isolated-photo-4'].rows.push(data['isolated-photo-4'].rows[0]);assert.equal(run(data).incomplete,1);
data=fixtures();data['isolated-photo-4'].rows[0].ok='true';assert.equal(run(data).incomplete,1);
data=fixtures();data['isolated-photo-4'].rows[0].rarity=3;assert.equal(run(data).incomplete,1);
s=summarize(()=>{throw Error('bad JSON');},'abc','123','1');assert.equal(s.incomplete,60);assert.equal(s.passed,0);
assert.match(markdown(s),/not independent workflow runs/);
console.log('WebKit coverage: missing, partial, stale, duplicate and failed evidence remain distinct');
