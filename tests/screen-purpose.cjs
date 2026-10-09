const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});

 for(const [width,height] of [[320,568],[390,680],[393,684],[430,740],[390,844]]){
  await p.setViewportSize({width,height});
  for(const mode of ['cctv','photo','vision','dash'])for(const state of ['normal','anomaly','feedback','closed']){
   await p.evaluate(({mode,state})=>{const o=observationState(),t=Date.now();o.mode=mode;o.mind.closed=state==='closed';o.pending=state==='anomaly'?{mode,rarity:1,readyAt:t,expiresAt:t+3600000,sequence:1,suppression:0,strain:0}:null;watchMessage=state==='feedback'?'記録を受信しました。次の観測地点へ回線を切り替えています。':'';watchMessageUntil=t+50000;go('home');setHomeTab('desk');renderObservation();scrollTo(0,0);}, {mode,state});
   await p.waitForTimeout(100);
   const layout=await p.evaluate(()=>{const tab=document.querySelector('.home-tabs').getBoundingClientRect(),frame=document.getElementById('obs-frame').getBoundingClientRect(),controls=document.querySelector('.obs-secondary').getBoundingClientRect(),nav=document.querySelector('.nav').getBoundingClientRect();return {scroll:document.documentElement.scrollHeight-innerHeight,overflowX:document.documentElement.scrollWidth-innerWidth,tabBottom:tab.bottom,frameTop:frame.top,controlsBottom:controls.bottom,navTop:nav.top};});
   assert(layout.scroll<=1,JSON.stringify({width,height,mode,state,...layout}));assert(layout.overflowX<=0);assert(layout.tabBottom<=layout.frameTop);assert(layout.controlsBottom<=layout.navTop);
   await p.mouse.wheel(0,300);assert.equal(await p.evaluate(()=>scrollY),0,'observation cannot drift under tabs');
   if(mode==='cctv'&&state==='normal')await p.screenshot({path:`docs/qa-incursions/purpose-home-${width}.jpg`,quality:85});
  }
 }
 await p.setViewportSize({width:390,height:680});
 await p.locator('[data-htab="tasks"]').click();assert(await p.locator('#desk-event').isVisible());assert(await p.locator('#obs-frame').isHidden());
 const cta=p.locator('#agent-primary');if(await cta.getAttribute('data-desk')!=='tasks'){assert(await cta.isVisible(),'dispatch action must remain available');}if(await cta.isVisible()){await cta.scrollIntoViewIfNeeded();assert(await cta.evaluate(e=>e.getBoundingClientRect().height>=44));}
 await p.screenshot({path:'docs/qa-incursions/purpose-tasks-390.jpg',quality:85});
 for(const view of ['archive','lab','report']){
  await p.evaluate(view=>go(view),view);
  const tabs=p.locator(`[data-view="${view}"] .section-tabs`);if(await tabs.count())assert.equal(await tabs.evaluate(e=>getComputedStyle(e).position),'static');
  await p.screenshot({path:`docs/qa-incursions/purpose-${view}-390.jpg`,quality:85});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);console.log('Observation document fits five browser-sized viewports across four modes/four states; purposeful task placement and static tabs passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
