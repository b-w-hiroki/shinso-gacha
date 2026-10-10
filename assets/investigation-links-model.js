/* Reappraisal and joint reports only use acquired dossiers; source files are unchanged. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.InvestigationLinks=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const valid=id=>/^u(?:[1-9]|1[0-2])$/.test(id);
 const owned=(id,levels)=>valid(id)&&Number(levels?.[id])>=3;
 const pair=(a,b)=>[a,b].sort().join(':');
 function links(id,levels,cases){
  if(!owned(id,levels)||!cases[id])return [];
  return Object.keys(cases).filter(other=>other!==id&&owned(other,levels)&&cases[other].families.some(f=>cases[id].families.includes(f))).sort();
 }
 function normalize(raw,levels,cases,conclusions){
  const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const revised=s.reappraised&&typeof s.reappraised==='object'&&!Array.isArray(s.reappraised)?s.reappraised:{};
  const joint=s.joint&&typeof s.joint==='object'&&!Array.isArray(s.joint)?s.joint:{};
  s.reappraised=Object.fromEntries(Object.keys(cases).filter(id=>owned(id,levels)&&revised[id]===true).map(id=>[id,true]));
  s.joint=Object.fromEntries(Object.keys(joint).filter(key=>{const ids=key.split(':');return ids.length===2&&ids.every(id=>owned(id,levels))&&links(ids[0],levels,cases).includes(ids[1])&&joint[key]===true;}).map(key=>[key,true]));
  const source=s.revisions&&typeof s.revisions==='object'&&!Array.isArray(s.revisions)?s.revisions:{};
  s.revisions=Object.fromEntries(Object.keys(cases).filter(id=>owned(id,levels)&&[0,1].includes(conclusions?.[id])).map(id=>[id,validRevisions(source[id],conclusions[id])]).filter(([,entries])=>entries.length));
  return s;
 }
 function reappraise(s,id,levels,cases,noticed){if(!owned(id,levels)||!noticed||s.reappraised[id])return false;s.reappraised[id]=true;return true;}
 function combine(s,a,b,levels,cases){if(!links(a,levels,cases).includes(b)||s.joint[pair(a,b)])return false;s.joint[pair(a,b)]=true;return true;}
 function validRevisions(raw,initial){
  if(!Array.isArray(raw)||![0,1].includes(initial))return [];
  const seen=new Set(),entries=[];let last=initial;
  for(const entry of raw){
   if(!entry||!['compared','linked'].includes(entry.basis)||![0,1].includes(entry.choice)||seen.has(entry.basis)||last===entry.choice)continue;
   entries.push({basis:entry.basis,choice:entry.choice});seen.add(entry.basis);last=entry.choice;
   if(entries.length===2)break;
  }
  return entries;
 }
 function report(id,levels,cases,conclusions,s,layer){
  if(!owned(id,levels)||!cases[id])return null;
  const related=links(id,levels,cases).filter(other=>s.joint?.[pair(id,other)]);
  const initial=[0,1].includes(conclusions?.[id])?conclusions[id]:null;
  const revisions=validRevisions(s.revisions?.[id],initial);
  const hypothesis=revisions.length?revisions[revisions.length-1].choice:initial;
  const used=new Set(revisions.map(v=>v.basis));
  const revisionBasis=initial===null?null:layer?.compared&&!used.has('compared')?'compared':layer?.linked&&!used.has('linked')?'linked':null;
  return {id,fragments:3,hypothesis,initialHypothesis:initial,revisions,revisionBasis,reappraised:!!s.reappraised?.[id],related,contradiction:!!layer?.compared,chain:!!layer?.linked};
 }
 function revise(s,id,choice,basis,levels,cases,conclusions,layer){
  const current=report(id,levels,cases,conclusions,s,layer);
  if(!current||current.revisionBasis!==basis||![0,1].includes(choice)||current.hypothesis===choice)return false;
  if(!s.revisions)s.revisions={};
  s.revisions[id]=[...current.revisions,{basis,choice}];
  return true;
 }
 return {links,normalize,reappraise,combine,report,revise,pair};
});