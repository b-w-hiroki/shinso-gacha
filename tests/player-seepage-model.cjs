const assert=require('node:assert/strict'),M=require('../assets/player-seepage-model'),W=require('../assets/observation-model');
const now=1800000000000;
for(const lv of [0,1,6,14]){
 const o=W.normalize(W.create(now,93));o.upgrades.sensitivity=lv;
 const counts=[0,0,0,0];for(let i=0;i<100000;i++)counts[W.roll(o,i)]++;
 assert(Math.abs(W.ODDS[lv].reduce((a,b)=>a+b,0)-100)<1e-8);
 const anomaly=1-counts[0]/100000;
 assert(Math.abs(anomaly-(.05+lv*.005))<.004,`${lv}: ${anomaly}`);
 assert(counts[3]>0);console.log('Sensitivity',lv,'anomaly rate',anomaly);
}
const o=W.normalize(W.create(now,42));W.sync(o,o.dueAt);W.normalize(o);const held=JSON.stringify(o.pending);
assert.equal(W.upgrade(o,'sensitivity',19,o.lastSeen),null);
for(const cost of W.UPGRADES.sensitivity.costs)assert.equal(W.upgrade(o,'sensitivity',9999,o.lastSeen),cost);
assert.equal(W.upgrade(o,'sensitivity',9999,o.lastSeen),null);
assert.equal(JSON.stringify(o.pending),held);assert.equal(W.normalize(JSON.parse(JSON.stringify(o))).upgrades.sensitivity,14);
const states=new Set();let accepted=0;
for(let i=0;i<1000;i++){
 const s={};M.tick(s,{now,encounter:'watch:'+i,seed:42,engaged:true});
 if(!s.event)continue;accepted++;states.add(s.event.id);
 const copy=JSON.parse(JSON.stringify(s));assert.equal(M.tick(copy,{now:now+1,encounter:'watch:'+i,seed:42,engaged:true}),false);
 assert.deepEqual(copy.event,s.event);M.tick(copy,{now:now+M.DURATION,encounter:'watch:'+i,seed:42,engaged:true});assert.equal(copy.event,null);
 M.tick(copy,{now:now+M.COOLDOWN+1,encounter:'watch:'+i,seed:42,engaged:true});assert.equal(copy.event,null,'same anomaly cannot recur');
}
assert.equal(states.size,13,'old nine plus four new atmospheric variants must all be reachable');assert(accepted>280&&accepted<420);
for(let i=0;i<1000;i++){const s={};M.tick(s,{now,encounter:'envelope:'+i,seed:42,engaged:true});assert.notEqual(s.event?.id,12,'action mimicry is reserved for real observation input');}
for(const flags of [{visible:false},{quiet:true},{engaged:false}]){const s={};M.tick(s,{now,encounter:'watch:1',seed:42,engaged:true,...flags});assert.equal(s.event,null);assert.equal(s.seen.length,0);}
const s={event:{id:6,key:'test',start:now,end:now+90000},nextAt:0};M.calm(s,now+1000);assert.equal(s.event,null);assert.equal(s.nextAt,now+121000);
assert.equal(M.normalize({event:{id:99},seen:[null,3,'valid']}).event,null);
for(const id of [0,3,6,8,9,10,11,12]){
 const event={id,key:'persist:'+id,start:now,end:now+90000};
 assert.deepEqual(M.normalize({event:{...event}}).event,{...event,glimpsed:false,mimicked:false},'old and new variants survive normalization');
}
assert.equal(M.normalize({event:{id:13,key:'bad',start:now,end:now+90000}}).event,null);
console.log('All thirteen spillovers, unchanged 35% trigger, reload/no reroll, cooldown, expiry, quiet/hidden/idle and calm passed');
