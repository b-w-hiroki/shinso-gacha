const assert=require('node:assert/strict'),M=require('../assets/uncanny-archive-model');
let s=M.state({}, {u1:3,u2:3});
assert.equal(M.events('u3',0,{},false),null,'unowned mystery hidden');
for(const count of [undefined,NaN,0,null,-1,Infinity,'3',3.5,true]){
 assert.equal(M.events('u1',count,{noticed:true,compared:true},true),null,'invalid fragment count cannot expose event');
}
assert.equal(M.events('u1',3,{noticed:'true',compared:'true'},'true').letter,false,'string flags are not proof');
assert.equal(M.events('u1',1,{noticed:true,compared:true},true).reopened,false,'one fragment cannot reopen a case');
assert.equal(M.events('u1',1,{},false).letter,false);
for(let n=1;n<=12;n++){
 const id='u'+n,level=3,base=M.events(id,level,{noticed:true,compared:true},true);
 assert(base&&typeof base.missing==='boolean');
 assert.deepEqual(base,M.events(id,level,{noticed:true,compared:true},true),'deterministic without rerolls');
 assert(!M.events(id,level,{noticed:false,compared:false},false).letter);
}
assert.equal(M.record(s,'u1','reads',true),true);
assert.equal(M.record(s,'u1','reads',true),false,'no repeat reward');
assert.equal(M.record(s,'u2','letters',false),false,'locked stays locked');
const restored=M.state(JSON.parse(JSON.stringify(s)),{u1:3,u2:3});
assert.equal(restored.reads.u1,true);
const locked=M.state(JSON.parse(JSON.stringify(s)),{u1:0,u2:3});
assert.equal(locked.reads.u1,undefined,'legacy state cannot unlock without source dossier');
assert.equal(M.record(locked,'u2','__proto__',true),false);
assert.equal(M.record(locked,'u13','reads',true),false,'unknown dossier cannot write progress');
assert.equal(M.record(locked,'__proto__','reads',true),false,'inherited object key cannot be saved');
assert.equal(M.record({},'u1','reads',true),false,'unnormalized containers cannot be mutated');
assert.equal(M.record(locked,'u2','reads','true'),false,'only explicit eligibility writes');
console.log('v1.2 archive gates, deterministic hints, save migration and idempotence passed');