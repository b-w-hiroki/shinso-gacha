const assert=require('assert/strict'),R=require('../assets/runtime-safety');
const attack=JSON.parse('{"__proto__":{"polluted":true},"levels":{"u1":999,"bogus":5},"currency":"<img>","tlog":[{"id":"bogus"},{"id":"u1","rar":"x\\\" onclick=evil","text":"<img>","no":-1}],"missions":null}');
const s=R.state(attack,{currency:30,levels:{},missions:{}},['u1']);
assert.equal({}.polluted,undefined);assert.equal(Object.getPrototypeOf(s),Object.prototype);assert.equal(s.currency,0);assert.deepEqual(s.levels,{u1:5});assert.equal(s.tlog.length,1);assert.equal(s.tlog[0].rar,'n');assert.equal(s.tlog[0].no,0);assert.deepEqual(s.missions,{});
assert.equal(R.html('<img "x" & \'y\'>'),'&lt;img &quot;x&quot; &amp; &#39;y&#39;&gt;');
let callbacks=[],runs=0;const schedule=R.frame(()=>runs++,fn=>callbacks.push(fn));for(let i=0;i<100;i++)schedule();assert.equal(callbacks.length,1);callbacks.shift()();assert.equal(runs,1);schedule();assert.equal(callbacks.length,1);
console.log('Save boundary, prototype keys, escaped text and coalesced frame scheduling passed');
