const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});


 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
 await p.evaluate(()=>{S.levels={};S.legends={};S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,resolved:0,history:[]};go('gacha');render();});
 await p.locator('#cab-desc').click();assert.equal(await p.locator('.legend-case-list button:not([disabled])').count(),0);
 assert(!(await p.locator('#sheet').innerText()).includes('きさらぎ駅'),'unowned title stays hidden');await p.keyboard.press('Escape');
 // Real purchase commits a fragment using the existing level-up path.
 await p.evaluate(()=>{const saved=draw;window.restoreLegendDraw=saved;draw=()=>byId('u2');S.currency=1000;});
 await p.locator('[data-pull="1"]').click();await p.evaluate(()=>{draw=window.restoreLegendDraw;});
 assert.equal(await p.evaluate(()=>lv('u2')),1);assert.equal(await p.evaluate(()=>S.currency),990);
 assert(await p.locator('#st-card .legend-pull-evidence').count());await p.evaluate(()=>closeStage());
 await p.evaluate(()=>openLegendCase('u2'));assert((await p.locator('#sheet').innerText()).includes('あと2段'));
 assert(!(await p.locator('#sheet').innerText()).includes('駅名標の裏'),'unowned evidence is concealed');
 // Retroactive unlock of three distinct fragments, not three copies counted separately.
 await p.evaluate(()=>{S.levels.u2=3;S.levels.u8=3;openLegendCase('u2');});await p.locator('[data-legend="start"]').click();assert.equal(await p.evaluate(()=>S.legends.active),'u2');
 assert.equal(await p.locator('[data-legend="witness"]').count(),0,'requires corroboration');
 await p.evaluate(()=>{S.incursion.discovered={20:true};openLegendCase('u2');});
 await p.locator('[data-legend="proof"]').click();assert(await p.locator('#incursion-dialog').isVisible());assert(await p.locator('.legend-incident-links').count());
 await p.locator('.legend-incident-links summary').click();await p.locator('#incursion-dialog [data-legend="case"][data-id="u2"]').click();
 await p.locator('[data-legend="witness"]').click();assert(await p.locator('.watch-conversation blockquote').isVisible());
 const afterTalk=await p.evaluate(()=>S.observation.mind.load);await p.locator('.watch-dialogue-actions [data-legend="case"]').click();await p.locator('[data-legend="witness"]').click();assert.equal(await p.evaluate(()=>S.observation.mind.load),afterTalk,'no repeated recovery farming');
 await p.locator('.watch-dialogue-actions [data-legend="case"]').click();const currency=await p.evaluate(()=>S.currency);await p.locator('[data-choice="1"]').click();assert.equal(await p.evaluate(()=>S.legends.conclusions.u2),1);assert.equal(await p.evaluate(()=>S.currency),currency);
 assert((await p.locator('.legend-conclusion').innerText()).includes('確定には'));
 // Returning players see an owned unfinished rumor and its next action.
 await p.evaluate(()=>{S.legends.active='u8';openLegendBoard();});
 assert.equal(await p.locator('.legend-resume [data-legend="case"][data-id="u8"]').count(),1);
 assert(!(await p.locator('.legend-resume').innerText()).includes('u8'),'internal IDs stay hidden');
 await p.locator('.legend-resume [data-legend="case"]').click();
 assert(await p.locator('.legend-case').isVisible());
 await p.evaluate(()=>{S.legends.active='u2';S.incursion.discovered={};openLegendBoard();});
 assert.equal(await p.locator('.legend-resume [data-legend="case"][data-id="u8"]').count(),1,'completed rumor falls through to unfinished case');
 assert.equal(await p.locator('.legend-resume [data-legend="observe"][data-id="u8"]').count(),1,'missing proof offers observation action');
 await p.locator('.legend-resume [data-legend="observe"]').click();assert.equal(await p.locator('#sheet').getAttribute('open'),null,'next action closes the investigation sheet');
 await p.evaluate(()=>{openLegendBoard();});
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});
  for(const screen of ['case','board','gacha']){
   await p.evaluate(screen=>{if(screen==='case')openLegendCase('u2');else if(screen==='board')openLegendBoard();else{hideSheet();go('gacha');render();fitGacha();}},screen);
   await p.clock.runFor(80);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const selector=screen==='gacha'?'[data-pull="1"]':screen==='board'?'.legend-case-list button[data-id="u2"]':'[data-legend="gacha"]';
   const control=p.locator(selector);await control.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.clock.runFor(80);assert(await control.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {ok:r.height>=44&&(e===hit||e.contains(hit)),height:r.height,top:r.top,bottom:r.bottom,hit:hit?.outerHTML.slice(0,150),scroll:scrollY};}).then(x=>{if(!x.ok)console.log(screen,width,x);return x.ok;}),screen+' reachable '+width);
   if(width===390)await p.screenshot({path:`docs/qa-incursions/legend-${screen}-390.jpg`});
  }
 }
 await p.setViewportSize({width:390,height:844});
 // Observation links remain acquired-only; actual seed-sampled event inherits only the relevant active legend.
 await p.evaluate(()=>{const o=observationState();o.collection['dash:0']=1;showWatchRecord('dash',0);});assert(await p.locator('.legend-observation-links [data-id="u2"]').count());
 await p.evaluate(()=>{hideSheet();go('home');const o=observationState(),t=Date.now();o.unlocked=['cctv','dash'];o.mode='dash';for(let seed=1;seed<10000;seed++){const n=SeepageModel.hash(`watch:${seed}:0:dash`,seed);if(n%100<35&&Math.floor(n/100)%9<3){o.seed=seed;break;}}o.pending={mode:'dash',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:0};o.mind.closed=false;o.mind.lastInput=t;S.playerSeepage={};renderObservation();});
 assert.equal(await p.evaluate(()=>S.playerSeepage.event.legendId),'u2');assert((await p.locator('.seep-margin-copy').innerText()).includes('停車駅'));
 await p.evaluate(()=>{const t=Date.now();S.playerSeepage={event:{id:6,key:'legend',legendId:'u2',start:t,end:t+90000,glimpsed:true}};legendWitness('u2');});
 assert((await p.locator('.seep-colleague-line').innerText()).includes('車内放送'));await p.screenshot({path:'docs/qa-incursions/legend-witness-390.jpg'});
 await p.evaluate(()=>save());await p.reload();assert.equal(await p.evaluate(()=>S.legends.active),'u2');assert.equal(await p.evaluate(()=>S.legends.conclusions.u2),1);assert.equal(await p.evaluate(()=>LegendModel.count(S.levels,'u2')),3);
 // V1.1: acquired-only original difference, testimony and three related incidents.
 await p.evaluate(()=>{S.levels.u2=3;S.legends.testified.u2=true;S.observation.collection['dash:0']=1;S.legendLayers={};openLegendCase('u2');});
 assert.equal(await p.locator('[data-layer="noticed"]').count(),1);
 assert.equal(await p.locator('[data-layer="compared"]').count(),0,'contradiction stays gated by noticing');
 await p.locator('[data-layer="noticed"]').click();
 assert.equal(await p.locator('[data-layer="compared"]').count(),1);
 await p.locator('[data-layer="compared"]').click();
 assert.equal(await p.locator('[data-layer="linked"]').count(),0,'chain requires 3 unique cases');
 await p.evaluate(()=>{const ks=INCURSIONS.map((_,i)=>i).filter(k=>LegendModel.related('u2',k,incursionProfile)).slice(0,3);for(const k of ks)S.incursion.discovered[k]=true;openLegendCase('u2');});
 assert.equal(await p.locator('[data-layer="linked"]').count(),1);
 await p.locator('[data-layer="linked"]').click();
 assert.equal(await p.evaluate(()=>S.legendLayers.linked.u2),true);
 const v11wallet=await p.evaluate(()=>S.currency);await p.reload();
 assert.equal(await p.evaluate(()=>S.legendLayers.linked.u2),true,'progress persists after reload');
 assert.equal(await p.evaluate(()=>S.currency),v11wallet,'layered reading never mints currency');
 await p.evaluate(()=>{S.levels.u1=0;openLegendCase('u1');});
 assert.equal(await p.locator('[data-layer][data-id="u1"]').count(),0,'unowned layers invisible');
 assert.deepEqual(errors,[]);console.log('Paid envelope → 3-fragment migration → acquired proof → colleague → hypothesis → next envelope, themed seepage, persistence and 3 viewport sizes passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
