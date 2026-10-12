/* Deterministic simulation only; never connects to production, changes currency,
 * or substitutes for actual human play / iPhone Safari QA. */
const M=require('../assets/observation-model.js');
const Locations=require('../assets/observation-location-model.js');
globalThis.WatchLocations=Locations;
const HOUR=M.HOUR,DAY=24*HOUR,EPOCH=1800000000000;
const HOURS=[9,11,13,15,17,19],MODES=Object.keys(M.MODES);
function simulate(seed,{days=14,sensitivity=0}={}){
 if(!Number.isSafeInteger(seed)||seed<1||seed>0xffffffff||
    !Number.isSafeInteger(days)||days<1||days>40||
    ![0,14].includes(sensitivity))throw Error('invalid simulation configuration');
 let o=M.create(EPOCH,seed);
 o.upgrades.sensitivity=sensitivity;
 const earned=[],schedules=days*HOURS.length;
 let unavailable=0,taps=0,routeRepeats=0;
 for(let day=0;day<days;day++){
  for(const hour of HOURS){
   const now=EPOCH+day*DAY+hour*HOUR;
   M.sync(o,now);
   if(!o.pending){unavailable++;continue;}
   const mode=o.mode,rarity=o.pending.rarity;
   let result=null;
   if(rarity===0){
    for(let i=0;i<M.TAPS[o.upgrades.interval];i++){
     const next=M.tap(o,now);if(next)result=next;
     taps++;
    }
   }else{
    const target=M.activeTargets(o)[0];
    if(!target)throw Error('missing acquired-only image target for '+mode+'/'+rarity);
    for(let i=0;i<M.SUPPRESS[rarity];i++){
     const next=M.suppress(o,now,{x:target[0],y:target[1]});if(next)result=next;
     taps++;
    }
   }
   if(!result||result.record.mode!==mode||result.record.rarity!==rarity||
      !Number.isFinite(result.record.reward)||result.record.reward<=0)
      throw Error('genuine observation failed '+seed+' day='+day+' hour='+hour);
   if(o.mode===mode)routeRepeats++;
   const recent=o.history.at(-1);
   if(recent?.mode!==mode||recent?.rarity!==rarity)throw Error('history lost actual observation');
   earned.push({day,mode,rarity,reward:result.record.reward,sequence:result.record.sequence,
     site:!!Locations.current(mode,rarity,result.record.sequence)});
  }
  // Force the real normalization path used by existing save/load, not a fake fast clone.
  o=M.normalize(JSON.parse(JSON.stringify(o)));
  if(o.collected!==earned.length)throw Error('save/restore duplicated or dropped progress');
 }
 const before=JSON.stringify({collection:o.collection,history:o.history,collected:o.collected});
 M.sync(o,EPOCH+(days+7)*DAY);
 if(JSON.stringify({collection:o.collection,history:o.history,collected:o.collected})!==before)
  throw Error('a week away incorrectly paid out or altered the archive');
 if(o.history.length>12)throw Error('history exceeded memory cap');
 const modes=Object.fromEntries(MODES.map(m=>[m,earned.filter(x=>x.mode===m).length]));
 const rarityCounts=[0,1,2,3].map(i=>earned.filter(x=>x.rarity===i).length);
 return {seed,days,sensitivity,schedules,unavailable,records:earned.length,taps,
  missed:o.missed,modeCounts:modes,rarityCounts,routeRepeats,
  firstAnomalyIndex:earned.findIndex(x=>x.rarity>0)>=0?earned.findIndex(x=>x.rarity>0)+1:null,
  rewards:earned.reduce((n,x)=>n+x.reward,0),
  alternateScene:earned.filter(x=>x.site).length};
}
function report({seeds=80,days=14,sensitivity=0}={}){
 const rows=Array.from({length:seeds},(_,i)=>simulate(i+1,{days,sensitivity}));
 const all=rows.reduce((o,x)=>{
  o.schedules+=x.schedules;o.unavailable+=x.unavailable;o.records+=x.records;
  o.taps+=x.taps;o.missed+=x.missed;o.rewards+=x.rewards;o.alternateScene+=x.alternateScene;
  o.routeRepeats+=x.routeRepeats;o.withoutAnomaly+=x.firstAnomalyIndex===null?1:0;
  for(let i=0;i<4;i++)o.rarityCounts[i]+=x.rarityCounts[i];
  for(const m of MODES)o.modeCounts[m]+=x.modeCounts[m];
  return o;
 },{seeds,days,sensitivity,schedules:0,unavailable:0,records:0,taps:0,missed:0,
    rewards:0,alternateScene:0,routeRepeats:0,withoutAnomaly:0,
    rarityCounts:[0,0,0,0],modeCounts:Object.fromEntries(MODES.map(m=>[m,0]))});
 all.anomalyRate=all.records?
  Number(((all.records-all.rarityCounts[0])/all.records).toFixed(4)):0;
 const indices=rows.map(x=>x.firstAnomalyIndex).filter(Number.isInteger).sort((a,b)=>a-b);
 all.medianFirstAnomalyChecks=indices.length?indices[Math.floor(indices.length/2)]:null;
 return all;
}
if(require.main===module){
 const rows=[report(),report({sensitivity:14})];
 console.log(JSON.stringify({method:'synthetic deterministic 14-day, six checks per day; not measured player behavior',rows},null,2));
}
module.exports={simulate,report};
