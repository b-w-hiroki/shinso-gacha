const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{headless:process.env.QA_HEADED!=='1'}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'no-preference'}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});


 // Use real time and explicit scroll/hit-tested pointer input for normal-motion views.
 // This checks real clickable geometry, including the fixed navigation, without waiting
 // for WebKit's offscreen animation-stability polling before it scrolls the control.
 async function tap(locator){
  await locator.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
  await p.waitForTimeout(350);
  assert(await locator.isVisible());assert(await locator.isEnabled());
  const box=await locator.boundingBox();assert(box);
  const hit={x:box.x+box.width/2,y:box.y+box.height/2};
  assert(await locator.evaluate((e,h)=>{const top=document.elementFromPoint(h.x,h.y);return !!top&&(e===top||e.contains(top));},hit),'control is reachable and unobstructed');
  await p.mouse.click(hit.x,hit.y);
 }
 // Actual anomaly and actual observation input produce a saved, independent spillover.
 await p.evaluate(()=>{const o=observationState(),t=Date.now();for(let seed=1;seed<1000;seed++){if(SeepageModel.hash(`watch:${seed}:0:cctv`,seed)%100<35){o.seed=seed;break;}}o.pending={mode:'cctv',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:0,suppression:0};o.mind.closed=false;S.playerSeepage={};renderObservation();});
 assert.equal(await p.evaluate(()=>S.playerSeepage.event),null,'idle does not trigger');
 // Use a real pointer hit on the animated scene. Hit-testing verifies
 // the decorative overlay does not obstruct the input.
 await p.waitForTimeout(40);
 const money=await p.evaluate(()=>S.currency),frame=await p.locator('#obs-frame').boundingBox();
 assert(frame);const hit={x:frame.x+4,y:frame.y+4};
 assert(await p.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('#obs-frame'),hit));
 await p.mouse.click(hit.x,hit.y);
 assert(await p.evaluate(()=>!!S.playerSeepage.event));assert.equal(await p.evaluate(()=>S.currency),money+1);assert.equal(await p.evaluate(()=>S.observation.pending.suppression),0);
 const chosen=await p.evaluate(()=>JSON.stringify(S.playerSeepage.event));await p.evaluate(()=>renderObservation());assert.equal(await p.evaluate(()=>JSON.stringify(S.playerSeepage.event)),chosen,'render does not redraw event');
 await p.evaluate(()=>go('lab'));await tap(p.locator('.watch-upgrades summary'));
 assert((await p.locator('.watch-upgrades').innerText()).includes('異変 5% → 異変 8%'));
 await tap(p.locator('[data-watch-upgrade="sensitivity"]'));assert.equal(await p.evaluate(()=>S.observation.upgrades.sensitivity),1);
 assert((await p.locator('.watch-upgrades').innerText()).includes('異変 8% → 異変 12%'));
 await tap(p.locator('[data-watch-upgrade="sensitivity"]'));assert.equal(await p.evaluate(()=>S.observation.upgrades.sensitivity),2);
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});
  for(let id=0;id<9;id++){
   await p.evaluate(id=>{go('home');setHomeTab('desk');const t=Date.now(),o=observationState();o.mind.closed=false;S.playerSeepage={event:{id,key:'qa:'+id,start:t,end:t+90000,glimpsed:false},nextAt:t+120000};renderObservation();},id);
   if(id>=6){await tap(p.locator('#obs-colleagues'));await tap(p.locator(`[data-watch-member="${['records','equipment','senior'][id-6]}"]`));assert(await p.locator('.seep-colleague-line').isVisible());assert.equal(await p.locator('[data-seep-odd="true"]').count(),1);}
   if(id<3){assert((await p.locator('.seep-margin-copy').innerText()).length>0);assert.equal(await p.locator('body').getAttribute('data-player-seepage'),'caption');}
   if(id>=3&&id<6){assert(await p.locator('#player-seepage-edge').evaluate(e=>e.classList.contains('seep-glimpse')));await p.waitForTimeout(250);}
   assert.equal(await p.locator('#player-seepage-edge').evaluate(e=>getComputedStyle(e).pointerEvents),'none');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
   if(width===390&&[0,3,6].includes(id)){await p.locator('#player-seepage-edge img,.watch-speaker img').evaluateAll(imgs=>Promise.all(imgs.filter(i=>i.src).map(i=>i.decode())));if(id===3)await p.locator('.seep-reflection').evaluate(e=>e.getAnimations().forEach(a=>{a.pause();a.currentTime=400;}));await p.screenshot({path:`docs/qa-incursions/seepage-${id}-390.jpg`});}
  }
 }
 // Rest is an actual choice, and does not change acquired evidence or currency.
 await p.setViewportSize({width:390,height:844});
 const before=await p.evaluate(()=>JSON.stringify({currency:S.currency,collection:S.observation.collection}));await tap(p.locator('[data-topic="rest"]'));
 assert.equal(await p.evaluate(()=>S.playerSeepage.event),null);assert.equal(await p.locator('.seep-colleague-line').count(),0);assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,collection:S.observation.collection})),before);
 await p.evaluate(()=>{go('home');const t=Date.now();S.playerSeepage={event:{id:3,key:'persisted',start:t,end:t+90000,glimpsed:false}};observationState().mind.closed=false;renderObservation();save();});
 await p.waitForTimeout(1200);assert.equal(await p.locator('#player-seepage-edge').evaluate(e=>e.classList.contains('seep-glimpse')),false);
 await p.reload();await p.evaluate(()=>{go('home');renderObservation();});assert.equal(await p.locator('#player-seepage-edge').evaluate(e=>e.classList.contains('seep-glimpse')),false,'reload cannot replay glimpse');
 await p.evaluate(()=>{S.playerSeepage.event.glimpsed=false;});await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>renderObservation());assert.equal(await p.locator('#player-seepage-edge').evaluate(e=>e.classList.contains('seep-glimpse')),false);
 await p.evaluate(()=>{observationState().quiet=true;renderObservation();});assert(await p.locator('#player-seepage-edge').isHidden());assert.equal(await p.locator('body').getAttribute('data-player-seepage'),'');
 await p.evaluate(()=>{observationState().quiet=false;S.incursion.quiet=true;renderIncursion();});assert(await p.locator('#player-seepage-edge').isHidden());
 await p.evaluate(()=>{S.incursion.quiet=false;renderObservation();});await tap(p.locator('#obs-rest'));assert.equal(await p.evaluate(()=>S.playerSeepage.event),null);
 assert.deepEqual(errors,[]);console.log('Actual trigger, sensitivity purchases, 9 spillovers × 3 sizes, reward isolation, rest, reload, quiet and reduced motion passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
