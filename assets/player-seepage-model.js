/* Cosmetic spillover uses its own deterministic stream, never the reward RNG. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SeepageModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const DURATION=90000,COOLDOWN=120000;
 const number=v=>Number.isFinite(v)?Math.max(0,v):0;
 function normalize(s){
  s.seen=Array.isArray(s.seen)?s.seen.filter(x=>typeof x==='string').slice(-24):[];
  s.nextAt=number(s.nextAt);s.lastAt=number(s.lastAt);
  const e=s.event;
  if(!e||!Number.isInteger(e.id)||e.id<0||e.id>12||typeof e.key!=='string'||!Number.isFinite(e.start)||!Number.isFinite(e.end)||e.end<=e.start||e.end-e.start>DURATION)s.event=null;
  else {e.glimpsed=!!e.glimpsed;e.mimicked=!!e.mimicked;}
  return s;
 }
 function hash(key,seed){let n=seed>>>0;for(const c of key)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;}
 function tick(s,{now,encounter='',seed=1,engaged=false,visible=true,quiet=false}){
  normalize(s);now=Math.max(number(now),s.lastAt);s.lastAt=now;let changed=false;
  if(s.event&&now>=s.event.end){s.event=null;changed=true;}
  if(!visible||quiet||!engaged||!encounter||s.event||now<s.nextAt||s.seen.includes(encounter))return changed;
  s.seen.push(encounter);s.seen=s.seen.slice(-24);changed=true;
  const n=hash(encounter,seed);
  // Only 35% of actual anomalies bleed out; revisiting/reloading never rerolls.
  if(n%100>=35)return changed;
  // Keep the same 35% overall trigger rate and all old 0..8 story IDs.
  // A minority of *new* encounters now picks one of four subtler additions;
  // existing persisted encounters never reroll.
  const additions=encounter.startsWith('watch:')?4:3;
  const id=(n>>>18)%6===0?9+((n>>>11)%additions):Math.floor(n/100)%9;
  s.event={id,key:encounter,start:now,end:now+DURATION,glimpsed:false,mimicked:false};
  s.nextAt=now+COOLDOWN;return changed;
 }
 function calm(s,now){normalize(s);s.event=null;s.nextAt=Math.max(s.nextAt,number(now)+COOLDOWN);}
 return {DURATION,COOLDOWN,normalize,tick,calm,hash};
});
