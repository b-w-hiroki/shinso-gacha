/* Shared boundaries for persisted data, HTML text, and layout scheduling. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RuntimeSafety=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const blocked=new Set(['__proto__','constructor','prototype']);
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 function clean(v,depth=0){
  if(depth>32)return null;
  if(Array.isArray(v))return v.slice(0,10000).map(x=>clean(x,depth+1));
  if(object(v)){const out={};for(const [k,x] of Object.entries(v))if(!blocked.has(k))out[k]=clean(x,depth+1);return out;}
  return typeof v==='number'&&!Number.isFinite(v)?0:v;
 }
 function state(raw,defaults,ids){
  if(!object(raw))return {...defaults};
  const s=Object.assign({},defaults,clean(raw)),valid=new Set(ids);
  for(const k of ['currency','pulls','clicks','lastTick','updatedAt','tcount','pursuerNo'])if(k in s)s[k]=Math.max(0,Number.isFinite(Number(s[k]))?Number(s[k]):0);
  for(const k of ['levels','missions','tby','tstat','ups','pity','research'])if(k in s&&!object(s[k]))s[k]={};
  for(const [id,n] of Object.entries(s.levels))if(!valid.has(id))delete s.levels[id];else s.levels[id]=Math.max(0,Math.min(5,Math.floor(Number(n)||0)));
  if('tlog' in s)s.tlog=Array.isArray(s.tlog)?s.tlog.filter(t=>object(t)&&valid.has(t.id)).map(t=>({...t,rar:['n','r','x'].includes(t.rar)?t.rar:'n',text:String(t.text??''),no:Math.max(0,Math.floor(Number(t.no)||0))})):[];
  return s;
 }
 const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function frame(fn,request=cb=>requestAnimationFrame(cb)){let queued=false;return ()=>{if(queued)return;queued=true;request(()=>{queued=false;fn();});};}
 return {clean,state,html,frame};
});
