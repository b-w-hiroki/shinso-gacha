/* Earned-only cross-site evidence. The two independent observation records remain unchanged. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LocationCorrelations=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const PAIRS=[
  {id:'cctv-photo',sites:['alt:cctv','alt:photo'],record:'通行者の照会番号が、閉鎖された教室の出席票にも使われている。どちらの原本にも訂正履歴はない。'},
  {id:'cctv-vision',sites:['alt:cctv','alt:vision'],record:'地下通路の退出受付と踏切前の目撃報告が、同じ立会印で受理されている。担当者欄は両方とも空白。'},
  {id:'cctv-dash',sites:['alt:cctv','alt:dash'],record:'地下通路の定点監視と海沿いの走行記録に、ひとつの記録媒体番号が付いている。機器の移設届はない。'},
  {id:'photo-vision',sites:['alt:photo','alt:vision'],record:'夜の教室の点呼票と踏切前の目撃者欄に、同一の欠番が残されている。どちらもその人数を数えていない。'},
  {id:'photo-dash',sites:['alt:photo','alt:dash'],record:'夜の教室の消灯報告と海沿いの車載記録が、同じ時刻を「現地到着」と記している。どちらも無人だった。'},
  {id:'vision-dash',sites:['alt:vision','alt:dash'],record:'踏切前の通過台数と海沿いの車載ログは同じ管理番号で保管されている。撮影時刻は一致しない。'}
 ];
 const knownIds=new Set(['alt:cctv','alt:photo','alt:vision','alt:dash']);
 function earned(discovered){
  const out=new Map();
  for(const item of Array.isArray(discovered)?discovered:[]){
   if(!item||!knownIds.has(item.id)||!Number.isFinite(Number(item.visits))||Number(item.visits)<=0)continue;
   out.set(item.id,item);
  }
  return out;
 }
 function inspect(discovered,pairId){
  const sites=earned(discovered),pair=PAIRS.find(x=>x.id===pairId);
  if(!pair||!pair.sites.every(id=>sites.has(id)))return null;
  const [left,right]=pair.sites.map(id=>sites.get(id));
  const rarity=[1,2,3].find(r=>Number(left.rarities?.[r])>0&&Number(right.rarities?.[r])>0);
  return {id:pair.id,left,right,record:pair.record,rarity:rarity||null,
   afterword:rarity?'異変の段階まで一致している。受付番号だけが違う。':'平常の記録にも、すでに同じ書類番号が使われている。'};
 }
 function list(discovered,id){
  if(id!==undefined&&!knownIds.has(id))return [];
  return PAIRS.map(x=>inspect(discovered,x.id)).filter(x=>x&&(id===undefined||x.left.id===id||x.right.id===id));
 }
 return {inspect,list};
});
