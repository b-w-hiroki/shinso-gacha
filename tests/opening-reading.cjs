const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});
 const result=()=>p.evaluate(()=>({qi,phase,hidden:document.getElementById('stage').hidden}));
 for(const size of [{width:390,height:680},{width:320,height:568},{width:844,height:390}]){
  await p.setViewportSize(size);
  await p.evaluate(()=>{S.fast=false;runStage([1,2,3,4,5].map(after=>({item:byId('u9'),before:after-1,after,opened:true})));});
  for(let n=0;n<5;n++){
   await p.locator('[data-act="stage-open"]').click();await p.waitForFunction(()=>phase==='shown');
   assert.equal(await p.locator('#st-card').evaluate(e=>e.scrollTop),0);
   assert((await p.locator('#st-card h2').innerText()).includes('人面犬'));
   await p.locator('#st-card h2').click();assert.equal((await result()).qi,n);assert(!(await result()).hidden);
   await p.locator('#st-card').evaluate(e=>{e.tabIndex=0;e.focus();});await p.keyboard.press('Enter');
   assert.equal((await result()).qi,n);assert(!(await result()).hidden);
   await p.locator('#st-card').evaluate(e=>e.scrollTop=e.scrollHeight);
   const bounds=await p.locator('#st-btns').evaluate(e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:innerHeight};});
   assert(bounds.top>=0&&bounds.bottom<=bounds.height,JSON.stringify({size,bounds}));
   if(n<4)await p.locator('[data-act="stage-next"]').click();
   else {if(size.width===390)await p.screenshot({path:'docs/qa-incursions/opening-reading-390.jpg',quality:85});await p.locator('[data-act="stage-done"]').click();}
  }
  assert((await result()).hidden);await p.evaluate(()=>hideSheet());
 }
 // A queued fast-open must not escape a closed stage or advance a later session.
 await p.evaluate(()=>{S.fast=true;runStage([{item:byId('u9'),before:0,after:1,opened:true}]);closeStage();S.fast=false;runStage([{item:byId('u9'),before:1,after:2,opened:true}]);});
 await p.waitForTimeout(120);assert.equal((await result()).phase,'sealed');await p.evaluate(()=>closeStage());
 // Safari-style pinch is blocked on the observation but allowed on reading text.
 const gestures=await p.evaluate(()=>{
  const cancel=el=>{const e=new Event('gesturestart',{bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented;};
  openDossier('u9');return{observation:cancel(document.getElementById('obs-frame')),reading:cancel(document.querySelector('.doc p'))};
 });assert.deepEqual(gestures,{observation:true,reading:false});
 assert.deepEqual(errors,[]);console.log('Five-card reading, explicit next/close, scroll reset, portrait/landscape controls, canceled fast timer and reading zoom passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
