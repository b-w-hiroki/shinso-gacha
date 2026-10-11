/* Collect individual places without changing the four existing media or their rarity rolls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchLocations=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const scenes={
  cctv:{id:'alt:cctv',mode:'cctv',title:'地下通路',source:'CAM 12',file:'cctv-underground-upgraded.webp',notes:['無人の地下通路','通路に残る足跡','出口の向こうの立会者','存在しない階段']},
  photo:{id:'alt:photo',mode:'photo',title:'夜の教室',source:'PHOTO 18',file:'photo-classroom-upgraded.webp',notes:['灯りの消えた教室','誰も座らない席','黒板にない人影','出席番号の増殖']},
  vision:{id:'alt:vision',mode:'vision',title:'踏切前',source:'LINK 15',file:'vision-crossing-upgraded.webp',notes:['遮断機の手前','踏切の向こうの影','数の合わない横断者','後ろから見ている者']},
  dash:{id:'alt:dash',mode:'dash',title:'海沿いの夜道',source:'DRIVE 19',file:'dash-coast-road-upgraded.webp',notes:['海沿いの走行記録','路肩の白い影','背後に続く灯り','対向車線に残る人影']}
 };
 const safeInt=n=>Number.isSafeInteger(n)&&n>=0?n:0;
 function current(mode,rarity,sequence){
  return Object.hasOwn(scenes,mode)&&[0,1,2,3].includes(rarity)&&Number.isSafeInteger(sequence)&&sequence>=0&&sequence%2===1?scenes[mode]:null;
 }
 function normalize(raw){
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},result={};
  for(const scene of Object.values(scenes)){const item=source[scene.id];if(!item||typeof item!=='object')continue;
   const visits=Math.min(999999,safeInt(item.visits));if(!visits)continue;
   const rawR=item.rarities&&typeof item.rarities==='object'&&!Array.isArray(item.rarities)?item.rarities:null;
   const rarities=Object.fromEntries([0,1,2,3].filter(r=>safeInt(rawR?.[r])>0).map(r=>[r,Math.min(999999,safeInt(rawR[r]))]));
   if(!rawR)rarities[0]=visits; // Existing location saves were all ordinary footage.
   result[scene.id]={visits,lastSequence:safeInt(item.lastSequence),firstAt:safeInt(item.firstAt),rarities};
  }
  return result;
 }
 function observe(o,record){
  const scene=current(record?.mode,record?.rarity,record?.sequence);if(!scene||!o||typeof o!=='object')return false;
  const data=normalize(o.locationRecords),prior=data[scene.id],seq=record.sequence;
  if(prior&&seq<=prior.lastSequence)return false;
  const rarities={...(prior?.rarities||{})};rarities[record.rarity]=Math.min(999999,(rarities[record.rarity]||0)+1);
  data[scene.id]={visits:Math.min(999999,(prior?.visits||0)+1),lastSequence:seq,firstAt:prior?.firstAt||safeInt(record.readyAt),rarities};
  o.locationRecords=data;return true;
 }
 function discovered(raw){const state=normalize(raw);return Object.values(scenes).filter(s=>state[s.id]).map(s=>({...s,...state[s.id]}));}
 function byId(id){return Object.values(scenes).find(s=>s.id===id)||null;}
 const overlay=(mode,rarity)=>Object.hasOwn(scenes,mode)&&[1,2,3].includes(rarity)?'assets/observation/alt-overlays/'+mode+'-'+rarity+'.svg':null;
 return {current,normalize,observe,discovered,byId,overlay};
});
