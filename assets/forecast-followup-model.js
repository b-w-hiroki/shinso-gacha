/* A fictional next-day report is compared only with a real later collected observation.
 * Forecasts do not alter routes, rarity, odds, rewards, or monitor timing. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ForecastFollowup=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const MODES=['cctv','photo','vision','dash'];
 const CASE_IDS=Array.from({length:12},(_,i)=>'u'+(i+1));
 const validId=id=>CASE_IDS.includes(id);
 const validMode=id=>MODES.includes(id);
 const finite=n=>Number.isFinite(n)&&n>=0;
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
  if(!record||!validMode(record.mode)||![0,1,2,3].includes(record.rarity)||!finite(now))return {state,matched:[]};
  const matched=[];
  for(const id of CASE_IDS){
   const entry=state.entries[id];
   if(!entry||entry.observedAt!==undefined||entry.mode!==record.mode||now<=entry.issuedAt||dayStart(now)<=dayStart(entry.issuedAt))continue;
   entry.observedAt=now;entry.rarity=record.rarity;matched.push(id);
  }
  return {state,matched};
 }
 function inspect(raw,id){
  const state=normalize(raw),x=state.entries[id];
  if(!validId(id)||!x)return null;
  const issued=new Date(x.issuedAt).toLocaleDateString('ja-JP');
  if(x.observedAt===undefined)return {id,status:'pending',issued,mode:x.mode,copy:'翌日以降の観測記録を待っています。確かめるまでは、予告が現実になるとは限りません。'};
  const observed=new Date(x.observedAt).toLocaleDateString('ja-JP');
  return {id,status:'compared',issued,observed,mode:x.mode,rarity:x.rarity,
   copy:x.rarity>0?'予告された方式の映像から、異変を回収しました。ただし、予告された内容と同じ現象とは断定できません。':'同じ方式の映像は平常でした。なのに、翌日報告書の確認済み欄には受領印が残っています。'};
 }
 return {normalize,issue,collect,inspect,dayStart};
});