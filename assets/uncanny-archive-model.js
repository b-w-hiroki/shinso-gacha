/* Fictional archive anomalies: all effects are additive, reversible, and non-destructive. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.UncannyArchive=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
 const chance=(key,percent)=>hash(key)%100<percent;
 function state(raw,levels){
  const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  for(const k of ['noticed','restored','letters','reopened','reads']){
   const v=s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k])?s[k]:{};
   s[k]=Object.fromEntries(Object.keys(levels||{}).filter(id=>/^u(?:[1-9]|1[0-2])$/.test(id)&&levels[id]>0&&v[id]===true).map(id=>[id,true]));
  }
  return s;
 }
 function events(id,level,layer,concluded){
  if(!/^u(?:[1-9]|1[0-2])$/.test(id)||level<=0)return null;
  // Deterministic story gates, not extra paid gacha or reward rolls.
  return {missing:level>=2&&chance('missing:'+id,35),read:level>=1&&chance('read:'+id,40),
   letter:level>=3&&!!layer?.noticed,vanish:level>=3&&!!layer?.noticed&&chance('vanish:'+id,50),
   reopened:!!concluded&&!!layer?.compared&&chance('reopen:'+id,60)};
 }
 function record(s,id,key,allowed){
  if(!allowed||!['noticed','restored','letters','reopened','reads'].includes(key)||s[key][id])return false;
  s[key][id]=true;return true;
 }
 return {state,events,record};
});