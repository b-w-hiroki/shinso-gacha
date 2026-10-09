const {compareEvidence,finishWork}=require('./incursion-steps.cjs');
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});


 assert.equal(await p.evaluate(()=>INCURSIONS.length),100);
 assert.equal(await p.evaluate(()=>new Set(INCURSIONS.map(x=>x.name)).size),100);
 assert.deepEqual(await p.evaluate(()=>INC_RARITIES.flatMap(r=>r.cases).sort((a,b)=>a-b)),Array.from({length:100},(_,i)=>i));
 const currency=await p.evaluate(()=>S.currency);
 for(let kind=3;kind<100;kind++){
  await p.evaluate(kind=>{S.incursion={version:1,level:40,resolved:kind,manual:3,event:{kind,tier:1,step:0,seen:0,round:0}};openIncursion();},kind);
  if(await p.locator('.inc-reference').count())assert((await p.locator('.inc-reference').innerText()).length>18);
  const answer=await p.evaluate(kind=>INCURSIONS[kind].answer,kind);
  if(await p.locator('[data-inc="inspect"]').count())await p.locator('[data-inc="inspect"]').click();
  await compareEvidence(p);
  assert(await p.locator('[data-inc="quarantine"]').isDisabled());
  await p.locator(`[data-inc="isolate"][data-value="${(answer+1)%3}"]`).click();
  assert.equal(await p.evaluate(()=>S.incursion.event.step),0);assert.equal(await p.evaluate(()=>S.incursion.samples),0);
  await p.locator(`[data-inc="isolate"][data-value="${answer}"]`).click();
  await finishWork(p);
  assert(await p.locator('[data-inc="quarantine"]').evaluate(e=>e===document.activeElement));
  assert((await p.locator('.inc-instruction').innerText()).includes('対処を完了'));
  await p.locator('[data-inc="quarantine"]').click();
  assert.equal(await p.evaluate(()=>S.incursion.resolved),kind+1);assert.equal(await p.evaluate(()=>S.incursion.samples),1);
  await p.evaluate(()=>incursionAction('quarantine',0));assert.equal(await p.evaluate(()=>S.incursion.samples),1);
  await p.keyboard.press('Escape');
 }
 assert.equal(await p.evaluate(()=>S.currency),currency);
 // Clear visual threat, readable instructions, quiet option and reachable completion on small phones.
 for(const [width,height] of [[320,568],[390,680],[844,390]]){
  await p.setViewportSize({width,height});
  await p.evaluate(()=>{S.incursion={version:1,level:40,resolved:6,event:{kind:6,tier:1,step:0,seen:0,round:0}};openIncursion();});
  await p.locator('.inc-presence img').evaluate(im=>im.decode());assert(await p.locator('.inc-presence').isVisible());
  if(width===390)await p.screenshot({path:'docs/qa-incursions/doorway-anomaly-390.jpg',quality:85});
  await p.locator('[data-inc="inspect"]').click();await p.locator('[data-inc="isolate"][data-value="0"]').click();
  await finishWork(p);
  assert(await p.locator('[data-inc="quarantine"]').evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.bottom<=innerHeight;}));
  await p.evaluate(()=>{S.incursion.quiet=true;drawIncursion();});assert.equal(await p.locator('.inc-presence').count(),0);
  await p.keyboard.press('Escape');
 }
 await p.setViewportSize({width:390,height:680});
 await p.evaluate(()=>{go('home');const o=observationState(),t=Date.now();o.pending={mode:'cctv',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:0,suppression:0,strain:0};o.mind.closed=false;renderObservation();});
 assert(await p.locator('#obs-help').isVisible());await p.locator('#obs-help').click();assert(await p.locator('.watch-target-regions').isVisible());
 assert((await p.locator('.watch-target-copy').innerText()).includes('繰り返し'));
 assert.equal(await p.locator('#obs-frame').evaluate(e=>getComputedStyle(e).touchAction),'none');
 assert.equal(await p.locator('[data-pull="1"]').evaluate(e=>getComputedStyle(e).touchAction),'pan-x pan-y');
 const gestures=await p.evaluate(()=>{const a=new Event('gesturestart',{bubbles:true,cancelable:true});document.getElementById('obs-frame').dispatchEvent(a);const b=new Event('gesturestart',{bubbles:true,cancelable:true});document.querySelector('.watch-target-copy').dispatchEvent(b);return [a.defaultPrevented,b.defaultPrevented];});assert.deepEqual(gestures,[true,false]);
 assert.deepEqual(errors,[]);console.log('100 unique cases; all 97 evidence experiences complete once through their actual controls; visual fear/quiet layouts, confirm focus, observation guidance and control-only gesture prevention passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
