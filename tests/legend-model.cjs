const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),M=require('../assets/legend-model');
const ctx=vm.createContext({document:{addEventListener(){}}});vm.runInContext(fs.readFileSync('assets/incursions.js','utf8'),ctx);
const profile=k=>vm.runInContext(`incursionProfile(${k})`,ctx);
assert.equal(M.ids.length,12);
for(const id of M.ids){
 const c=M.CASES[id];assert.equal(c.fragments.length,3);assert.equal(new Set(c.fragments.map(f=>f[1])).size,3);
 const levels={[id]:2};let s=M.state({},levels);assert.equal(M.start(s,levels,id),false);
 levels[id]=3;assert(M.start(s,levels,id));assert.equal(M.evidence(id,{}, {},profile),null);
 const proof=M.evidence(id,{[c.mode+':0']:1},{},profile);assert(proof);
 assert.equal(M.conclude(s,levels,id,0,proof),false);s.testified[id]=true;
 assert.equal(M.conclude(s,levels,id,3,proof),false);assert.equal(M.conclude(s,levels,id,0,null),false);
 assert(M.conclude(s,levels,id,0,proof));assert.equal(M.conclude(s,levels,id,1,proof),false);
 s=M.state(JSON.parse(JSON.stringify(s)),levels);assert.equal(s.active,id);assert.equal(s.conclusions[id],0);
 assert(M.ids.includes(id));assert.equal(M.count({[id]:5},id),3);
}
for(let k=0;k<100;k++)assert(M.ids.some(id=>M.related(id,k,profile)),`unlinked case ${k}`);
assert.equal(M.count({constructor:5},'constructor'),0);
assert.deepEqual(M.state({active:'unknown',testified:{u1:true},conclusions:{u1:0}},{u1:1}),{active:null,testified:{},conclusions:{}});
console.log('12 dossiers × 3 fragments, old-save levels, investigation gates, proof/witness/conclusion, persistence and all 100 links passed');
