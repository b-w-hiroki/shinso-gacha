/* Collect individual places without changing the four existing media or their rarity rolls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchLocations=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const scenes={
  cctv:{id:'alt:cctv',mode:'cctv',title:'地下通路',source:'CAM 12',file:'cctv-underground-native.webp',notes:['無人の地下通路','通路に残る足跡','出口の向こうの立会者','存在しない階段']},
  photo:{id:'alt:photo',mode:'photo',title:'夜の教室',source:'PHOTO 18',file:'photo-classroom-native.webp',notes:['灯りの消えた教室','誰も座らない席','黒板にない人影','出席番号の増殖']},
  vision:{id:'alt:vision',mode:'vision',title:'踏切前',source:'LINK 15',file:'vision-crossing-native.webp',notes:['遮断機の手前','踏切の向こうの影','数の合わない横断者','後ろから見ている者']},
  dash:{id:'alt:dash',mode:'dash',title:'海沿いの夜道',source:'DRIVE 19',file:'dash-coast-road-native.webp',notes:['海沿いの走行記録','路肩の白い影','背後に続く灯り','対向車線に残る人影']}
 };
 /* Independent native-frame tap geometry for each new location and rarity.
  * The illustrated centers remain at the existing overlay SVG data-hotspots;
  * contact radii are authored for these scenes, not inherited from older media. */
 const TARGETS={
  cctv:{1:[[.51,.34,.16,.22]],2:[[.66,.64,.19,.20]],3:[[.22,.65,.20,.21]]},
  photo:{1:[[.40,.36,.14,.16]],2:[[.70,.82,.24,.19]],3:[[.59,.065,.16,.13]]},
  vision:{1:[[.50,.28,.17,.13]],2:[[.28,.38,.13,.17],[.54,.36,.12,.16],[.76,.36,.13,.17]],3:[[.28,.44,.14,.21],[.77,.44,.14,.21]]},
  dash:{1:[[.20,.29,.14,.16]],2:[[.43,.42,.18,.19]],3:[[.59,.54,.21,.19]]}
 };
 const targets=(mode,rarity)=>Object.hasOwn(TARGETS,mode)&&[1,2,3].includes(rarity)?TARGETS[mode][rarity]:null;
 /* Keep the complete 2:1 photograph and anomaly layer in view. A cropped
  * hotspot is impossible to discover, especially on short/wide screens.
  * Return null for touches in letterbox space; only image pixels can suppress. */
 function imageRect(frameWidth,frameHeight){
  if(![frameWidth,frameHeight].every(Number.isFinite)||frameWidth<=0||frameHeight<=0)return null;
  const width=Math.min(frameWidth,frameHeight*2),height=width/2;
  return {left:(frameWidth-width)/2,top:(frameHeight-height)/2,width,height};
 }
 function imagePoint(localX,localY,frameWidth,frameHeight){
  if(!Number.isFinite(localX)||!Number.isFinite(localY))return null;
  const rect=imageRect(frameWidth,frameHeight);
  if(!rect||localX<rect.left||localY<rect.top||localX>rect.left+rect.width||localY>rect.top+rect.height)return null;
  return {x:(localX-rect.left)/rect.width,y:(localY-rect.top)/rect.height};
 }
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
 const photoDelta=(mode,rarity)=>Object.hasOwn(scenes,mode)&&[1,2,3].includes(rarity)?'assets/observation/photo-deltas/'+mode+'-'+rarity+'.webp':null;
 return {current,normalize,observe,discovered,byId,overlay,photoDelta,TARGETS,targets,imageRect,imagePoint};
});
