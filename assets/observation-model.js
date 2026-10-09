/* Pure clock model: one equipped source, one held record, no background rewards. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const MINUTE=60000,HOUR=60*MINUTE;
 const MODES={cctv:{label:'監視カメラ',need:0,cost:0,mult:1},photo:{label:'写真',need:5,cost:100,mult:1.25},vision:{label:'視界ジャック',need:15,cost:300,mult:1.5},dash:{label:'車載カメラ',need:30,cost:800,mult:2}};
 const RETENTION=[3,6,12,24],INTERVAL=[10,8,6,5];
 const UPGRADES={retention:{name:'記録保持',costs:[80,240,600],max:3},interval:{name:'観測加速',costs:[100,300,800],max:3},sensitivity:{name:'異常感度',costs:[200,500],max:2}};
 const RARITY=[{name:'N',reward:8},{name:'R',reward:20},{name:'SR',reward:60},{name:'SSR',reward:180}];
 const RESEARCH_COST=48;
 const SET_REWARDS={cctv:80,photo:100,vision:120,dash:160};
 const int=(v,max=Number.MAX_SAFE_INTEGER)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));
 const interval=o=>INTERVAL[o.upgrades.interval]*MINUTE,hold=o=>RETENTION[o.upgrades.retention]*HOUR;
 function create(now,seed,old){
  const mode=MODES[old?.mode]?old.mode:'cctv';
  const o={version:2,mode,unlocked:['cctv',...(mode!=='cctv'?[mode]:[])],upgrades:{retention:0,interval:0,sensitivity:0},seed:int(seed,0xffffffff)||1,sequence:0,collected:0,missed:0,dueAt:now+10*MINUTE,lastSeen:now,pending:null,quiet:!!old?.quiet,history:[],collection:{}};
  if(old?.anomaly){o.pending={mode,rarity:2,readyAt:now,expiresAt:now+hold(o),sequence:0};o.dueAt=now;}
  return o;
 }
 function normalize(o){
  if(!MODES[o.mode])o.mode='cctv';
  o.unlocked=Array.from(new Set(['cctv',...(Array.isArray(o.unlocked)?o.unlocked.filter(k=>MODES[k]):[])]));
  if(!o.unlocked.includes(o.mode))o.mode='cctv';
  o.upgrades=o.upgrades&&typeof o.upgrades==='object'?o.upgrades:{};
  for(const [k,u] of Object.entries(UPGRADES))o.upgrades[k]=int(o.upgrades[k],u.max);
  for(const k of ['sequence','collected','missed','dueAt','lastSeen'])o[k]=int(o[k]);
  o.seed=int(o.seed,0xffffffff)||1;o.quiet=!!o.quiet;
  o.history=Array.isArray(o.history)?o.history.filter(x=>x&&MODES[x.mode]&&Number.isInteger(x.rarity)&&RARITY[x.rarity]).slice(-12):[];
  o.collection=o.collection&&typeof o.collection==='object'?o.collection:{};
  o.researchSpent=Object.fromEntries(Object.keys(MODES).map(mode=>[mode,int(o.researchSpent?.[mode],3999996)]));
  o.reconstructed=Object.fromEntries(Object.keys(MODES).flatMap(mode=>[0,1,2,3].filter(r=>o.reconstructed?.[mode+':'+r]===true).map(r=>[mode+':'+r,true])));
  o.completedSets=Object.fromEntries(Object.keys(MODES).map(mode=>[mode,o.completedSets?.[mode]===true]));
  for(const mode of Object.keys(MODES))for(let rarity=0;rarity<4;rarity++){const key=mode+':'+rarity;o.collection[key]=int(o.collection[key],999999);}
  if(o.pending&&(!MODES[o.pending.mode]||o.pending.mode!==o.mode||!Number.isInteger(o.pending.rarity)||!RARITY[o.pending.rarity]||!Number.isFinite(o.pending.readyAt)||!Number.isFinite(o.pending.expiresAt)||o.pending.expiresAt<=o.pending.readyAt))o.pending=null;
  return o;
 }
 function roll(o,sequence){
  // Counter-based deterministic randomness makes reload and offline sync order irrelevant.
  let n=(o.seed^Math.imul(sequence+1,0x9e3779b1)^Math.imul(Object.keys(MODES).indexOf(o.mode)+1,0x85ebca6b))>>>0;
  n=Math.imul(n^(n>>>16),0x7feb352d);n=Math.imul(n^(n>>>15),0x846ca68b);n=(n^(n>>>16))>>>0;
  const r=n/4294967296,thresholds=[[.60,.88,.98],[.50,.83,.97],[.40,.77,.95]][o.upgrades.sensitivity];
  return r<thresholds[0]?0:r<thresholds[1]?1:r<thresholds[2]?2:3;
 }
 function sync(o,time){
  const now=Math.max(int(time),o.lastSeen);o.lastSeen=now;let changed=false;
  if(o.pending&&now>=o.pending.expiresAt){o.dueAt=o.pending.expiresAt+interval(o);o.pending=null;o.sequence++;o.missed++;changed=true;}
  if(!o.pending&&now>=o.dueAt){
   const period=hold(o)+interval(o);
   const skipped=Math.floor((now-o.dueAt)/period);
   o.sequence+=skipped;o.missed+=skipped;o.dueAt+=skipped*period;
   const expiresAt=o.dueAt+hold(o);
   if(now>=expiresAt){o.missed++;o.sequence++;o.dueAt=expiresAt+interval(o);}
   else o.pending={mode:o.mode,rarity:roll(o,o.sequence),readyAt:o.dueAt,expiresAt,sequence:o.sequence};
   changed=true;
  }
  return changed;
 }
 function reward(p){return Math.round(RARITY[p.rarity].reward*MODES[p.mode].mult);}
 function claim(o,now){
  sync(o,now);if(!o.pending)return null;
  const p={...o.pending,reward:reward(o.pending)};o.pending=null;o.collected++;o.sequence++;o.dueAt=o.lastSeen+interval(o);const key=p.mode+':'+p.rarity;p.first=!o.collection[key];o.collection[key]=(o.collection[key]||0)+1;o.history.push(p);o.history=o.history.slice(-12);return p;
 }
 function equip(o,mode,now){sync(o,now);if(o.pending||!o.unlocked.includes(mode)||o.mode===mode)return false;o.mode=mode;o.sequence++;o.dueAt=o.lastSeen+interval(o);return true;}
 function setProgress(o,mode){return MODES[mode]?[0,1,2,3].filter(r=>o.collection[mode+':'+r]>0).length:0;}
 function claimSet(o,mode){
  if(!Object.hasOwn(SET_REWARDS,mode)||setProgress(o,mode)!==4||o.completedSets?.[mode])return null;
  o.completedSets=o.completedSets||{};o.completedSets[mode]=true;return SET_REWARDS[mode];
 }
 function researchStatus(o,mode){
  if(!Object.hasOwn(MODES,mode))return null;
  const missing=[0,1,2,3].filter(r=>!o.collection[mode+':'+r]);
  const spent=int(o.researchSpent?.[mode],3999996);
  const duplicates=[0,1,2,3].reduce((n,r)=>n+Math.max(0,(o.collection[mode+':'+r]||0)-1),0);
  const available=Math.max(0,duplicates-spent);
  return {missing,spent,available,ready:o.unlocked.includes(mode)&&missing.length>0&&available>=RESEARCH_COST};
 }
 function research(o,mode,expectedSpent){
  const status=researchStatus(o,mode);
  if(!status?.ready||status.spent!==expectedSpent)return null;
  // Dedicated stable seed: opening/cancelling/reloading cannot reroll or affect the live watch.
  const n=(Math.imul(o.seed^0x27d4eb2d,31)+Math.imul(status.spent+1,0x85ebca6b)+Object.keys(MODES).indexOf(mode))>>>0;
  const rarity=status.missing[n%status.missing.length],key=mode+':'+rarity;
  o.researchSpent=o.researchSpent||{};o.researchSpent[mode]=status.spent+RESEARCH_COST;
  o.reconstructed=o.reconstructed||{};o.reconstructed[key]=true;o.collection[key]=1;
  return {mode,rarity};
 }
 function unlock(o,mode,balance){const m=MODES[mode];if(!m||o.unlocked.includes(mode)||o.collected<m.need||balance<m.cost)return null;o.unlocked.push(mode);return m.cost;}
 function upgrade(o,id,balance,now){
  sync(o,now);const u=UPGRADES[id];if(!u)return null;const lv=o.upgrades[id],cost=u.costs[lv];if(lv>=u.max||balance<cost)return null;
  o.upgrades[id]++;
  if(id==='retention'&&o.pending)o.pending.expiresAt=o.pending.readyAt+hold(o);
  if(id==='interval'&&!o.pending)o.dueAt=Math.min(o.dueAt,o.lastSeen+interval(o));
  return cost;
 }
 return {MINUTE,HOUR,MODES,RETENTION,INTERVAL,UPGRADES,RARITY,SET_REWARDS,RESEARCH_COST,create,normalize,interval,hold,roll,sync,reward,claim,equip,unlock,upgrade,setProgress,claimSet,researchStatus,research};
});
