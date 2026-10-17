/* Passive suspicion-pt income breakdown. Pure and read-only: no save state, rewards or RNG. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.WalletIncome=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const BASE_MS=5000,USHI_MS=2500,RANK_STEP=.05,GEAR_STEP=.1,USHI_HOUR=2;
 const int=(v,min,max)=>{const n=Math.floor(Number(v));return Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;};
 function multipliers(rankIdx,radioLv){
  const rank=1+RANK_STEP*int(rankIdx,0,99),gear=1+GEAR_STEP*int(radioLv,0,99);
  return {rank,gear,total:rank*gear};
 }
 function stepMs(hour,rankIdx,radioLv){
  return (Number(hour)===USHI_HOUR?USHI_MS:BASE_MS)/multipliers(rankIdx,radioLv).total;
 }
 function breakdown(input){
  const o=input&&typeof input==='object'?input:{};
  const rankIdx=int(o.rankIdx,0,99),radioLv=int(o.radioLv,0,99),phoneLv=int(o.phoneLv,0,99);
  const hour=Number(o.hour),m=multipliers(rankIdx,radioLv),step=stepMs(hour,rankIdx,radioLv);
  const now=Number(o.now),last=Number(o.lastTick);
  // Time to the next +1pt, clamped to one full interval so a stale clock never shows a negative or huge value.
  const nextMs=Number.isFinite(now)&&Number.isFinite(last)?Math.min(step,Math.max(0,Math.ceil(last+step-now))):step;
  return {stepMs:step,perMinute:60000/step,perHour:3600000/step,
   rankMult:m.rank,gearMult:m.gear,totalMult:m.total,rankNumber:rankIdx+1,radioLv,
   ushi:hour===USHI_HOUR,ushiMult:hour===USHI_HOUR?BASE_MS/USHI_MS:1,nextMs,awayHours:2+phoneLv};
 }
 const seconds=ms=>(Math.round(ms/100)/10).toFixed(1);
 return {BASE_MS,USHI_MS,USHI_HOUR,multipliers,stepMs,breakdown,seconds};
});
