/* V1.1 investigation layers are additive projections, never edits to source evidence. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LegendLayers=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const names=['記述の揺らぎ','証言の食い違い','関連事件'];
 const hash=str=>{let h=2166136261;for(const ch of str){h=Math.imul(h^ch.charCodeAt(0),16777619);}return h>>>0;};
 function normalize(raw,levels,cases){
  const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  for(const name of ['noticed','compared','linked']){
   const v=s[name]&&typeof s[name]==='object'&&!Array.isArray(s[name])?s[name]:{};
   s[name]=Object.fromEntries(Object.keys(cases).filter(id=>Number(levels?.[id])>=3&&v[id]===true).map(id=>[id,true]));
  }
  return s;
 }
 function status(s,id,levels,cases,observed,discovered,profile,testified){
  const c=cases[id],n=Math.min(3,Math.max(0,Math.floor(Number(levels?.[id])||0)));
  if(!c||n===0)return null;
  const proof=n===3&&(Object.keys(observed||{}).some(k=>k.startsWith(c.mode+':')&&observed[k]>0)||Object.keys(discovered||{}).some(k=>discovered[k]===true&&c.families.includes(profile(Number(k)).family)));
  const related=Object.keys(discovered||{}).map(Number).filter(k=>discovered[k]===true&&Number.isInteger(k)&&k>=0&&k<100&&c.families.includes(profile(k).family));
  const altered=n===3&&!!proof;
  const contradictions=altered&&testified?.[id]===true;
  const chain=contradictions&&related.length>=3;
  return {n,altered,contradictions,chain,related:related.slice(0,3),noticed:!!s.noticed[id],compared:!!s.compared[id],linked:!!s.linked[id]};
 }
 function variant(id,c){const v=hash(id)%3;return [
  ['確認された', '記録された'],
  ['一名', 'もう一名'],
  ['一致する', '一致しない']
 ][v];}
 function revised(id,c){const a=variant(id,c);return c.fragments[0][1]+' ／ 追記：'+a[0]+'はずの記載が、現在は「'+a[1]+'」となっている。';}
 function discrepancy(id,c){return '担当者の証言「'+c.witness+'」と、断片3「'+c.fragments[2][1]+'」は、同一の状況を説明していない。';}
 function mark(s,id,kind,eligible){if(!eligible||!['noticed','compared','linked'].includes(kind)||s[kind][id])return false;s[kind][id]=true;return true;}
 return {names,normalize,status,revised,discrepancy,mark};
});