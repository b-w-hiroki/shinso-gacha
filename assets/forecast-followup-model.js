/* A fictional next-day report is compared only with a real later collected observation.
 * Forecasts do not alter routes, rarity, odds, rewards, or monitor timing. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ForecastFollowup=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const MODES=['cctv','photo','vision','dash'];
 const CASE_IDS=Array.from({length:12},(_,i)=>'u'+(i+1));
 const validId=id=>CASE_IDS.includes(id);
 const validMode=id=>MODES.includes(id);
 const finite=n=>Number.isFinite(n)&&n>=0;
 const validSequence=n=>Number.isSafeInteger(n)&&n>=0;
 const dateLabel=time=>{const date=new Date(time);return Number.isFinite(date.getTime())?date.toLocaleDateString('ja-JP'):'日時不明';};
 const MAX_RECHECKS=3; // Bounded: do not turn a fictional report into a progress counter.
 const dayStart=time=>{const d=new Date(time);d.setHours(0,0,0,0);return d.getTime();};
 function normalize(input){
  const out={version:1,entries:{}};
  if(!input||typeof input!=='object'||Array.isArray(input))return out;
  for(const id of CASE_IDS){
   const x=input.entries?.[id];
   if(!x||typeof x!=='object'||Array.isArray(x)||!validMode(x.mode)||!finite(x.issuedAt))continue;
   const issuedAt=Number(x.issuedAt);
   const row={mode:x.mode,issuedAt};
   if(finite(x.observedAt)&&Number(x.observedAt)>issuedAt&&dayStart(Number(x.observedAt))>dayStart(issuedAt)&&[0,1,2,3].includes(x.rarity)){
    row.observedAt=Number(x.observedAt);row.rarity=x.rarity;
    if(validSequence(x.firstSequence))row.firstSequence=x.firstSequence;
    const seen=new Set(row.firstSequence===undefined?[]:[row.firstSequence]);
    const rechecks=[];
    if(Array.isArray(x.rechecks))for(const recheck of x.rechecks){
     if(!recheck||typeof recheck!=='object'||!validSequence(recheck.sequence)||seen.has(recheck.sequence)||
        !finite(recheck.observedAt)||Number(recheck.observedAt)<=row.observedAt||
        ![0,1,2,3].includes(recheck.rarity))continue;
     seen.add(recheck.sequence);
     rechecks.push({sequence:recheck.sequence,observedAt:Number(recheck.observedAt),rarity:recheck.rarity});
     if(rechecks.length===MAX_RECHECKS)break;
    }
    if(rechecks.length)row.rechecks=rechecks;
   }
   out.entries[id]=row;
  }
  return out;
 }
 function issue(raw,id,mode,time){
  const state=normalize(raw),now=Number(time);
  if(!validId(id)||!validMode(mode)||!finite(now)||state.entries[id])return {state,changed:false};
  state.entries[id]={mode,issuedAt:now};
  return {state,changed:true};
 }
 function collect(raw,record,time){
  const state=normalize(raw),now=Number(time);
  if(!record||!validMode(record.mode)||![0,1,2,3].includes(record.rarity)||!finite(now))return {state,matched:[],updated:false};
  const matched=[];let updated=false;
  for(const id of CASE_IDS){
   const entry=state.entries[id];
   if(!entry||entry.mode!==record.mode||now<=entry.issuedAt||dayStart(now)<=dayStart(entry.issuedAt))continue;
   if(entry.observedAt===undefined){
    entry.observedAt=now;entry.rarity=record.rarity;
    if(validSequence(record.sequence))entry.firstSequence=record.sequence;
    matched.push(id);updated=true;continue;
   }
   // Actual later collected observations add a short, non-rewarding evidence trail.
   // Repeated callbacks for the same saved observation cannot append duplicates.
   const sequence=record.sequence,history=entry.rechecks||[];
   if(!validSequence(sequence)||sequence===entry.firstSequence||
      (entry.firstSequence!==undefined&&sequence<=entry.firstSequence)||
      now<=entry.observedAt||history.length>=MAX_RECHECKS||
      history.some(x=>x.sequence===sequence))continue;
   entry.rechecks=[...history,{sequence,observedAt:now,rarity:record.rarity}];
   updated=true;
  }
  return {state,matched,updated};
 }
 function inspect(raw,id){
  const state=normalize(raw),x=state.entries[id];
  if(!validId(id)||!x)return null;
  const issued=dateLabel(x.issuedAt);
  if(x.observedAt===undefined)return {id,status:'pending',issued,mode:x.mode,copy:'翌日以降の観測記録を待っています。確かめるまでは、予告が現実になるとは限りません。'};
  const observed=dateLabel(x.observedAt);
  const rechecks=(x.rechecks||[]).map(row=>({
   observed:dateLabel(row.observedAt),
   rarity:row.rarity,
   copy:row.rarity===x.rarity?'同じ方式・同じ区分で記録された。しかし前の受領番号は訂正されていない。'
    :row.rarity>0?'前の記録とは異なり、映像に異変が残った。照合欄の結論は更新されていない。'
    :'前の記録とは異なり、映像は平常だった。照合欄の結論は更新されていない。'
  }));
  return {id,status:'compared',issued,observed,mode:x.mode,rarity:x.rarity,rechecks,
   copy:x.rarity>0?'予告された方式の映像から、異変を回収しました。ただし、予告された内容と同じ現象とは断定できません。':'同じ方式の映像は平常でした。なのに、翌日報告書の確認済み欄には受領印が残っています。'};
 }
 return {normalize,issue,collect,inspect,dayStart};
});
