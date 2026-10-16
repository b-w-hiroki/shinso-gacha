const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/investigation.js'),'utf8');
const context={document:{addEventListener(){}},console};
vm.createContext(context);
vm.runInContext(source,context);
const cases=['cctv','photo','vision','dash'];
const seen=new Set();
for(const mode of cases){
 for(let rarity=0;rarity<=3;rarity++){
  const key=mode+':'+rarity,read={[key]:true},discussed={[key]:true};
  const line=context.investigationRecheckLine(key,read,discussed);
  assert.equal(typeof line,'string',key);
  assert(line.length>=20,key+' should convey a real contradiction');
  assert(!seen.has(line),key+' must have a unique follow-up');
  seen.add(line);
  assert.equal(context.investigationRecheckLine(key,{},discussed),null,'unread evidence must be hidden');
  assert.equal(context.investigationRecheckLine(key,read,{}),null,'undiscussed evidence must be hidden');
 }
}
for(const key of ['dash:4','cctv:-1','__proto__:1','photo:abc',null,undefined]){
 assert.equal(context.investigationRecheckLine(key,{},{}),null);
}
assert.equal(seen.size,16);

// A witness follow-up must be discoverable without opening every album entry.
const state={
 collection:{'photo:1':true,'dash:2':true,'vision:0':false},
 history:[{mode:'photo',rarity:1},{mode:'dash',rarity:2},{mode:'vision',rarity:0}]
};
const progress={read:{'photo:1':true,'dash:2':true},discussed:{'photo:1':true,'dash:2':true}};
assert.equal(context.investigationLatestRecheck(state,progress),'dash:2',
 'most recent earned recheck should be surfaced');
assert.equal(context.investigationLatestRecheck(state,{read:{'dash:2':true},discussed:{}}),null,
 'no discussion means no recheck');
assert.equal(context.investigationLatestRecheck({collection:{'photo:1':false},history:[]},progress),null,
 'uncollected evidence must not leak');
assert.equal(context.investigationLatestRecheck({collection:{'photo:1':true},history:[]},progress),'photo:1',
 'legacy saves without history still support acquired rechecks');
assert(source.includes('data-trail="recheck"'),'home should offer the recheck action');
assert(source.includes("action==='recheck'"),'recheck action should open an earned record');

console.log('16 unique acquired-only second-pass contradictions; no new save state.');
