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
 },
 /* The three-file stamp appears only after each separate case has been owned
  * and its later observation actually collected. No new progress counter. */
 pattern(currentId,reports){
  if(!Array.isArray(reports))return null;
  const ids=new Set(),valid=[];
  for(const row of reports){
   if(!row||!/^u(?:[1-9]|1[0-2])$/.test(row.id)||
     !['cctv','photo','vision','dash'].includes(row.mode)||
     row.status!=='compared'||![0,1,2,3].includes(row.rarity)||ids.has(row.id))continue;
   ids.add(row.id);valid.push(row);
  }
  const current=valid.find(row=>row.id===currentId);
  if(!current)return null;
  const related=valid.filter(row=>row.mode===current.mode);
  if(related.length<3)return null;
  const picked=related.slice(0,4),uniform=new Set(picked.map(row=>row.rarity)).size===1;
  const entries=picked.map(row=>({
   id:row.id,
   type:row.rarity===0?'平常':row.rarity===1?'R':row.rarity===2?'SR':'SSR',
   observed:typeof row.observed==='string'?row.observed.slice(0,32):''
  }));
  return {
   title:'重なった三つの受領印',
   conclusion:uniform
    ?'別々の調査から回収された三件以上の映像が、同じ区分のまま受領されている。原本の事件番号は一致しない。'
    :'別々の調査から同じ観測方式の記録が三件以上届いた。判定区分は食い違うが、いずれも受領済みのまま残されている。',
   notice:'照会番号の発行者欄は空白。調査員は結論を確定していない。',
   entries
  };
 }
}));