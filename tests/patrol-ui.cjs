const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='docs/qa-incursions';
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('lab');render();});
 await p.locator('.watch-upgrades summary').click();
 assert.equal(await p.locator('[data-watch-upgrade="patrol"],[data-watch-upgrade="suppression"]').count(),0,'automation purchases hidden');
 // Existing purchases remain saved, but cannot operate before unlock conditions exist.
 await p.evaluate(()=>{go('home');setHomeTab('desk');scrollTo(0,0);const o=observationState(),t=Date.now();o.upgrades.patrol=3;o.upgrades.suppression=3;o.pending={mode:'cctv',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:0,suppression:5};o.autoLastAt=t-60000;renderObservation();});
 const before=await p.evaluate(()=>({pt:S.currency,progress:S.observation.pending.suppression}));
 await p.evaluate(()=>{watchLastTick=0;observationTick();});
 assert.deepEqual(await p.evaluate(()=>({pt:S.currency,progress:S.observation.pending.suppression})),before,'saved automation is paused');
 assert.equal(await p.locator('#obs-progress,#obs-progress-count,#obs-auto-status').count(),0);
 assert(!/\d+\/\d+/.test(await p.locator('#obs-frame').getAttribute('aria-label')));
 await p.locator('[data-watch="settings"]').click();
 assert.equal(await p.locator('[data-watch-auto]').count(),0);
 assert(!/\d+タップ/.test(await p.locator('.watch-settings').innerText()));
 await p.keyboard.press('Escape');
 await p.locator('#obs-frame').press('Enter');assert.equal(await p.evaluate(()=>S.currency),before.pt,'patrol button never suppresses');await p.locator('[data-watch-region="4"]').click();assert.equal(await p.evaluate(()=>S.currency),before.pt+80,'targeted manual suppression still rewards');
 assert(await p.evaluate(()=>{save();const saved=JSON.parse(localStorage.getItem(KEY));return saved.observation.upgrades.patrol===3&&saved.observation.upgrades.suppression===3;}),'saved purchases preserved');
 assert(await p.locator('.logo .bar').evaluate(e=>{const c=getComputedStyle(e);return c.color==='rgba(0, 0, 0, 0)'&&c.backgroundColor!=='rgba(0, 0, 0, 0)';}),'title redaction restored');
 for(const mode of ['cctv','photo','vision','dash']){
  await p.evaluate(mode=>{S.observation.mode=mode;S.observation.unlocked.push(mode);S.observation.pending=null;watchPaint='';renderObservation();},mode);
  assert(await p.locator('#obs-frame').evaluate(e=>{const c=getComputedStyle(e,'::after');return c.backgroundImage.includes('radial-gradient')&&c.pointerEvents==='none';}),'non-blocking aperture: '+mode);
  await p.locator('#obs-image').evaluate(async e=>{const im=new Image();im.src=getComputedStyle(e).backgroundImage.slice(5,-2);await im.decode();});
  await p.screenshot({path:`${out}/peek-${mode}-390.jpg`,quality:85});
 }
 await p.evaluate(()=>{S.observation.mode='cctv';renderObservation();});
 assert(await p.evaluate(()=>{S.observation.mind.load=0;S.observation.mind.lastInput=0;const stamp=S.updatedAt;watchLastTick=0;observationTick();return S.updatedAt===stamp;}),'idle tick must not restart the cloud save debounce');
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});
  for(const selector of ['#obs-rest','#obs-colleagues','[data-watch="settings"]','#game-menu']){const el=p.locator(selector);await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));assert(await el.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.width>=44&&r.height>=44&&e.scrollWidth<=e.clientWidth&&(e===hit||e.contains(hit));}),selector+' accessible at '+width);}
  await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${out}/patrol-${width}.jpg`,quality:85});
  await p.evaluate(()=>{const it=ITEMS.find(i=>i.id==='u2');runStage([{item:it,before:4,after:5,opened:true}]);advance();});await p.locator('#st-card.truthy').waitFor();await p.locator('.ghost').waitFor({state:'hidden'});assert.equal(await p.locator('#stage').evaluate(e=>getComputedStyle(e,'::after').opacity),'0','reduced motion flash cannot cover the document');
  assert(await p.locator('#st-card').evaluate(e=>{const stamp=e.querySelector('.truth').getBoundingClientRect(),text=e.querySelector('.lyr').getBoundingClientRect();return stamp.top>=text.bottom+4&&stamp.left>=e.getBoundingClientRect().left;}),'truth stamp has its own space');
  await p.locator('#st-card .truth').evaluate(e=>e.scrollIntoView({block:'nearest',behavior:'instant'}));await p.screenshot({path:`${out}/truth-${width}.jpg`,quality:85});await p.evaluate(()=>closeStage());
  await p.evaluate(()=>{S.levels.u2=5;go('archive');setSectionTab('archive:files');render();});
  const folder=p.locator('.folder.truth').first();assert(await folder.count());assert(await folder.evaluate(e=>getComputedStyle(e).position==='relative'&&getComputedStyle(e,'::after').position==='static'),'archive truth marker stays in document flow');
  await p.evaluate(()=>go('home'));
 }
 await p.setViewportSize({width:390,height:844});
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
 for(const mode of ['cctv','photo','vision','dash']){
  await p.evaluate(mode=>{const o=observationState();o.mode=mode;o.pending=null;o.quiet=false;o.tapProgress=0;watchPaint='';renderObservation();scrollTo(0,0);},mode);
  await p.locator('#obs-image').evaluate(async e=>{const im=new Image();im.src=getComputedStyle(e).backgroundImage.slice(5,-2);await im.decode();});
  for(const selector of ['#obs-frame']){
   await p.locator(selector).click();
   assert(await p.locator('#obs-frame').evaluate(e=>{const c=getComputedStyle(e,'::before');return c.opacity==='1'&&!c.backgroundImage.includes('repeating-linear-gradient')&&c.backgroundColor!=='rgba(0, 0, 0, 0)'&&c.pointerEvents==='none';}),'brief dark contact '+mode+' '+selector);
   assert(await p.locator('#obs-image').evaluate(e=>e.getAnimations().some(a=>a.playState==='running')),'physical tap jolt');
   await p.clock.runFor(300);
   assert(await p.locator('#obs-frame').evaluate(e=>!e.classList.contains('obs-touched')),'contact clears');
  }
  if(mode==='photo'){
   await p.locator('#obs-frame').click();await p.evaluate(()=>scrollTo(0,0));
   await p.screenshot({path:`${out}/tap-photo-390.jpg`,quality:85});
   await p.clock.runFor(300);
  }
 }
 await p.evaluate(()=>{const o=observationState(),t=Date.now();o.mode='photo';o.pending={mode:'photo',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:o.sequence,suppression:0};renderObservation();});
 const contact=await p.locator('#obs-image').evaluate(e=>{const im=e.getBoundingClientRect(),f=document.getElementById('obs-frame').getBoundingClientRect();return {x:im.left-f.left+im.width*.4,y:im.top-f.top+im.height*.36};});
 await p.locator('#obs-frame').click({position:contact});
 assert(await p.evaluate(()=>S.observation.pending.suppression===1),'attack responds only at anomaly');
 assert(await p.locator('#obs-frame').evaluate((e,point)=>e.classList.contains('obs-strike')&&Math.abs(parseFloat(e.style.getPropertyValue('--touch-x'))-point.x)<2&&Math.abs(parseFloat(e.style.getPropertyValue('--touch-y'))-point.y)<2,contact),'contact follows touch');
 await p.clock.runFor(100);
 await p.locator('#obs-frame').click({position:contact});
 await p.clock.runFor(100);
 assert(await p.locator('#obs-frame').evaluate(e=>e.classList.contains('obs-strike')),'repeated contact extends one effect');
 await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${out}/tap-suppression-390.jpg`,quality:85});
 await p.clock.runFor(300);
 assert(await p.locator('#obs-frame').evaluate(e=>!e.classList.contains('obs-touched')&&!e.classList.contains('obs-strike')),'no stuck contact');
 await p.evaluate(()=>{S.observation.pending.suppression=5;});
 await p.locator('#obs-frame').press('Enter');await p.locator('[data-watch-region="4"]').click();
 assert(await p.locator('#obs-frame').evaluate(e=>e.classList.contains('obs-strike')),'finishing hit retains feedback');
 await p.clock.runFor(300);
 await p.evaluate(()=>{S.observation.pending=null;});
 for(const reduced of [false,true]){
  await p.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
  await p.evaluate(reduced=>{S.observation.quiet=!reduced;renderObservation();},reduced);
  await p.locator('#obs-frame').click();
  assert(await p.locator('#obs-frame').evaluate(e=>{const c=getComputedStyle(e,'::before');return c.opacity==='1'&&c.backgroundImage==='none'&&c.transitionDuration==='0s';}),'quiet contact without noise');
  await p.clock.runFor(300);
 }
 assert.deepEqual(errors,[]);console.log('Hidden automation, preserved purchases, redacted title, aperture, lower controls and truth stamp separation passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
