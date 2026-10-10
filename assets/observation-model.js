/* One live observation: tap patrols, held anomalies and foreground automation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const MINUTE=60000,HOUR=60*MINUTE;
 const MODES={cctv:{label:'監視カメラ',need:0,cost:0,mult:1},photo:{label:'写真',need:5,cost:100,mult:1.25},vision:{label:'視界ジャック',need:15,cost:300,mult:1.5},dash:{label:'車載カメラ',need:30,cost:800,mult:2}};
 const RETENTION=[3,6,12,24],INTERVAL=[10,8,6,5],TAPS=[10,8,6,4],SUPPRESS=[0,6,10,15],AUTO_SECONDS=[0,5,3,1],ANOMALY_REWARDS=[8,80,200,480];
 const UPGRADES={retention:{name:'記録保持',costs:[80,240,600],max:3},interval:{name:'巡回効率',costs:[100,300,800],max:3},sensitivity:{name:'異常感度',costs:[200,500],max:2},patrol:{name:'自動巡回',costs:[300,900,2400],max:3},suppression:{name:'自動鎮静',costs:[600,1800,4000],max:3}};
 const ODDS=[[85,11,3.5,.5],[82,13,4.3,.7],[78,15,6,1]];
 const RARITY=[{name:'N',reward:8},{name:'R',reward:20},{name:'SR',reward:60},{name:'SSR',reward:180}];
 // Native-image coordinates, never viewport coordinates. No target is shown before contact.
 const TARGETS={
  cctv:{1:[[.51,.34,.17,.20]],2:[[.66,.64,.25,.22]],3:[[.22,.65,.22,.20]]},
  photo:{1:[[.40,.36,.13,.15]],2:[[.70,.82,.25,.18]],3:[[.59,.065,.15,.12]]},
  vision:{1:[[.50,.28,.16,.10]],2:[[.28,.38,.12,.16],[.54,.36,.10,.14],[.76,.36,.12,.16]],3:[[.28,.44,.12,.22],[.77,.44,.12,.22]]},
  dash:{1:[[.20,.29,.11,.15]],2:[[.43,.42,.16,.17]],3:[[.59,.54,.22,.16]]}
 };
 const RESEARCH_COST=48;
 const SET_REWARDS={cctv:80,photo:100,vision:120,dash:160};
 const int=(v,max=Number.MAX_SAFE_INTEGER)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));
 const interval=o=>INTERVAL[o.upgrades.interval]*MINUTE,hold=o=>RETENTION[o.upgrades.retention]*HOUR;
 function create(now,seed,old){
  const mode=MODES[old?.mode]?old.mode:'cctv';
  const o={version:2,mode,unlocked:['cctv',...(mode!=='cctv'?[mode]:[])],tapProgress:0,patrols:0,autoEnabled:true,autoLastAt:now,upgrades:{retention:0,interval:0,sensitivity:0,patrol:0,suppression:0},seed:int(seed,0xffffffff)||1,sequence:0,collected:0,missed:0,dueAt:now+10*MINUTE,lastSeen:now,pending:null,quiet:!!old?.quiet,history:[],collection:{}};
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
  o.tapProgress=int(o.tapProgress,TAPS[o.upgrades.interval]-1);o.patrols=int(o.patrols);o.autoLastAt=int(o.autoLastAt);o.autoEnabled=o.autoEnabled!==false;
  if(o.pending){o.pending.suppression=int(o.pending.suppression,14);o.pending.strain=Math.max(0,Math.min(90,Number(o.pending.strain)||0));}
  const m=o.mind&&typeof o.mind==='object'?o.mind:{};
  o.mind={load:Math.max(0,Math.min(100,Number(m.load)||0)),lastAt:int(m.lastAt),lastInput:int(m.lastInput),closed:!!m.closed,talkAt:int(m.talkAt),talks:m.talks&&typeof m.talks==='object'?m.talks:{},dialogue:m.dialogue&&typeof m.dialogue==='object'?m.dialogue:{},clues:m.clues&&typeof m.clues==='object'?m.clues:{}};
  o.manualSuppressions=int(o.manualSuppressions);
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
  let r=n/4294967296*100;
  for(let i=0;i<4;i++){if(r<ODDS[o.upgrades.sensitivity][i])return i;r-=ODDS[o.upgrades.sensitivity][i];}return 3;
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
   else o.pending={mode:o.mode,rarity:roll(o,o.sequence),readyAt:o.dueAt,expiresAt,sequence:o.sequence,suppression:0};
   changed=true;
  }
  return changed;
 }
 function reward(p){return Math.round(RARITY[p.rarity].reward*MODES[p.mode].mult);}
 function claim(o,now){
  sync(o,now);if(!o.pending)return null;
  const p={...o.pending,reward:reward(o.pending)};o.pending=null;o.collected++;o.sequence++;o.dueAt=o.lastSeen+interval(o);const key=p.mode+':'+p.rarity;p.first=!o.collection[key];o.collection[key]=(o.collection[key]||0)+1;o.history.push(p);o.history=o.history.slice(-12);return p;
 }
 function mindTick(o,time,{viewing=false,visible=true}={}){
  normalize(o);const m=o.mind,now=Math.max(int(time),m.lastAt),previous=m.lastAt;
  m.lastAt=now;if(!previous)return false;
  const elapsed=now-previous,shortGap=elapsed<=5000;
  const engaged=visible&&!m.closed&&shortGap?Math.max(0,Math.min(elapsed,m.lastInput+30000-previous)):0;
  const rest=elapsed-engaged,old=m.load,oldStrain=o.pending?.strain||0;
  if(o.pending?.rarity>0){
   o.pending.strain=Math.max(0,Math.min(90,oldStrain+(viewing?engaged/1000:0)-rest/1000*.7));
  }
  m.load=Math.max(0,Math.min(100,old+engaged/1000*(.025+(viewing&&o.pending?.strain>=20?.12:0))-rest/1000*(m.closed?.5:.25)));
  return m.load!==old||(o.pending?.strain||0)!==oldStrain;
 }
 function pursue(o,time,amount=.18){normalize(o);const m=o.mind;m.lastInput=Math.max(int(time),m.lastAt);m.lastAt=m.lastAt||m.lastInput;m.load=Math.min(100,m.load+amount);}
 function closeMonitor(o,time,closed=true){mindTick(o,time);o.mind.closed=closed;o.mind.lastInput=closed?0:Math.max(int(time),o.mind.lastAt);}
 function contamination(o){normalize(o);return Math.max(o.mind.load>=70?3:o.mind.load>=45?2:o.mind.load>=20?1:0,o.pending?.strain>=75?3:o.pending?.strain>=45?2:o.pending?.strain>=20?1:0);}
 function hit(o,point){
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.x>1||point.y<0||point.y>1)return false;
  return (TARGETS[o.mode]?.[o.pending?.rarity]||[]).some(([x,y,rx,ry])=>((point.x-x)/rx)**2+((point.y-y)/ry)**2<=1);
 }
 function suppress(o,time,point,manual=true){
  normalize(o);sync(o,time);if(o.mind.closed||!o.pending?.rarity)return null;
  pursue(o,time,.08);if(!hit(o,point))return null;
  const p=o.pending;p.suppression++;o.mind.load=Math.min(100,o.mind.load+.35);
  if(p.suppression<SUPPRESS[p.rarity])return null;
  const record=claim(o,time);record.reward=Math.round(ANOMALY_REWARDS[record.rarity]*MODES[record.mode].mult);
  if(manual)o.manualSuppressions++;
  o.tapProgress=0;o.mind.load=Math.max(0,o.mind.load-6);return {kind:'anomaly',record};
 }
 function suppressRegion(o,time,region){
  const t=(TARGETS[o.mode]?.[o.pending?.rarity]||[]).find(([x,y])=>Math.floor(y*3)*3+Math.floor(x*3)===region);
  return suppress(o,time,t?{x:t[0],y:t[1]}:{x:-1,y:-1});
 }
 function talk(o,time,member){
  normalize(o);if(!['records','equipment','senior'].includes(member))return false;
  closeMonitor(o,time,true);o.mind.talks[member]=int(o.mind.talks[member],9999)+1;
  const now=Math.max(int(time),o.mind.lastAt),available=!o.mind.talkAt||now-o.mind.talkAt>=120000;
  if(available){o.mind.load=Math.max(0,o.mind.load-5);o.mind.talkAt=now;}return available;
 }
 function tap(o,time){
  normalize(o);sync(o,time);
  // Patrol cannot suppress anomalies, regardless of click count or input source.
  if(o.mind.closed||o.pending?.rarity>0)return null;
  pursue(o,time);
  o.tapProgress++;
  if(o.tapProgress<TAPS[o.upgrades.interval])return null;
  o.tapProgress=0;
  if(!o.pending)o.pending={mode:o.mode,rarity:0,readyAt:o.lastSeen,expiresAt:o.lastSeen+hold(o),sequence:o.sequence};
  const record=claim(o,time);o.patrols++;
  const routes=Object.keys(MODES).filter(mode=>o.unlocked.includes(mode));
  o.mode=routes[(routes.indexOf(o.mode)+1)%routes.length];
  const rarity=roll(o,o.sequence);
  if(rarity>0)o.pending={mode:o.mode,rarity,readyAt:o.lastSeen,expiresAt:o.lastSeen+hold(o),sequence:o.sequence,suppression:0};
  return {kind:'patrol',record};
 }
 function automationUnlocked(o,id){return id==='patrol'?o.collected>=20&&o.unlocked.length>=2:id==='suppression'?o.manualSuppressions>=10&&o.upgrades.patrol>=1:false;}
 function automate(o,time,active=true){
  normalize(o);const now=Math.max(int(time),o.autoLastAt),elapsed=now-o.autoLastAt;
  const seconds=AUTO_SECONDS[o.pending?.rarity>0?o.upgrades.suppression:o.upgrades.patrol]||5;
  if(!active||!o.autoEnabled){o.autoLastAt=now;return null;}
  // No catch-up bursts: a visible tick can advance at most one real tap.
  if(elapsed<seconds*1000)return null;
  o.autoLastAt=now;sync(o,now);
  if(o.mind.closed)return null;
  if(o.pending?.rarity>0){
   if(!automationUnlocked(o,'suppression')||o.upgrades.suppression<o.pending.rarity)return null;
   const [x,y]=TARGETS[o.mode][o.pending.rarity][0];return suppress(o,now,{x,y},false);
  }
  if(!o.upgrades.patrol||!automationUnlocked(o,'patrol'))return null;
  return tap(o,now);
 }
 function equip(o,mode,now){sync(o,now);if(o.pending||!o.unlocked.includes(mode)||o.mode===mode)return false;o.mode=mode;o.tapProgress=0;o.sequence++;o.dueAt=o.lastSeen+interval(o);return true;}
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
  sync(o,now);if(['patrol','suppression'].includes(id)&&!automationUnlocked(o,id))return null;const u=UPGRADES[id];if(!u)return null;const lv=o.upgrades[id],cost=u.costs[lv];if(lv>=u.max||balance<cost)return null;
  o.upgrades[id]++;
  if(id==='retention'&&o.pending)o.pending.expiresAt=o.pending.readyAt+hold(o);
  if(id==='interval'&&!o.pending)o.dueAt=Math.min(o.dueAt,o.lastSeen+interval(o));
  return cost;
 }
 return {ODDS,automationUnlocked,TARGETS,mindTick,pursue,closeMonitor,contamination,hit,suppress,suppressRegion,talk,MINUTE,HOUR,MODES,RETENTION,INTERVAL,TAPS,SUPPRESS,AUTO_SECONDS,ANOMALY_REWARDS,UPGRADES,RARITY,SET_REWARDS,RESEARCH_COST,create,normalize,interval,hold,roll,sync,reward,claim,tap,automate,equip,unlock,upgrade,setProgress,claimSet,researchStatus,research};
});
