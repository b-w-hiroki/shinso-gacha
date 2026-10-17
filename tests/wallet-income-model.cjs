const assert=require('node:assert/strict');
const W=require('../assets/wallet-income-model.js');
// Base: 5s per pt at RANK 1, no gear; 2s... at 02:00-02:59 the interval halves.
let b=W.breakdown({rankIdx:0,radioLv:0,phoneLv:0,hour:10,now:1000,lastTick:1000});
assert.equal(b.stepMs,5000);assert.equal(b.perMinute,12);assert.equal(b.perHour,720);
assert.equal(b.rankMult,1);assert.equal(b.gearMult,1);assert.equal(b.ushi,false);assert.equal(b.ushiMult,1);
assert.equal(b.nextMs,5000,'a just-credited tick waits one full interval');assert.equal(b.awayHours,2);assert.equal(b.rankNumber,1);
b=W.breakdown({rankIdx:0,radioLv:0,phoneLv:0,hour:2,now:0,lastTick:0});
assert.equal(b.stepMs,2500);assert.equal(b.ushi,true);assert.equal(b.ushiMult,2);assert.equal(b.perHour,1440);
// Rank and equipment multiply; the same formula drives the real idle step.
b=W.breakdown({rankIdx:4,radioLv:10,phoneLv:3,hour:12,now:0,lastTick:0});
assert.ok(Math.abs(b.rankMult-1.2)<1e-9&&Math.abs(b.gearMult-2)<1e-9&&Math.abs(b.totalMult-2.4)<1e-9);
assert.ok(Math.abs(b.stepMs-5000/2.4)<1e-9);assert.equal(b.awayHours,5);assert.equal(b.rankNumber,5);
assert.equal(W.stepMs(2,4,10),2500/2.4);assert.equal(W.stepMs(3,0,0),5000);
// Countdown is clamped: half-way, overdue and a clock that moved backwards.
b=W.breakdown({rankIdx:0,radioLv:0,phoneLv:0,hour:10,now:3000,lastTick:1000});assert.equal(b.nextMs,3000);
b=W.breakdown({rankIdx:0,radioLv:0,phoneLv:0,hour:10,now:99999,lastTick:1000});assert.equal(b.nextMs,0);
b=W.breakdown({rankIdx:0,radioLv:0,phoneLv:0,hour:10,now:0,lastTick:99999});assert.equal(b.nextMs,5000);
// Hostile or missing input falls back to safe defaults.
for(const bad of [null,undefined,{},{rankIdx:'x',radioLv:NaN,phoneLv:-5,hour:NaN,now:NaN,lastTick:Infinity},{rankIdx:1e9,radioLv:-1e9}]){
 const r=W.breakdown(bad);assert.ok(Number.isFinite(r.stepMs)&&r.stepMs>0,JSON.stringify(bad));
 assert.ok(r.nextMs>=0&&r.nextMs<=r.stepMs);assert.ok(r.awayHours>=2);
}
assert.equal(W.seconds(5000),'5.0');assert.equal(W.seconds(2083.33),'2.1');assert.equal(W.seconds(0),'0.0');
// Pure: the input object is never changed.
const input={rankIdx:2,radioLv:1,phoneLv:0,hour:2,now:5,lastTick:1};const copy=JSON.stringify(input);W.breakdown(input);assert.equal(JSON.stringify(input),copy);
console.log('Wallet income: 5s/2.5s base, rank and gear multipliers, clamped countdown and hostile input passed');
