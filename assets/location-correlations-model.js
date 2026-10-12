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
 /* Three actual independently acquired anomalous locations create one
  * fictional cross-source discrepancy; no extra reward or game state.
  * Read-only; every returned site must be an acquired original. */
 function triad(discovered,selectedId){
  if(!knownIds.has(selectedId))return null;
  const records=earned(discovered);
  const current=records.get(selectedId);
  if(!current||![1,2,3].some(r=>Number(current.rarities?.[r])>0))return null;
  const candidates=Array.from(records.values()).filter(item=>
   [1,2,3].some(r=>Number(item.rarities?.[r])>0));
  if(candidates.length<3)return null;
  const sites=[current,...candidates.filter(item=>item.id!==selectedId)].slice(0,3);
  const rarities=sites.map(site=>[1,2,3].find(r=>Number(site.rarities?.[r])>0));
  const sameStage=new Set(rarities).size===1;
  return {
   sites:sites.map((site,index)=>({id:site.id,title:site.title,source:site.source,file:site.file,rarity:rarities[index]})),
   title:'三地点に残る同じ欠番',
   record:sameStage
    ?'離れた三地点が、同じ段階の異変として保管されている。照会簿では三件とも一つの空欄にまとめられていた。'
    :'異なる段階で取得された三地点の映像が、一つの欠番で照会されている。原本の区分は食い違っている。',
   warning:'原本は別々に回収された。照会者と照会理由は記録されていない。'
  };
 }
 return {inspect,list,triad};
});
