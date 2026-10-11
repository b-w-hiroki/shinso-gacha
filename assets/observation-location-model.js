/* Collect individual places without changing the four existing media or their rarity rolls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchLocations=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const scenes={
  cctv:{id:'alt:cctv',mode:'cctv',title:'地下通路',source:'CAM 12',file:'cctv-underground-upgraded.webp'},
  photo:{id:'alt:photo',mode:'photo',title:'夜の教室',source:'PHOTO 18',file:'photo-classroom-upgraded.webp'},
  vision:{id:'alt:vision',mode:'vision',title:'踏切前',source:'LINK 15',file:'vision-crossing-upgraded.webp'},
  dash:{id:'alt:dash',mode:'dash',title:'海沿いの夜道',source:'DRIVE 19',file:'dash-coast-road-upgraded.webp'}
 };
 const safeInt=n=>Number.isSafeInteger(n)&&n>=0?n:0;
 function current(mode,rarity,sequence){
  return Object.hasOwn(scenes,mode)&&rarity===0&&Number.isSafeInteger(sequence)&&sequence>=0&&sequence%2===1?scenes[mode]:null;
 }
 function normalize(raw){
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},result={};
  for(const scene of Object.values(scenes)){const item=source[scene.id];if(!item||typeof item!=='object')continue;
   const visits=Math.min(999999,safeInt(item.visits));if(!visits)continue;
   result[scene.id]={visits,lastSequence:safeInt(item.lastSequence),firstAt:safeInt(item.firstAt)};
  }
  return result;
 }
 function observe(o,record){
  const scene=current(record?.mode,record?.rarity,record?.sequence);if(!scene||!o||typeof o!=='object')return false;
  const data=normalize(o.locationRecords),prior=data[scene.id],seq=record.sequence;
  if(prior&&seq<=prior.lastSequence)return false;
  data[scene.id]={visits:Math.min(999999,(prior?.visits||0)+1),lastSequence:seq,firstAt:prior?.firstAt||safeInt(record.readyAt)};
  o.locationRecords=data;return true;
 }
 function discovered(raw){const state=normalize(raw);return Object.values(scenes).filter(s=>state[s.id]).map(s=>({...s,...state[s.id]}));}
 function byId(id){return Object.values(scenes).find(s=>s.id===id)||null;}
 return {current,normalize,observe,discovered,byId};
});
