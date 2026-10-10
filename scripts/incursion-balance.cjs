const fs=require('fs'),vm=require('vm'),Watch=require('../assets/observation-model');
let seed=12345;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const c=vm.createContext({Math:math,document:{addEventListener(){}}});vm.runInContext(fs.readFileSync('assets/incursions.js','utf8'),c);
const results=vm.runInContext(`(()=>{const results=[];for(let s=0;s<1000;s++){
 const seen=new Set(),a={history:[]};let duplicates=0,n=0,firstSSR=0,restored=0;
 while(seen.size<100&&n<10000){const kind=drawIncursionKind(a);n++;a.history=[{kind}];if(!firstSSR&&incursionRarity(kind).id==='SSR')firstSSR=n;if(seen.has(kind))duplicates++;else seen.add(kind);
 if(duplicates>=12&&seen.size<100){const missing=INCURSIONS.map((_,i)=>i).filter(k=>!seen.has(k));seen.add(missing[Math.floor(Math.random()*missing.length)]);duplicates-=12;restored++;}}
 results.push({events:n,firstSSR,restored});}return results;})()`,c);
const stats=k=>{const x=results.map(r=>r[k]).filter(v=>k!=='firstSSR'||v>0).sort((a,b)=>a-b);return {median:x[Math.floor(x.length*.5)],p90:x[Math.floor(x.length*.9)],min:x[0],max:x.at(-1)};};
const firstRoute=[];
for(let seed=1;seed<=1000;seed++){
 let now=1800000000000,taps=0,pt=0;const o=Watch.create(now,seed);Watch.normalize(o);
 while(!o.unlocked.includes('photo')&&taps<1000){now+=500;taps++;pt++;
 let result;if(o.pending?.rarity){const [x,y]=Watch.TARGETS[o.mode][o.pending.rarity][0];result=Watch.suppress(o,now,{x,y});}else result=Watch.tap(o,now);
 if(result)pt+=result.record.reward;
 const cost=Watch.unlock(o,'photo',pt);if(cost!==null)pt-=cost;
 }firstRoute.push(taps);
}
firstRoute.sort((a,b)=>a-b);
const report={trials:1000,assumptions:['Every anomaly is manually completed; no missed observations or failed contacts.','Every eligible duplicate reconstruction is claimed immediately.','No upgrades, passive income, free draws or starting currency.','Timing is not a measurement of real players.'],observationOdds:Watch.ODDS[0],incursionRarity:[60,28,10,2],incursionSingleOpenUntilFirst:9,incursionSingleOpenAfterSuppression:11,firstPhotoUnlockTaps:{median:firstRoute[499],p90:firstRoute[899]},firstNaturalSSRConditional:stats('firstSSR'),noNaturalSSRBeforeCompletion:results.filter(r=>r.firstSSR===0).length,fullCollectionEncounters:stats('events'),restoredRecords:stats('restored')};
fs.writeFileSync('docs/qa-incursions/incursion-balance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
