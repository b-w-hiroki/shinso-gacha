const assert=require('node:assert/strict'),M=require('../assets/world-revision-model');
for(let i=1;i<=12;i++){
 const id='u'+i;
 assert.equal(M.history(id,0,{}),null);assert.equal(M.history(id,2,{}),null);
 const received=M.history(id,3,{});assert.equal(received.rows.length,1);
 const noticed=M.history(id,3,{noticed:true});assert.equal(noticed.rows.length,2);
 assert.equal(M.history(id,3,null).rows.length,1);
 assert.equal(M.history(id,3,{noticed:'true'}).rows.length,1,'string flags cannot reveal revisions');
 assert.equal(M.history(id,3,{noticed:true,compared:true,concluded:false}).rows.length,2);
 const complete=M.history(id,3,{noticed:true,compared:true,concluded:true});assert.equal(complete.rows.length,3);
 assert.equal(new Set(complete.rows.map(row=>row.text)).size,3);assert.deepEqual(complete,M.history(id,3,{noticed:true,compared:true,concluded:true}));
}
const completed=Array.from({length:12},(_,i)=>M.history('u'+(i+1),3,{noticed:true,compared:true,concluded:true}));
for(let stage=0;stage<3;stage++)assert.equal(new Set(completed.map(x=>x.rows[stage].text)).size,12,'every case has a distinct revision at stage '+stage);
for(const id of ['u0','u13','__proto__',null])assert.equal(M.history(id,3,{noticed:true,compared:true,concluded:true}),null);
for(const count of [undefined,NaN,null,-1,Infinity,'3',3.5,true])assert.equal(M.history('u1',count,{noticed:true,compared:true,concluded:true}),null);
const source={noticed:true,compared:true,concluded:true};M.history('u1',3,source);assert.deepEqual(source,{noticed:true,compared:true,concluded:true},'projection cannot mutate source state');
console.log('Twelve acquired-only revision histories, strict staged disclosure and deterministic projection passed');
