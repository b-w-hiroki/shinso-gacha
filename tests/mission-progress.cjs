const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=process.env.QA_WEBKIT?await webkit.launch():await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage',...(process.platform==='win32'?[]:['--no-zygote','--single-process'])]});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;S.missions.click10.p=1;S.missions.pull3.p=3;S.missions.layer2.p=8;S.missions.share1.p=-2;applyMode();go('home');setHomeTab('tasks');render();});
 const bars=p.locator('#missions [role="progressbar"]');assert.equal(await bars.count(),4);
 const state=await bars.evaluateAll(els=>els.map(e=>({name:e.getAttribute('aria-label'),min:e.getAttribute('aria-valuemin'),max:e.getAttribute('aria-valuemax'),now:e.getAttribute('aria-valuenow'),width:e.querySelector('i').style.width})));
 assert.deepEqual(state.map(x=>x.now),['1','3','2','0']);assert.deepEqual(state.map(x=>x.max),['3','3','2','1']);assert(state.every(x=>x.name.endsWith('の進捗')&&x.min==='0'));
 assert(Math.abs(Number.parseFloat(state[0].width)-100/3)<0.01);assert.deepEqual(state.slice(1).map(x=>Number.parseFloat(x.width)),[100,100,0]);
 assert.match(await p.locator('#missions .mi').nth(3).innerText(),/0\/1/,'invalid old progress is not shown as a negative count');
 await p.emulateMedia({reducedMotion:'no-preference'});
 const claimStyle=await p.locator('#missions [data-act="claim"]').first().evaluate(e=>({animation:getComputedStyle(e).animationName,font:Number.parseFloat(getComputedStyle(e).fontSize),height:e.getBoundingClientRect().height}));
 assert.equal(claimStyle.animation,'none','claim actions do not pulse even without reduced-motion');assert(claimStyle.font>=14&&claimStyle.height>=44);
 await p.setViewportSize({width:320,height:568});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'claim actions fit the narrow phone');
 await p.setViewportSize({width:390,height:680});await p.emulateMedia({reducedMotion:'reduce'});
 if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/mission-progress-390.jpg',quality:85});
 assert(await p.locator('#claim-all').isVisible());const before=await p.evaluate(()=>S.currency);await p.locator('#claim-all').click();assert.equal(await p.evaluate(()=>S.currency),before+45);assert(await p.locator('#claim-all').isHidden());
 assert.deepEqual(await bars.evaluateAll(els=>els.map(e=>e.getAttribute('aria-valuenow'))),['1','3','2','0']);
 await p.evaluate(()=>render());assert.equal(await p.evaluate(()=>S.currency),before+45,'redrawing does not re-award missions');
 await p.setViewportSize({width:320,height:568});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('Mission progress names, bounded values and widths, claim once, redraw and 320px layout passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
