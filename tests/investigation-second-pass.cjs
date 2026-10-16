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

// Third stage: confronting a colleague with the recheck.
const confrontSeen=new Set();
for(const mode of cases)for(let rarity=0;rarity<=3;rarity++){
 const key=mode+':'+rarity,read={[key]:true},discussed={[key]:true};
 assert.equal(context.investigationConfrontLine(key,read,discussed,{}),null,key+' unconfronted reply stays hidden');
 assert.equal(context.investigationConfrontLine(key,{},discussed,{[key]:true}),null,key+' needs a read record even with a stale flag');
 assert.equal(context.investigationConfrontLine(key,read,{},{[key]:true}),null,key+' needs prior testimony');
 const line=context.investigationConfrontLine(key,read,discussed,{[key]:true});
 assert(typeof line==='string'&&line.length>=25,key);
 assert(!seen.has(line)&&!confrontSeen.has(line),key+' confrontation must be unique');
 confrontSeen.add(line);
}
assert.equal(confrontSeen.size,16);
assert.equal(context.investigationConfrontLine('cctv:1',{'cctv:1':true},{'cctv:1':true},{'cctv:1':'true'}),null,'string flags are not confrontations');
assert.equal(context.investigationConfrontLine('__proto__:1',{},{},{'__proto__:1':true}),null);
const cues=new Set([0,1,2,3].map(n=>context.investigationConfrontCue('equipment',Object.fromEntries(['vision:0','vision:1','dash:0','dash:1'].slice(0,n).map(k=>[k,true])))));
assert.equal(cues.size,3,'unease escalates over three steps per colleague');
assert.equal(context.investigationConfrontCue('records',{'vision:0':true,'dash:1':true}),context.investigationConfrontCue('records',{}),'other colleagues do not escalate');
assert.equal(context.investigationLatestRecheck(state,{...progress,confronted:{'dash:2':true}}),'photo:1','home skips finished confrontations');
assert.equal(context.investigationLatestRecheck(state,{...progress,confronted:{'dash:2':true,'photo:1':true}}),null,'nothing left to recheck');
const log=context.investigationTestimonyLog('records',
 {collection:{'cctv:0':true,'cctv:1':true,'cctv:2':true,'photo:0':true}},
 {read:{'cctv:0':true,'cctv:1':true,'cctv:2':true,'photo:0':true},discussed:{'cctv:1':true,'cctv:2':true,'photo:0':true},confronted:{'cctv:2':true}});
assert.equal(log.map(x=>x.key).join(),'cctv:1,cctv:2','history lists only this colleague’s heard testimony');
assert.equal(log[0].confront,null);assert.equal(typeof log[1].confront,'string');
assert.equal(context.investigationTestimonyLog('records',{collection:{'cctv:1':false}},{read:{'cctv:1':true},discussed:{'cctv:1':true}}).length,0,'uncollected testimony never leaks');
assert(source.includes('data-trail="confront"'),'record should offer the confrontation');

console.log('16 unique acquired-only second-pass contradictions and 16 earned-only confrontations.');
