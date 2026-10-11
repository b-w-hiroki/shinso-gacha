/* Mutable hypothesis reports are player-authored projections; collected originals remain immutable. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ResearchReports=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const valid=id=>/^u(?:[1-9]|1[0-2])$/.test(id);
 const own=(id,levels)=>valid(id)&&Number(levels?.[id])>=3;
 const clean=text=>String(text??'').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,'').slice(0,280);
 const goodChoice=n=>[0,1,2].includes(n);
 function normalize(raw,levels){
  const s={version:1,files:{}};
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
  for(const id of Object.keys(raw.files||{})){
   if(!own(id,levels))continue;
   const file=raw.files[id];if(!file||typeof file!=='object'||Array.isArray(file))continue;
   const history=Array.isArray(file.history)?file.history:[];
   const revisions=history.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)&&goodChoice(x.choice)&&Number.isFinite(x.at)&&x.at>=0).map(x=>({choice:x.choice,note:clean(x.note),at:x.at})).slice(-20);
   if(revisions.length)s.files[id]={history:revisions};
  }
  return s;
 }
 function save(raw,levels,id,choice,note,at){
  const state=normalize(raw,levels);
  if(!own(id,levels)||!goodChoice(choice)||!Number.isFinite(at)||at<0)return {state,changed:false};
  const text=clean(note);
  const prev=state.files[id]?.history.at(-1);
  if(prev&&prev.choice===choice&&prev.note===text)return {state,changed:false};
  const history=(state.files[id]?.history||[]).slice(-19);
  history.push({choice,note:text,at});
  state.files[id]={history};
  return {state,changed:true};
 }
 function inspect(raw,levels,id){
  if(!own(id,levels))return null;
  const s=normalize(raw,levels),history=s.files[id]?.history||[];
  return {latest:history.at(-1)||null,revisions:history.length,history:history.slice().reverse()};
 }
 return {clean,normalize,save,inspect};
});