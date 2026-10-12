/* Read-only links between future reports that the player has actually
 * acquired and verified through later observations. Never reveals other cases. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ForecastChain=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>({
 links(currentId,reports){
  if(!Array.isArray(reports))return [];
  const owned=reports.filter(x=>x&&/^u(?:[1-9]|1[0-2])$/.test(x.id)&&
   ['cctv','photo','vision','dash'].includes(x.mode)&&
   x.status==='compared'&&[0,1,2,3].includes(x.rarity));
  const current=owned.find(x=>x.id===currentId);if(!current)return [];
  const visited=new Set();
  return owned.filter(x=>x.id!==current.id&&x.mode===current.mode&&!visited.has(x.id)&&visited.add(x.id)).slice(0,3).map(x=>({
   id:x.id,rarity:x.rarity,
   note:x.rarity===current.rarity?'別々に回収した映像が、同じ観測区分で受領されている。受付番号の前後関係が説明できない。':
    '同じ観測方式の記録なのに、回収された区分は一致しない。どちらの未来報告も訂正されていない。'
  }));
 }
}));