/* One live observation: tap patrols, held anomalies and foreground automation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const MINUTE=60000,HOUR=60*MINUTE;
 const MODES={cctv:{label:'監視カメラ',mult:1},photo:{label:'写真',mult:1.25},vision:{label:'視界ジャック',mult:1.5},dash:{label:'車載カメラ',mult:2}};
 const LEGACY_COSTS={cctv:0,photo:100,vision:300,dash:800};
 const LEGACY_LEVELS={retention:[0,2,4,8],interval:[0,2,4,6],sensitivity:[0,6,14],patrol:[0,1,5,9],suppression:[0,1,5,9]};
 const RETENTION=[3,4.5,6,9,12,15,18,21,24],INTERVAL=[10,9,8,7,6,5.5,5],TAPS=[10,9,8,7,6,5,4],SUPPRESS=[0,6,10,15],AUTO_SECONDS=[0,5,4.5,4,3.5,3,2.5,2,1.5,1],ANOMALY_REWARDS=[8,80,200,480];
 const UPGRADES={retention:{name:'記録保持',costs:[35,45,100,140,120,140,160,180],max:8},interval:{name:'巡回効率',costs:[40,60,130,170,350,450],max:6},sensitivity:{name:'異常感度',costs:[20,25,30,35,40,50,50,50,55,60,65,70,70,80],max:14},patrol:{name:'自動巡回',costs:[300,150,200,250,300,400,500,650,850],max:9},suppression:{name:'自動鎮静',costs:[600,300,400,500,600,700,900,1100,1300],max:9}};
 const ODDS=Array.from({length:15},(_,lv)=>{const t=lv<=6?lv/6:(lv-6)/8,a=lv<=6?[4,.9,.1]:[6,1.7,.3],b=lv<=6?[6,1.7,.3]:[8.5,2.9,.6];return [95-lv*.5,...a.map((x,i)=>x+(b[i]-x)*t)];});
 const autoTier=level=>level>=9?3:level>=5?2:level>=1?1:0;
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
  const o={version:3,mode,unlocked:Object.keys(MODES),routeBag:Object.keys(MODES).filter(k=>k!==mode),routeCredit:0,routeCreditTaken:true,tapProgress:0,patrols:0,autoEnabled:true,autoLastAt:now,upgrades:{retention:0,interval:0,sensitivity:0,patrol:0,suppression:0},seed:int(seed,0xffffffff)||1,sequence:0,collected:0,missed:0,dueAt:now+10*MINUTE,lastSeen:now,pending:null,quiet:!!old?.quiet,history:[],collection:{}};
  if(old?.anomaly){o.pending={mode,rarity:2,readyAt:now,expiresAt:now+hold(o),sequence:0};o.dueAt=now;}
  return o;
 }
 function normalize(o){
  if(o.version===2){
   const owned=Array.from(new Set(Array.isArray(o.unlocked)?o.unlocked:[]));
   o.routeCredit=owned.reduce((n,k)=>n+(LEGACY_COSTS[k]||0),0);o.routeCreditTaken=false;
   o.routePurchases=owned.filter(k=>LEGACY_COSTS[k]);
   for(const [k,map] of Object.entries(LEGACY_LEVELS)){o.upgrades=o.upgrades||{};o.upgrades[k]=map[int(o.upgrades[k],map.length-1)];}
   o.version=3;
  }
  o.routeCredit=int(o.routeCredit,1200);o.routeCreditTaken=!!o.routeCreditTaken;
  o.routeBag=Array.from(new Set((Array.isArray(o.routeBag)?o.routeBag:[]).filter(k=>Object.hasOwn(MODES,k))));
  o.dryStreak=int(o.dryStreak);o.clueStep=int(o.clueStep,12);

  if(!MODES[o.mode])o.mode='cctv';
  o.unlocked=Object.keys(MODES);
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
 function random(o,sequence,salt=0){
  let n=(o.seed^Math.imul(sequence+1,0x9e3779b1)^Math.imul(Object.keys(MODES).indexOf(o.mode)+1,0x85ebca6b)^salt)>>>0;
  n=Math.imul(n^(n>>>16),0x7feb352d);n=Math.imul(n^(n>>>15),0x846ca68b);return ((n^(n>>>16))>>>0)/4294967296;
 }
 function weighted(entries,r){const total=entries.reduce((n,e)=>n+e[1],0);let pick=r*total;for(const [id,w] of entries){pick-=w;if(pick<0)return id;}return entries.at(-1)[0];}
 function roll(o,sequence){
  const odds=ODDS[o.upgrades.sensitivity];
  if(random(o,sequence)*100<odds[0])return 0;
  // Content weights never affect the capped overall anomaly probability.
  return weighted([1,2,3].map(r=>[r,odds[r]*(o.collection?.[o.mode+':'+r]?1:2)*(o.focusMode===o.mode&&o.focusRarities?.includes(r)?1.6:1)]),random(o,sequence,0x37ad918b));
 }
 function takeRouteCredit(o){normalize(o);if(o.routeCreditTaken)return 0;o.routeCreditTaken=true;return o.routeCredit;}
 function focus(o,context){o.focusMode=Object.hasOwn(MODES,context?.mode)?context.mode:null;o.focusLegend=/^u(?:[1-9]|1[0-2])$/.test(context?.id)?context.id:null;o.focusRarities=Array.isArray(context?.rarities)?context.rarities.filter(r=>[1,2,3].includes(r)):[];}
 function nextRoute(o,record){
  const previous=o.mode;let candidates=o.routeBag.filter(k=>k!==previous);
  if(!candidates.length){o.routeBag=Object.keys(MODES);candidates=o.routeBag.filter(k=>k!==previous);}
  o.mode=weighted(candidates.map(k=>[k,(k===o.preferredMode?6:k===o.focusMode?3:1)*(setProgress(o,k)?1:2)]),random(o,o.sequence,0x19fe713a));
  o.routeBag=o.routeBag.filter(k=>k!==o.mode);o.preferredMode=null;
  if(record.rarity>0){o.dryStreak=0;o.lead=null;o.echo={key:`watch:${o.seed}:${record.sequence}:${record.mode}`,seed:o.seed,mode:record.mode,legendId:record.legendId||null,end:o.lastSeen+5*MINUTE};}
  else o.dryStreak++;
  if(o.dryStreak>0&&o.dryStreak%4===0){o.clueStep=Math.min(12,o.clueStep+1);o.lead={mode:o.focusMode||o.mode,legendId:o.focusLegend,step:o.clueStep};}
  const rarity=roll(o,o.sequence),legendId=o.focusMode===o.mode?o.focusLegend:null;
  o.routeRoll={sequence:o.sequence,rarity,legendId};
  if(rarity>0)o.pending={mode:o.mode,rarity,legendId,readyAt:o.lastSeen,expiresAt:o.lastSeen+hold(o),sequence:o.sequence,suppression:0};
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
   else {const held=o.routeRoll?.sequence===o.sequence?o.routeRoll:null;o.pending={mode:o.mode,rarity:held?held.rarity:roll(o,o.sequence),legendId:held?held.legendId:(o.focusMode===o.mode?o.focusLegend:null),readyAt:o.dueAt,expiresAt,sequence:o.sequence,suppression:0};}
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
  o.tapProgress=0;o.mind.load=Math.max(0,o.mind.load-6);nextRoute(o,record);return {kind:'anomaly',record};
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
  nextRoute(o,record);
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
   if(!automationUnlocked(o,'suppression')||autoTier(o.upgrades.suppression)<o.pending.rarity)return null;
   const [x,y]=TARGETS[o.mode][o.pending.rarity][0];return suppress(o,now,{x,y},false);
  }
  if(!o.upgrades.patrol||!automationUnlocked(o,'patrol'))return null;
  return tap(o,now);
 }
 function equip(o,mode,now){sync(o,now);if(o.pending||!o.unlocked.includes(mode)||o.mode===mode)return false;o.preferredMode=mode;return true;}
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
 function unlock(){return null;}
 function upgrade(o,id,balance,now){
  normalize(o);sync(o,now);if(['patrol','suppression'].includes(id)&&!automationUnlocked(o,id))return null;const u=UPGRADES[id];if(!u)return null;const lv=o.upgrades[id],cost=u.costs[lv];if(lv>=u.max||balance<cost)return null;
  o.upgrades[id]++;
  if(id==='retention'&&o.pending)o.pending.expiresAt=o.pending.readyAt+hold(o);
  if(id==='interval'&&!o.pending)o.dueAt=Math.min(o.dueAt,o.lastSeen+interval(o));
  return cost;
 }
 return {autoTier,takeRouteCredit,focus,nextRoute,LEGACY_LEVELS,ODDS,automationUnlocked,TARGETS,mindTick,pursue,closeMonitor,contamination,hit,suppress,suppressRegion,talk,MINUTE,HOUR,MODES,RETENTION,INTERVAL,TAPS,SUPPRESS,AUTO_SECONDS,ANOMALY_REWARDS,UPGRADES,RARITY,SET_REWARDS,RESEARCH_COST,create,normalize,interval,hold,roll,sync,reward,claim,tap,automate,equip,unlock,upgrade,setProgress,claimSet,researchStatus,research};
});
