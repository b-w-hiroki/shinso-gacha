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
const counts=[0,0,0,0];o=M.create(T,93);for(let i=0;i<10000;i++)counts[M.roll(o,i)]++;assert(counts[0]>8300&&counts[0]<8700&&counts[3]>20&&counts[3]<90,counts.join(','));
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
// Duplicate research preserves original records and the live observation transaction.
o=M.normalize(M.create(T,123));o.collection['cctv:0']=48;
assert.equal(M.researchStatus(o,'cctv').available,47);assert.equal(M.research(o,'cctv',0),null);
o.collection['cctv:0']=49;M.sync(o,T+I);
const watchBefore=JSON.stringify({pending:o.pending,sequence:o.sequence,dueAt:o.dueAt,collected:o.collected,history:o.history});
const saveBefore=JSON.parse(JSON.stringify(o));const found=M.research(o,'cctv',0);assert(found&&found.rarity!==0);
assert.equal(o.collection['cctv:0'],49);assert.equal(M.researchStatus(o,'cctv').available,0);assert.equal(M.research(o,'cctv',0),null);
assert.equal(JSON.stringify({pending:o.pending,sequence:o.sequence,dueAt:o.dueAt,collected:o.collected,history:o.history}),watchBefore);
assert.deepEqual(M.research(saveBefore,'cctv',0),found,'reload has the same reconstruction');
assert.equal(M.research(M.normalize(JSON.parse(JSON.stringify(o))),'cctv',0),null);
assert.equal(M.research(o,'toString',0),null);assert.equal(M.research(o,'photo',0),null);
// Three reconstructions use 144 actual duplicates, then stop without consuming more.
o=M.normalize(M.create(T,987));o.collection['cctv:0']=145;
for(const spent of [0,48,96]){assert(M.research(o,'cctv',spent));assert.equal(M.research(o,'cctv',spent),null,'stale confirmation rejected even with enough duplicates');}
assert.equal(M.setProgress(o,'cctv'),4);assert.equal(M.researchStatus(o,'cctv').available,0);assert.equal(M.research(o,'cctv',144),null);assert.equal(M.claimSet(o,'cctv'),80);assert.equal(M.claimSet(o,'cctv'),null);
assert.equal(o.collected,0);assert.equal(o.history.length,0);assert.equal(Object.keys(o.reconstructed).length,3);
const firstPending={mode:'cctv',rarity:Number(Object.keys(o.reconstructed)[0].split(':')[1]),readyAt:T,expiresAt:T+3*H,sequence:0};o.pending=firstPending;
assert.equal(M.claim(o,T).first,false,'restored record is already known');assert.equal(M.researchStatus(o,'cctv').available,1);
console.log('Duplicate research: cost boundary, original preservation, stale confirmation, reload, unseen result, live state isolation and completion passed');
// Patrol rewards require a complete set of taps; only unlocked sources rotate.
o=M.create(T,42);o.unlocked.push('photo');
for(let i=0;i<9;i++)assert.equal(M.tap(o,T),null);
assert.equal(o.collected,0);o=M.normalize(JSON.parse(JSON.stringify(o)));
let patrol=M.tap(o,T);assert.equal(patrol.kind,'patrol');assert.equal(patrol.record.reward,8);assert.equal(o.mode,'photo');assert.equal(o.patrols,1);assert.equal(o.collection['cctv:0'],1);
assert.equal(M.tap(o,T),null,'next click cannot pay twice');
for(const mode of Object.keys(M.MODES))for(const rarity of [1,2,3]){
 o=M.create(T,42);o.unlocked=Object.keys(M.MODES);o.mode=mode;o.pending={mode,rarity,readyAt:T,expiresAt:T+3*H,sequence:0};
 const [x,y]=M.TARGETS[mode][rarity][0];
 for(let i=0;i<M.SUPPRESS[rarity]-1;i++){assert.equal(M.suppress(o,T,{x,y}),null);o=JSON.parse(JSON.stringify(o));}
 const result=M.suppress(o,T,{x,y});assert.equal(result.kind,'anomaly');assert.equal(result.record.reward,Math.round(M.ANOMALY_REWARDS[rarity]*M.MODES[mode].mult));assert.equal(o.collected,1);assert.equal(o.history[0].reward,result.record.reward);assert.equal(M.tap(o,T),null);
}
// Automation is purchased separately, foreground-only and never catches up in bursts.
o=M.create(T,42);M.automate(o,T+5000);assert.equal(o.tapProgress,0);
assert.equal(M.upgrade(o,'patrol',300,T+5000),null);o.collected=20;o.unlocked.push('photo');assert.equal(M.upgrade(o,'patrol',300,T+5000),300);
M.automate(o,T+9999);assert.equal(o.tapProgress,0);M.automate(o,T+10000);assert.equal(o.tapProgress,1);
M.automate(o,T+15000,false);assert.equal(o.tapProgress,1);M.automate(o,T+15001,true);assert.equal(o.tapProgress,1);
o.autoEnabled=false;M.automate(o,T+20000);assert.equal(o.tapProgress,1);o.autoEnabled=true;
M.automate(o,T+100000);assert.equal(o.tapProgress,2,'one tick even after a large gap');
o.pending={mode:'cctv',rarity:2,readyAt:T,expiresAt:T+3*H,sequence:0};o.upgrades.suppression=1;
M.automate(o,T+105000);assert.equal(o.pending.suppression,0,'R automation cannot suppress SR');o.upgrades.suppression=2;o.manualSuppressions=10;
M.automate(o,T+110000);assert.equal(o.pending.suppression,1,'eligible automation uses an actual target');assert.equal(o.manualSuppressions,10,'automation does not count as manual training');
const legacy=M.create(T,42);delete legacy.tapProgress;delete legacy.autoLastAt;delete legacy.upgrades.patrol;delete legacy.upgrades.suppression;legacy.collection={'cctv:3':2};M.normalize(legacy);assert.equal(legacy.tapProgress,0);assert.equal(legacy.upgrades.patrol,0);assert.equal(legacy.collection['cctv:3'],2);
console.log('Tap thresholds, normal/rare payouts, rotation, saved progress, foreground automation and migration passed');
