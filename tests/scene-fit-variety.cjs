const {compareEvidence,finishWork}=require('./incursion-steps.cjs');
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const context=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});


 for(const [width,height] of [[320,568],[390,680],[393,684],[430,740],[390,844]]){
  await p.setViewportSize({width,height});
  for(const level of [0,40,100])for(const box of ['urban','conspiracy']){
   await p.evaluate(({level,box:chosen})=>{box=chosen;S.incursion={version:1,level,resolved:0,event:level?{kind:0,tier:1,step:0,seen:0}:null};go('gacha');render();fitGacha();},{level,box});
   await p.waitForTimeout(100);
   const dims=await p.evaluate(()=>{const bs=[...document.querySelectorAll('.pulls button:not([hidden])')].map(e=>e.getBoundingClientRect());return{scroll:document.documentElement.scrollHeight-innerHeight,x:document.documentElement.scrollWidth-innerWidth,widths:bs.map(r=>r.width),bottom:Math.max(...bs.map(r=>r.bottom)),nav:document.querySelector('.nav').getBoundingClientRect().top};});
   assert(dims.scroll<=1,JSON.stringify({width,height,level,box,...dims}));assert(dims.x<=0);assert(Math.abs(dims.widths[0]-dims.widths[1])<=1);assert(dims.bottom<=dims.nav);
   await p.mouse.wheel(0,300);assert.equal(await p.evaluate(()=>scrollY),0);
   if(width===390&&height===680&&level===40&&box==='urban')await p.screenshot({path:'docs/qa-incursions/envelope-fit-390.jpg',quality:85});
  }
  await p.evaluate(()=>{go('home');renderObservation();});await p.waitForTimeout(100);
  assert(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'observation also fits with danger banner');
 }
 await p.evaluate(()=>{go('home');renderObservation();});assert(await p.locator('#obs-first-hint').isHidden());assert(await p.locator('#obs-source').isHidden());
 // Each new anomaly has evidence, a wrong choice, saved intermediate progress and idempotent completion.
 for(const kind of [3,4,5]){
  await p.evaluate(kind=>{S.incursion={version:1,level:40,resolved:kind,manual:3,event:{kind,tier:1,step:0,seen:0,round:0}};openIncursion();},kind);
  await compareEvidence(p);
  const answer=await p.evaluate(kind=>INCURSIONS[kind].answer,kind);
  await p.locator(`[data-inc="isolate"][data-value="${(answer+1)%3}"]`).click();assert.equal(await p.evaluate(()=>S.incursion.level),46);
  await p.locator(`[data-inc="isolate"][data-value="${answer}"]`).click();await p.evaluate(()=>save());
  if(kind===3)await p.screenshot({path:'docs/qa-incursions/receipt-anomaly-390.jpg',quality:85});
  await p.reload();await p.evaluate(()=>openIncursion());assert.equal(await p.evaluate(()=>S.incursion.event.step),1);
  await finishWork(p);
  const money=await p.evaluate(()=>S.currency);
  await p.locator('[data-inc="quarantine"]').click();await p.evaluate(()=>incursionAction('quarantine',0));
  assert.equal(await p.evaluate(()=>S.incursion.resolved),kind+1);assert.equal(await p.evaluate(()=>S.currency),money);await p.keyboard.press('Escape');
 }
 // A controlled high rarity roll replaces the obsolete fixed 0→5 rotation assertion.
 const rarities=await p.evaluate(()=>{const random=Math.random;Math.random=()=>.99;try{return Array.from({length:6},(_,resolved)=>incursionRarity(incursionEvent({resolved,manual:0}).kind).id);}finally{Math.random=random;}});
 assert.deepEqual(rarities,Array(6).fill('SSR'),'Event selection follows the rarity roll at every progress level');
 // Inspect the reported blank topic through all unlocked layers, then actual opening and completion.
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 for(let level=1;level<=5;level++){
  await p.evaluate(level=>{S.levels.u9=level;openDossier('u9');},level);
  assert.equal(await p.locator('.doc h2').innerText(),'人面犬');assert.equal(await p.locator('.doc .lyr:not(.sealed)').count(),level);
  for(const para of await p.locator('.doc .lyr:not(.sealed) p').all()){assert((await para.innerText()).length>15);assert(await para.evaluate(e=>getComputedStyle(e).visibility==='visible'&&getComputedStyle(e).opacity!=='0'));}
 }
 await p.screenshot({path:'docs/qa-incursions/jinmenken-record-390.jpg',quality:85});
 const before=await p.evaluate(()=>S.currency);await p.locator('[data-truth-reward="u9"]').click();assert.equal(await p.evaluate(()=>S.currency),before+50);
 await p.evaluate(()=>claimTruthReward('u9'));assert.equal(await p.evaluate(()=>S.currency),before+50);
 await p.evaluate(()=>{hideSheet();S.levels.u9=4;delete S.truthRewards.u9;runStage([levelUp(byId('u9'))]);});
 await p.locator('#st-scene').click();await p.locator('#st-card.reveal').waitFor({state:'visible'});await p.evaluate(()=>document.querySelectorAll('.ghost').forEach(e=>e.remove()));
 assert((await p.locator('#st-card').innerText()).includes('メディア主導'));assert((await p.locator('#st-card').innerText()).includes('+50pt'));
 await p.screenshot({path:'docs/qa-incursions/jinmenken-truth-390.jpg',quality:85});
 await p.keyboard.press('Escape');
 // Under ordinary motion, a second tap completes opening without waiting for timers.
 const q=await p.context().newPage();await q.emulateMedia({reducedMotion:'no-preference'});await q.route('https://**/*',r=>r.abort());await q.goto('http://127.0.0.1:'+server.address().port);
 await q.evaluate(()=>{S.role='agent';S.fast=false;runStage([{item:byId('u9'),before:0,after:1,opened:true}]);advance();advance();});
 assert(await q.locator('#st-card.up.reveal').isVisible());assert((await q.locator('#st-card').innerText()).includes('高速道路'));assert.equal(await q.evaluate(()=>phase),'shown');await q.close();
 await p.evaluate(()=>save());await p.reload();assert(await p.evaluate(()=>S.truthRewards.u9));
 assert.deepEqual(errors,[]);console.log('30 portrait scene cases, equal draw buttons, guide removal, three new anomaly interactions, all human-faced dog layers, and one-time truth rewards passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
