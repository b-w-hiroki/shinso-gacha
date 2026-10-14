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
  const stage=level;
  // Undefined and NaN must remain locked: comparing with <=0 is insufficient.
  if(!/^u(?:[1-9]|1[0-2])$/.test(id)||!Number.isInteger(stage)||stage<1)return null;
  // Deterministic story gates, not extra paid gacha or reward rolls.
  return {missing:stage>=2&&chance('missing:'+id,35),read:stage>=1&&chance('read:'+id,40),
   letter:stage>=3&&layer?.noticed===true,vanish:stage>=3&&layer?.noticed===true&&chance('vanish:'+id,50),
   reopened:stage>=3&&concluded===true&&layer?.compared===true&&chance('reopen:'+id,60)};
 }
 function record(s,id,key,allowed){
  if(!/^u(?:[1-9]|1[0-2])$/.test(id)||allowed!==true||
    !['noticed','restored','letters','reopened','reads'].includes(key)||
    !s||typeof s!=='object'||!Object.hasOwn(s,key)||
    !s[key]||typeof s[key]!=='object'||s[key][id]===true)return false;
  s[key][id]=true;return true;
 }
 return {state,events,record};
});