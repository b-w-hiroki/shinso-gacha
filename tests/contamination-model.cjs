const assert=require('assert/strict'),M=require('../assets/observation-model.js'),T=1800000000000;
const fixture=(mode='cctv',rarity=1)=>{const o=M.normalize(M.create(T,42));o.unlocked=Object.keys(M.MODES);o.mode=mode;o.pending={mode,rarity,readyAt:T,expiresAt:T+3*M.HOUR,sequence:0,suppression:0,strain:0};return o;};
for(const mode of Object.keys(M.MODES))for(const rarity of [1,2,3]){
 let o=fixture(mode,rarity);for(let i=0;i<30;i++)M.tap(o,T);assert.equal(o.pending.suppression,0,'ordinary taps do not suppress');
 M.suppress(o,T,{x:0,y:1});assert.equal(o.pending.suppression,0,'miss');assert.equal(M.suppress(o,T,{x:NaN,y:0}),null);
 const [x,y]=M.TARGETS[mode][rarity][0];for(let i=0;i<M.SUPPRESS[rarity]-1;i++){M.suppress(o,T,{x,y});o=M.normalize(JSON.parse(JSON.stringify(o)));}
 const result=M.suppress(o,T,{x,y});assert.equal(result.kind,'anomaly');assert.equal(o.collected,1);assert(!o.pending);assert.equal(M.suppress(o,T,{x,y}),null,'no duplicate payout');
 o=fixture(mode,rarity);const region=Math.floor(y*3)*3+Math.floor(x*3);M.suppressRegion(o,T,region);assert.equal(o.pending.suppression,1,'accessible location choice');
}
let o=fixture();M.pursue(o,T);for(let seconds=1;seconds<=80;seconds++){if(seconds%10===0)M.pursue(o,T+seconds*1000);M.mindTick(o,T+seconds*1000,{viewing:true});}
assert.equal(M.contamination(o),3,'unresolved sustained observation reaches outside screen');assert(o.pending.strain>=75);
const strain=o.pending.strain,load=o.mind.load;M.closeMonitor(o,T+80000);M.tap(o,T+81000);M.suppress(o,T+81000,{x:.51,y:.34});assert.equal(o.pending.suppression,0,'closed monitor blocks inputs');
M.mindTick(o,T+140000,{viewing:true});assert(o.pending.strain<strain);assert(o.mind.load<load);assert.equal(o.collected,0);
o=M.normalize(JSON.parse(JSON.stringify(o)));assert(o.mind.closed,'rest survives reload');M.mindTick(o,T+3600000,{viewing:false,visible:false});assert.equal(o.mind.load,0);assert.equal(o.pending.strain,0,'offline recovers instead of advancing');
M.pursue(o,T+3600000,30);const at=o.mind.lastAt;M.mindTick(o,T,{viewing:true});assert.equal(o.mind.lastAt,at,'rollback is monotonic');
o=fixture();M.pursue(o,T,70);for(let seconds=1;seconds<=50;seconds++)M.mindTick(o,T+seconds*1000,{viewing:true});assert(o.pending.strain<30,'after 30s idle the anomaly starts receding');
const before=o.mind.load;assert(M.talk(o,T+51000,'records'));const after=o.mind.load;assert(after<before);M.talk(o,T+51000,'records');assert.equal(o.mind.load,after,'no conversation click farming');assert.equal(o.mind.talks.records,2);assert(o.mind.closed);
assert.equal(M.talk(o,T+51000,'invalid'),false);M.mindTick(o,T+400000,{visible:false});assert.equal(o.mind.load,0);assert.equal(M.contamination(o),0);
console.log('Target-only suppression, all 12 regions, exposure escalation, idle/closed/offline recovery, saved progress and conversation cooldown passed');
