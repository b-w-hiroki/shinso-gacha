const assert=require('assert/strict'),M=require('../assets/observation-model');
const T=1800000000000;
// Migrate every old level once, preserve held evidence and refund only purchased routes.
for(const [id,map] of Object.entries(M.LEGACY_LEVELS))for(let level=0;level<map.length;level++){
 const o=M.create(T,42);o.version=2;o.unlocked=['cctv','photo','dash','photo'];o.upgrades[id]=level;
 o.pending={mode:'cctv',rarity:2,readyAt:T,expiresAt:T+3*M.HOUR,sequence:0,suppression:4,strain:8};o.collection={'cctv:2':7};
 const held=JSON.stringify(o.pending);M.normalize(o);assert.equal(o.upgrades[id],map[level]);assert.equal(JSON.stringify(o.pending),held);assert.equal(o.collection['cctv:2'],7);
 assert.equal(M.takeRouteCredit(o),900);assert.equal(M.takeRouteCredit(M.normalize(JSON.parse(JSON.stringify(o)))),0);
 assert.equal(o.upgrades[id],map[level]);assert.deepEqual(o.unlocked,Object.keys(M.MODES));
}
assert.equal(M.takeRouteCredit(M.create(T,1)),0);
// New maximum costs equal the old full-upgrade totals, and maxima cannot overcharge.
for(const [id,total] of Object.entries({retention:920,interval:1200,sensitivity:700,patrol:3600,suppression:6400})){
 const o=M.normalize(M.create(T,42));o.collected=20;o.manualSuppressions=10;if(id==='suppression')o.upgrades.patrol=1;
 let spent=0;for(let i=0;i<M.UPGRADES[id].max;i++)spent+=M.upgrade(o,id,99999,T);
 assert.equal(spent,total);assert.equal(M.upgrade(o,id,99999,T),null);assert.equal(o.upgrades[id],M.UPGRADES[id].max);
}
// Many saves/seeds: each bag visits routes, never consecutive duplicates; no tap rerolls.
for(let seed=1;seed<=80;seed++){
 let o=M.normalize(M.create(T,seed));M.focus(o,{id:'u2',mode:'dash',rarities:[2]});const seen=new Set([o.mode]);
 for(let i=0;i<40;i++){
  const previous=o.mode;o.pending=null;o.tapProgress=M.TAPS[0]-1;const record=M.tap(o,T+i);assert(record);assert.notEqual(o.mode,previous);seen.add(o.mode);
  const stamp=JSON.stringify(o.routeRoll);const held=JSON.stringify(o.pending);M.normalize(o);M.sync(o,o.lastSeen);assert.equal(JSON.stringify(o.routeRoll),stamp);assert.equal(o.pending?.rarity,JSON.parse(held)?.rarity);
  o=M.normalize(JSON.parse(JSON.stringify(o)));
  if(i===2)assert.equal(seen.size,4,'initial four scenes include every route');
 }
}
// Tracking controls order and content, not occurrence odds.
let priority=0;
for(let seed=1;seed<=1000;seed++){const o=M.normalize(M.create(T,seed));M.focus(o,{id:'u2',mode:'dash',rarities:[2]});o.tapProgress=9;M.tap(o,T);if(o.mode==='dash')priority++;}
assert(priority>500&&priority<700,priority);
for(const lv of [0,1,6,14]){
 const o=M.normalize(M.create(T,99));o.mode='dash';o.upgrades.sensitivity=lv;o.collection={'dash:1':1,'dash:2':1,'dash:3':1};let base=0,preferred=0,unseen=0,anomalies=0;
 for(let i=0;i<50000;i++){M.focus(o,null);o.collection['dash:2']=1;const r=M.roll(o,i);if(r)anomalies++;if(r===2)base++;M.focus(o,{id:'u2',mode:'dash',rarities:[2]});assert.equal(M.roll(o,i)>0,r>0);if(M.roll(o,i)===2)preferred++;o.collection['dash:2']=0;assert.equal(M.roll(o,i)>0,r>0);if(M.roll(o,i)===2)unseen++;}
 assert(Math.abs(anomalies/50000-(.05+lv*.005))<.006);assert(preferred>base);assert(unseen>preferred);
}
// Low-drama clues are persistent context only: no extra evidence or points.
let o=M.normalize(M.create(T,17));M.focus(o,{id:'u2',mode:'dash',rarities:[2]});
for(let i=0;i<4;i++){o.pending=null;o.tapProgress=9;M.tap(o,T+i);}
assert.equal(o.clueStep,1);assert.equal(o.lead.legendId,'u2');assert.equal(o.collected,4);assert.equal(Object.values(o.collection).reduce((a,b)=>a+b,0),4);
// A normal route is drawn once even if sensitivity/active case change before the timer.
o=M.normalize(M.create(T,42));o.tapProgress=9;M.tap(o,T);assert.equal(o.routeRoll.rarity,0);M.upgrade(o,'sensitivity',99,T);M.focus(o,{id:'u3',mode:o.mode,rarities:[2]});M.sync(o,o.dueAt);assert.equal(o.pending.rarity,0);assert.equal(o.pending.legendId,null);
// A resolved anomaly carries the original case into the return to the department.
o=M.normalize(M.create(T,42));o.pending={mode:'cctv',rarity:1,legendId:'u1',readyAt:T,expiresAt:T+M.HOUR,sequence:0,suppression:5};const result=M.suppress(o,T,{x:.51,y:.34});assert(result);assert.equal(o.echo.legendId,'u1');assert.equal(o.echo.mode,'cctv');assert.equal(o.echo.end,T+5*M.MINUTE);assert.notEqual(o.mode,'cctv');
console.log('Legacy migration/refunds, capped incremental growth, weighted four-route bags, fixed odds, no rerolls, clue pacing and return echoes passed');
