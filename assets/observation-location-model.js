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
 // Twelve authored cross-references. The named scene and the dossier must both
 // exist in this save; the text never claims two different sites are one location.
 const CASE_ECHO={
  u1:{record:'巡回票の出口番号は三度変わっている。地下通路の原本には、出口番号の記載そのものがない。',after:'異変の写る通路を回収した後も、事件の巡回時刻は訂正されていない。'},
  u2:{record:'駅の出場記録と海沿いの走行記録は別の資料。どちらにも入場・出発に相当する欄がない。',after:'夜道の異変を回収したが、未運行列車の遺失物通知には依然として受領印がある。'},
  u3:{record:'人形の回収票と夜の教室の座席票は別々の書式。同じ空欄に、別々の筆跡で人数が足されている。',after:'教室の異変を回収しても、人形の回収担当者名は修正されない。'},
  u4:{record:'通学路の目撃証言と踏切前の原本に、撮影者の質問欄がない。回答にだけ時刻が残る。',after:'踏切で異変を回収した後も、通学路の三人の返答は同じ語順のまま保存されている。'},
  u5:{record:'通信記録の基地局欄と教室の撮影地点欄は、理由の異なる空白として保管されている。',after:'教室の異変を回収した日付より先に、電話の最後の受領時刻が記録されている。'},
  u6:{record:'封鎖校舎の図面と地下通路の原本では、いずれも扉の数を記載した欄だけが欠けている。',after:'地下通路の異変を回収したが、封鎖校舎の点検票には追加の扉がないと書かれている。'},
  u7:{record:'田の遠景写真と踏切前の原本は別地点の記録。輪郭の説明欄だけが同じ文字数で黒塗りされている。',after:'踏切の異変を回収した後も、遠景写真の目撃者全員が同じ語を削除した事実は残る。'},
  u8:{record:'閉じた赤い窓の画像と踏切前の映像は別端末。どちらも送信元の識別欄が空白になっている。',after:'踏切の異変を回収した後も、閉じた画面の受信時刻は更新されていない。'},
  u9:{record:'夜道の目撃談と地下通路の定点映像は別の記録。音声の開始時刻だけが先に書き込まれている。',after:'通路の異変を回収しても、録音前の声の波形は原本から消されていない。'},
  u10:{record:'踏切の擦過痕と海沿いの車載映像は別地点。原本の記録欄にはどちらも始点がない。',after:'夜道の異変を回収しても、二地点で同時に受理された通報の時刻は訂正されない。'},
  u11:{record:'寝台の下の撮影記録と教室の原本は別室。人数の増減理由を説明する入室簿がない。',after:'教室の異変を回収しても、寝台の下から撮った写真の撮影者欄は空白のまま。'},
  u12:{record:'夢の列車の時刻表と海沿いの夜道の走行記録は別媒体。どちらにも到着欄がない。',after:'夜道の異変を回収した後も、夢の駅の発車時刻は起床時刻と一致している。'}
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
 // Build-time SSR precomposition: never expose modes outside the four sources.
 const ssrComposite=mode=>Object.hasOwn(scenes,mode)?'assets/observation/ssr-composites/'+mode+'-3.webp':null;
 // Never expose even the title of an unearned case or unvisited site.
 // A notice is the existing explicit "difference recorded" action.
 function caseEcho(id,levels,cases,rawLocations,noticed){
  if(!Object.hasOwn(CASE_ECHO,id)||!Object.hasOwn(cases||{},id)||
     !(Number(levels?.[id])>=3)||noticed!==true)return null;
  const caseMode=cases[id]?.mode,scene=Object.hasOwn(scenes,caseMode)?scenes[caseMode]:null;
  if(!scene)return null;
  const recorded=normalize(rawLocations)[scene.id];
  if(!recorded)return null;
  const anomaly=[1,2,3].some(r=>Number(recorded.rarities?.[r])>0);
  return {caseId:id,placeId:scene.id,placeTitle:scene.title,source:scene.source,
   record:CASE_ECHO[id].record,after:anomaly?CASE_ECHO[id].after:null};
 }
 function siteEchoes(siteId,levels,cases,rawLocations,noticedMap){
  if(!Object.values(scenes).some(scene=>scene.id===siteId))return [];
  return Object.keys(CASE_ECHO).map(id=>caseEcho(id,levels,cases,rawLocations,
   Object.hasOwn(noticedMap||{},id)&&noticedMap[id]===true))
   .filter(entry=>entry?.placeId===siteId);
 }
 return {current,normalize,observe,discovered,byId,overlay,photoDelta,ssrComposite,TARGETS,targets,imageRect,imagePoint,caseEcho,siteEchoes};
});
