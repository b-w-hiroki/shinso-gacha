const assert=require('node:assert/strict'),M=require('../assets/observation-model');
const T=1800000000000,H=M.HOUR,I=10*M.MINUTE;
let o=M.create(T,42);assert.equal(o.mode,'cctv');assert.deepEqual(o.unlocked,['cctv']);
assert.equal(M.claim(o,T+I-1),null);M.sync(o,T+I);assert(o.pending);assert.equal(o.pending.expiresAt,T+I+3*H);
const pending=JSON.stringify(o.pending);M.sync(o,T+I+H);assert.equal(JSON.stringify(o.pending),pending,'held result must not reroll');
const copy=JSON.parse(JSON.stringify(o));M.sync(copy,T+I+H+100);assert.equal(copy.pending.rarity,o.pending.rarity,'save round trip');
assert(!M.equip(o,'photo',T+I+H));const r=M.claim(o,T+I+3*H-1);assert(r&&r.reward>0);assert.equal(M.claim(o,T+I+3*H-1),null,'rapid second tap');assert.equal(o.collected,1);
assert.equal(r.first,true);assert.equal(o.collection[r.mode+':'+r.rarity],1);
const album=JSON.stringify(o.collection);const next=o.dueAt;M.sync(o,next);o.pending.rarity=r.rarity;const repeat=M.claim(o,next);assert.equal(repeat.first,false);assert.equal(o.collection[r.mode+':'+r.rarity],2);assert.deepEqual(M.normalize(JSON.parse(JSON.stringify(o))).collection,M.normalize(o).collection);
// Expiry boundary, long offline catch-up, no accumulated payout or danger.
o=M.create(T,77);M.sync(o,T+I+3*H);assert.equal(o.pending,null);assert.equal(o.collected,0);assert.equal(o.missed,1);assert.equal(o.dueAt,T+2*I+3*H);
const jump=M.create(T,77),stepped=M.create(T,77);for(let i=1;i<=24*60;i++)M.sync(stepped,T+i*M.MINUTE);M.sync(jump,T+24*H);assert.deepEqual(jump,stepped,'offline result equals continuously open result');
M.sync(jump,T+365*24*H);assert.equal(jump.collected,0);assert(jump.missed>1000);assert(!jump.history.length);assert.equal(Object.values(jump.collection).reduce((a,b)=>a+b,0),0);
const seen=jump.lastSeen;M.sync(jump,T);assert.equal(jump.lastSeen,seen,'clock rollback cannot reopen an expired slot');
// Unlock and equip are separate, exactly one current source, no paid duplicate.
o=M.create(T,88);assert.equal(M.unlock(o,'photo',9999),null);o.collected=5;assert.equal(M.unlock(o,'photo',99),null);assert.equal(M.unlock(o,'photo',100),100);assert.equal(M.unlock(o,'photo',100),null);assert(M.equip(o,'photo',T));assert.equal(o.mode,'photo');assert.equal(M.equip(o,'vision',T),false);
// Retention increases 3 -> 6 -> 12 -> 24 and extends already-held records.
M.sync(o,T+I);const ready=o.pending.readyAt;for(const hours of [6,12,24]){assert.notEqual(M.upgrade(o,'retention',9999,T+I+1),null);assert.equal(o.pending.expiresAt,ready+hours*H);}assert.equal(M.upgrade(o,'retention',9999,T+I+1),null);assert.equal(M.claim(o,ready+24*H-1).mode,'photo');
const due=o.dueAt;assert.notEqual(M.upgrade(o,'interval',9999,o.lastSeen),null);assert(o.dueAt<due);assert.equal(M.interval(o),8*M.MINUTE);
assert.equal(M.upgrade(o,'sensitivity',0,o.lastSeen),null);assert.equal(M.upgrade(o,'sensitivity',9999,o.lastSeen),200);
// Rewards increase with rarity/source; all three anomaly families actually occur.
for(const mode of Object.keys(M.MODES)){const rewards=[0,1,2,3].map(rarity=>M.reward({mode,rarity}));for(let i=1;i<4;i++)assert(rewards[i]>rewards[i-1]);}
const counts=[0,0,0,0];o=M.create(T,93);for(let i=0;i<10000;i++)counts[M.roll(o,i)]++;assert(counts[0]>5000&&counts[3]>100&&counts[3]<300,counts.join(','));
// Migration preserves chosen medium and a held old anomaly, without granting every unlock.
o=M.create(T,13,{version:1,mode:'vision',anomaly:true,quiet:true});assert.equal(o.mode,'vision');assert.deepEqual(o.unlocked,['cctv','vision']);assert.equal(o.pending.rarity,2);assert(o.quiet);
console.log('Clock boundaries, 3–24h hold, offline catch-up, no reroll/double payout, unlocks and growth passed');
// Set completion is retroactive, explicit, fixed-value and once per saved set.
o=M.normalize(M.create(T,99));
assert.equal(M.claimSet(o,'cctv'),null);assert.equal(M.claimSet(o,'toString'),null);
for(let r=0;r<3;r++)o.collection['cctv:'+r]=20;
assert.equal(M.setProgress(o,'cctv'),3);assert.equal(M.claimSet(o,'cctv'),null);
o.collection['cctv:3']=1;assert.equal(M.claimSet(o,'cctv'),80);assert.equal(M.claimSet(o,'cctv'),null);
o=M.normalize(JSON.parse(JSON.stringify(o)));assert.equal(M.claimSet(o,'cctv'),null);
for(const mode of ['photo','vision','dash']){for(let r=0;r<4;r++)o.collection[mode+':'+r]=1;assert.equal(M.claimSet(o,mode),M.SET_REWARDS[mode]);}
assert.equal(Object.values(o.completedSets).filter(Boolean).length,4);
console.log('Set completion: partial, repeats, all media, saved one-time claims passed');
