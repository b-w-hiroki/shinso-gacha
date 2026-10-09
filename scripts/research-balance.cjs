// Ideal consecutive collections; no missed windows, upgrades purchases or income simulation.
const M=require('../assets/observation-model'),fs=require('node:fs');
const samples=10000,rows=[];
for(const sensitivity of [0,1,2])for(const research of [false,true]){
 const values=[];let totalStudies=0;
 for(let seed=1;seed<=samples;seed++){
  const o=M.normalize(M.create(0,seed));o.upgrades.sensitivity=sensitivity;
  let n=0;
  while(M.setProgress(o,'cctv')<4&&n<10000){const rarity=M.roll(o,n++);o.collection['cctv:'+rarity]++;if(research){const r=M.researchStatus(o,'cctv');if(r.ready){M.research(o,'cctv',r.spent);totalStudies++;}}}
  values.push(n);
 }
 values.sort((a,b)=>a-b);
 rows.push({sensitivity,research,samples,medianCollections:values[Math.floor(samples*.5)],p90Collections:values[Math.floor(samples*.9)],maxCollections:values.at(-1),meanResearchUses:totalStudies/samples});
}
const result={assumptions:'One medium, consecutive claimed records, no missed windows; not a measured retention or economy result.',cost:M.RESEARCH_COST,rows};
fs.writeFileSync('docs/qa-incursions/research-balance.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
