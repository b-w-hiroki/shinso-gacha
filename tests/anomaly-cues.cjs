const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'no-preference'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});

 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
 const setup=async(rarity,strain=0)=>p.evaluate(({rarity,strain})=>{const o=observationState(),t=Date.now();o.mind.load=0;o.mind.closed=false;o.quiet=false;o.pending={mode:o.mode,rarity,readyAt:t,expiresAt:t+3600000,sequence:o.sequence,suppression:0,strain};renderObservation();},{rarity,strain});
 const loadImage=()=>p.locator('#obs-image').evaluate(async e=>{const im=new Image();im.src=getComputedStyle(e).backgroundImage.slice(5,-2);await im.decode();});
 await setup(0);await loadImage();await p.screenshot({path:'docs/qa-incursions/cue-normal-390.jpg'});
 assert.equal(await p.locator('#obs-frame').getAttribute('data-anomaly'),'0');
 const normalFilter=await p.locator('#obs-image').evaluate(e=>getComputedStyle(e).filter);
 await setup(2);await loadImage();
 assert.equal(await p.locator('#obs-frame').getAttribute('data-anomaly'),'1');
 assert.notEqual(await p.locator('#obs-image').evaluate(e=>getComputedStyle(e).filter),normalFilter);
 assert.equal(await p.locator('#obs-image').evaluate(e=>getComputedStyle(e).animationName),'obs-anomaly-warp');
 await setup(2,50);assert.equal(await p.locator('#obs-frame').getAttribute('data-anomaly'),'2');
 await setup(2,80);await loadImage();assert.equal(await p.locator('#obs-frame').getAttribute('data-anomaly'),'3');
 await p.screenshot({path:'docs/qa-incursions/cue-anomaly-390.jpg'});
 assert.equal(await p.locator('#obs-frame').evaluate(e=>getComputedStyle(e.querySelector('.obs-effect'),'::after').pointerEvents),'none');
 // Hit testing follows the actual warped image bounds, while surrounding UI stays steady.
 for(const [width,height] of [[320,568],[390,680],[844,390]]){
  await p.setViewportSize({width,height});await p.clock.runFor(40);await setup(2,80);
  await p.locator('#obs-frame').scrollIntoViewIfNeeded();
  await p.locator('#obs-image').evaluate(e=>{for(const a of e.getAnimations()){a.pause();a.currentTime=3000;}});
  const target=await p.locator('#obs-image').evaluate(e=>{const r=e.getBoundingClientRect(),[x,y]=WatchModel.TARGETS[S.observation.mode][2][0];return {x:r.x+r.width*x,y:r.y+r.height*y};});
  await p.mouse.click(target.x,target.y);assert.equal(await p.evaluate(()=>S.observation.pending.suppression),1);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 }
 await p.setViewportSize({width:390,height:680});await p.clock.runFor(200);
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('#obs-image').evaluate(e=>getComputedStyle(e).animationName),'none');
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.evaluate(()=>{observationState().quiet=true;renderObservation();});assert.equal(await p.locator('#obs-image').evaluate(e=>getComputedStyle(e).animationName),'none');
 await setup(2);await p.locator('#obs-rest').click();assert.equal(await p.locator('#obs-frame').getAttribute('data-anomaly'),'0');
 await setup(0);assert.equal(await p.locator('#obs-image').evaluate(e=>getComputedStyle(e).filter),normalFilter);
 await p.evaluate(()=>{S.incursion={version:1,level:80,resolved:0,event:{kind:34,tier:1,step:0,seen:0,round:0}};renderIncursion();openIncursion();});
 assert.equal(await p.locator('#incursion-dialog').getAttribute('data-disturbance'),'2');
 await p.locator('.inc-case-photo img').evaluate(im=>im.decode());await p.screenshot({path:'docs/qa-incursions/cue-incursion-390.jpg'});
 assert.equal(await p.locator('.inc-case-photo').evaluate(e=>getComputedStyle(e,'::before').pointerEvents),'none');
 assert.equal(await p.locator('#incursion-title').evaluate(e=>getComputedStyle(e).filter),'none');
 await p.evaluate(()=>{incursionState().quiet=true;renderIncursion();drawIncursion();});assert.equal(await p.locator('#incursion-dialog').getAttribute('data-disturbance'),'0');
 await p.evaluate(()=>{incursionState().quiet=false;incursionResolve();});assert.equal(await p.locator('#incursion-dialog').getAttribute('data-disturbance'),'0');
 await p.evaluate(()=>openIncursionRecords(34));assert.equal(await p.locator('.inc-case-photo').count(),0,'Archived records remain still');
 assert.deepEqual(errors,[]);console.log('Active anomaly cues, escalation, transformed target hits, quiet/reduced motion, closure, resolution and static archive passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
