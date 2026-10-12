const assert=require('node:assert/strict'),Back=require('../assets/observation-backside-model.js');
const ids=['cctv','photo','vision','dash'],titles=new Set(),notes=new Set();
for(const mode of ids)for(const rarity of [1,2,3]){
 const without=Back.inspect('alt:'+mode,rarity,{});
 assert.equal(without,null,'unacquired image reverse cannot be inspected');
 const withRare=Back.inspect('alt:'+mode,rarity,{[rarity]:1});
 assert(withRare&&withRare.id==='alt:'+mode+':'+rarity);
 assert(withRare.code&&withRare.title&&withRare.note);
 assert.equal(withRare.comparison,null,'unacquired normal original has no comparison notes');
 const withNormal=Back.inspect('alt:'+mode,rarity,{[rarity]:1,0:1});
 assert(withNormal.comparison&&withNormal.verifiedWithNormal);
 assert(!titles.has(withRare.title)&&!notes.has(withRare.note),'each acquired image must show distinctive evidence');
 titles.add(withRare.title);notes.add(withRare.note);
}
for(const id of [null,'__proto__','alt:__proto__','alt:invalid','cctv','alt:photo:1'])
 assert.equal(Back.inspect(id,1,{1:1}),null,'bad location cannot access acquired evidence');
for(const rarity of [-1,0,4,NaN,'1'])
 assert.equal(Back.inspect('alt:cctv',rarity,{0:1,1:1,2:1,3:1}),null);
assert.equal(Back.inspect('alt:photo',3,{3:0}),null);
assert.equal(Back.inspect('alt:photo',3,{3:-3}),null);
assert.equal(Back.inspect('alt:photo',3,{3:1.5}),null);
assert.deepEqual(Back.inspect('alt:dash',1,{1:1}),Back.inspect('alt:dash',1,{1:1}),'pure reread');
assert.equal(notes.size,12,'exactly twelve distinctive acquired anomalies');
console.log('Twelve acquired-only photo reverse annotations, original comparison gates, and no unknown leaks passed');
