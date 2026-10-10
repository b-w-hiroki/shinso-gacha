const assert=require('node:assert/strict'),M=require('../assets/player-seepage-model'),W=require('../assets/observation-model');
const now=1800000000000;
for(let lv=0;lv<3;lv++){
 const o=W.normalize(W.create(now,93));o.upgrades.sensitivity=lv;
 const counts=[0,0,0,0];for(let i=0;i<100000;i++)counts[W.roll(o,i)]++;
 assert.equal(W.ODDS[lv].reduce((a,b)=>a+b,0),100);
 const anomaly=1-counts[0]/100000;
 assert(Math.abs(anomaly-[.05,.08,.12][lv])<.004,`${lv}: ${anomaly}`);
 assert(counts[3]>0);console.log('Sensitivity',lv,'anomaly rate',anomaly);
}
const o=W.normalize(W.create(now,42));W.sync(o,o.dueAt);const held=JSON.stringify(o.pending);
assert.equal(W.upgrade(o,'sensitivity',199,o.lastSeen),null);
assert.equal(W.upgrade(o,'sensitivity',200,o.lastSeen),200);
assert.equal(W.upgrade(o,'sensitivity',500,o.lastSeen),500);
assert.equal(W.upgrade(o,'sensitivity',999,o.lastSeen),null);
assert.equal(JSON.stringify(o.pending),held);assert.equal(W.normalize(JSON.parse(JSON.stringify(o))).upgrades.sensitivity,2);
const states=new Set();let accepted=0;
for(let i=0;i<1000;i++){
 const s={};M.tick(s,{now,encounter:'watch:'+i,seed:42,engaged:true});
 if(!s.event)continue;accepted++;states.add(s.event.id);
 const copy=JSON.parse(JSON.stringify(s));assert.equal(M.tick(copy,{now:now+1,encounter:'watch:'+i,seed:42,engaged:true}),false);
 assert.deepEqual(copy.event,s.event);M.tick(copy,{now:now+M.DURATION,encounter:'watch:'+i,seed:42,engaged:true});assert.equal(copy.event,null);
 M.tick(copy,{now:now+M.COOLDOWN+1,encounter:'watch:'+i,seed:42,engaged:true});assert.equal(copy.event,null,'same anomaly cannot recur');
}
assert.equal(states.size,9);assert(accepted>280&&accepted<420);
for(const flags of [{visible:false},{quiet:true},{engaged:false}]){const s={};M.tick(s,{now,encounter:'watch:1',seed:42,engaged:true,...flags});assert.equal(s.event,null);assert.equal(s.seen.length,0);}
const s={event:{id:6,key:'test',start:now,end:now+90000},nextAt:0};M.calm(s,now+1000);assert.equal(s.event,null);assert.equal(s.nextAt,now+121000);
assert.equal(M.normalize({event:{id:99},seen:[null,3,'valid']}).event,null);
console.log('All nine spillovers, probability, reload/no reroll, cooldown, expiry, quiet/hidden/idle and calm passed');
