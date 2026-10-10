/* Absence trace: story-only, deterministic and capped; never changes the observation roll. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AbsenceTraces=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const CLUES={cctv:'記録の右端に、設置時にはなかった窓が映っている。',photo:'撮影者の欄だけが、あとから埋められている。',vision:'映像の最後に、こちらを見ている影が残っている。',dash:'別の道路でも見た標識が、同じ角度で写っている。'};
 const valid=t=>Number.isFinite(t)&&t>0;
 function encounter(raw,mode,from,to){
  if(!Object.hasOwn(CLUES,mode)||!valid(from)||!valid(to)||to<=from)return null;
  const elapsed=to-from;if(elapsed<60*60*1000)return null;
  const day=new Date(to).toISOString().slice(0,10),key=day+':'+mode;
  if((raw||[]).some(x=>x&&x.key===key))return null;
  return {key,mode,at:to,elapsed,text:CLUES[mode]};
 }
 function insert(raw,trace){const items=Array.isArray(raw)?raw.filter(x=>x&&typeof x.key==='string'&&Object.hasOwn(CLUES,x.mode)&&valid(x.at)).slice(-7):[];if(!trace||items.some(x=>x.key===trace.key))return items;return [...items,trace].slice(-8);}
 return {encounter,insert};
});