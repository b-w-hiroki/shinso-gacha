const assert=require('node:assert/strict'),Verso=require('../assets/photo-verso-model.js');
const modes=['cctv','photo','vision','dash'],notes=new Set();
for(const mode of modes){
 for(let rarity=0;rarity<=3;rarity++){
  assert.equal(Verso.inspect(mode,rarity,{rarities:{}}),null,'unearned rarity must be absent');
  assert.equal(Verso.inspect(mode,rarity,{rarities:{[rarity]:0}}),null);
  assert.equal(Verso.inspect(mode,rarity,{rarities:{[rarity]:-1}}),null);
  const note=Verso.inspect(mode,rarity,{rarities:{[rarity]:1}});
  assert(note&&note.title&&note.stamp&&note.lead&&note.trace);
  assert.equal(note.mode,mode);
  assert.equal(note.rarity,rarity);
  assert.equal(note.comparison,null,'normal source absent: no comparison copy');
  assert(!notes.has(note.title),'each of four sites and four rarities has distinct dossier title');
  notes.add(note.title);
  const confirmed=Verso.inspect(mode,rarity,{rarities:{[rarity]:1,0:1}});
  assert(confirmed);
  if(rarity>0){assert(confirmed.normalOwned&&confirmed.comparison,'earned normal original unlocks a distinct comparison');}
  else assert.equal(confirmed.comparison,null,'normal original has no future anomaly text');
  const snapshot={rarities:{[rarity]:1}};
  const saved=JSON.stringify(snapshot);
  assert.deepEqual(Verso.inspect(mode,rarity,snapshot),note);
  assert.equal(JSON.stringify(snapshot),saved,'projection never mutates save or adds rewards');
 }
}
for(const mode of ['__proto__','',null,'alt:photo','cctv2']){
 assert.equal(Verso.inspect(mode,1,{rarities:{1:1}}),null);
}
for(const rarity of [-1,4,NaN,'1']){
 assert.equal(Verso.inspect('photo',rarity,{rarities:{1:1,2:1,3:1}}),null);
}
assert.equal(Verso.inspect('photo',1,[]),null);
assert.equal(Verso.inspect('photo',1,{rarities:[]}),null);
assert.equal(Verso.inspect('photo',1,{rarities:{1:true}}),null);
assert.equal(notes.size,16);
console.log('All 16 distinct acquired-only original/reverse observations, extra normal comparison, and unchanged saves passed');
