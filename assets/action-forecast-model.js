/* Fictional forecasts are deterministic projections and never drive real controls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ActionForecastModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const ACTIONS=Object.freeze([
  Object.freeze({id:'observe',label:'映像に触れる'}),
  Object.freeze({id:'rest',label:'回線を切る'}),
  Object.freeze({id:'colleagues',label:'課内で話す'})
 ]);
 function hash(text,seed=2166136261){let n=seed>>>0;for(const c of String(text))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;}
 function validEvent(event){return !!event&&Number.isInteger(event.id)&&event.id>=0&&typeof event.key==='string'&&event.key.length>0&&Number.isFinite(event.start)&&Number.isFinite(event.end)&&event.end>event.start;}
 function project(event,{now,visible=false,quiet=false,monitorOpen=false,modal=false}={}){
  if(!validEvent(event)||!Number.isFinite(now)||now<event.start||now>=event.end||!visible||quiet||!monitorOpen||modal)return null;
  const action=ACTIONS[hash(event.key,Math.imul(event.id+1,2654435761))%ACTIONS.length];
  return {key:`${event.id}:${event.key}:${event.start}`,action:action.id,label:action.label};
 }
 function settle(prediction,actual){
  if(!prediction||!ACTIONS.some(action=>action.id===prediction.action))return null;
  const action=ACTIONS.find(candidate=>candidate.id===actual);if(!action)return null;
  return {key:prediction.key,predicted:prediction.action,actual:action.id,actualLabel:action.label,matched:prediction.action===action.id};
 }
 return {ACTIONS,hash,project,settle};
});
