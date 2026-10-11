/* Separate location identity and per-scene archives without changing the four media/rarity rolls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ObservationSites=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const LOCATIONS={
  cctv:{main:{name:'公園'},alt:{name:'地下通路',source:'CAM 12',image:'cctv-underground-upgraded.webp',notes:['無人の地下通路','通路に残る足跡','出口の向こうの立会者','存在しない階段']}},
  photo:{main:{name:'食卓'},alt:{name:'夜の教室',source:'PHOTO 18',image:'photo-classroom-upgraded.webp',notes:['灯りの消えた教室','誰も座らない席','黒板にない人影','出席番号の増殖']}},
  vision:{main:{name:'商店街'},alt:{name:'踏切前',source:'LINK 15',image:'vision-crossing-upgraded.webp',notes:['遮断機の手前','踏切の向こうの影','数の合わない横断者','後ろから見ている者']}},
  dash:{main:{name:'県道'},alt:{name:'海沿いの夜道',source:'DRIVE 19',image:'dash-coast-road-upgraded.webp',notes:['海沿いの走行記録','路肩の白い影','背後に続く灯り','対向車線に残る人影']}}
 };
 const ids=Object.keys(LOCATIONS);
 const site=(mode,sequence)=>ids.includes(mode)&&Number.isInteger(sequence)&&sequence>=0?mode+':'+(sequence%2?'alt':'main'):null;
 const validKey=k=>ids.some(mode=>['main','alt'].some(kind=>[0,1,2,3].some(r=>k===mode+':'+kind+':'+r)));
 const read=(raw)=>{
  const o={version:1,counts:{},seen:[]};
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return o;
  const counts=raw.counts&&typeof raw.counts==='object'&&!Array.isArray(raw.counts)?raw.counts:{};
  for(const [k,n]of Object.entries(counts))if(validKey(k)&&Number.isFinite(n)&&n>0)o.counts[k]=Math.min(999999,Math.floor(n));
  if(Array.isArray(raw.seen))o.seen=raw.seen.filter(x=>typeof x==='string'&&/^\w+:[0-9]+:[0-3]$/.test(x)).slice(-96);
  return o;
 };
 function register(raw,record){
  const state=read(raw),place=site(record?.mode,record?.sequence),rarity=record?.rarity;
  if(!place||![0,1,2,3].includes(rarity))return {state,changed:false,place:null};
  const once=record.mode+':'+record.sequence+':'+rarity;
  if(state.seen.includes(once))return {state,changed:false,place};
  state.counts[place+':'+rarity]=(state.counts[place+':'+rarity]||0)+1;state.seen.push(once);state.seen=state.seen.slice(-96);
  return {state,changed:true,place};
 }
 const owned=(raw,mode,kind)=>{const state=read(raw);return [0,1,2,3].some(r=>state.counts[mode+':'+kind+':'+r]>0)};
 const count=(raw,mode,kind,rarity)=>read(raw).counts[mode+':'+kind+':'+rarity]||0;
 const overlay=(mode,rarity)=>ids.includes(mode)&&[1,2,3].includes(rarity)?'assets/observation/alt-overlays/'+mode+'-'+rarity+'.svg':null;
 return {LOCATIONS,site,read,register,owned,count,overlay};
});