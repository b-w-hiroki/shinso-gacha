const assert=require('node:assert/strict'),M=require('../assets/reality-clues-model');
for(let i=1;i<=12;i++){const id='u'+i;assert.equal(M.clue(id,0,false),null);assert.equal(M.clue(id,2,false),null);const a=M.clue(id,3,false),b=M.clue(id,3,true);assert(a&&b);assert.equal(a.revealed,false);assert.equal(b.revealed,true);assert.equal(a.tag,b.tag);assert.notEqual(a.observed,b.observed);assert.deepEqual(b,M.clue(id,3,true));}
const clues=Array.from({length:12},(_,i)=>M.clue('u'+(i+1),3,true));
assert.equal(new Set(clues.map(x=>x.tag)).size,12,'each acquired case has its own clue');
assert.equal(new Set(clues.map(x=>x.observed)).size,12,'repeated generic fiction is not enough');
assert.equal(M.clue('u1',3,false).revealed,false,'not-yet-compared case never reveals the altered answer');
for(const id of ['u0','u13','__proto__',null])assert.equal(M.clue(id,3,true),null);
for(const count of [undefined,NaN,0,2,null,-1,Infinity]){
 assert.equal(M.clue('u1',count,true),null,'invalid count must not expose the answer: '+String(count));
}
assert.equal(M.clue('u1',3,'false').revealed,false,'string falsity never unlocks the comparison');
assert.equal(M.clue('u1',3,'false').observed,M.clue('u1',3,false).observed);
console.log('Reality clue discovery gates, authored variants, stability and locked-case secrecy passed');