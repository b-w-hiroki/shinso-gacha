const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});


 await p.evaluate(()=>{S.currency=0;S.lastTick=Date.now()+600000;render();});
 const pt=()=>p.evaluate(()=>S.currency);
 for(let i=1;i<=9;i++){
  await p.locator('#obs-frame').click();assert.equal(await pt(),i);assert.equal(await p.locator('#pt').innerText(),String(i));
 }
 assert.equal(await p.evaluate(()=>S.observation.collected),0);
 await p.locator('#obs-frame').click();assert.equal(await pt(),18);assert.equal(await p.evaluate(()=>S.observation.collected),1);
 const before=await pt();
 await p.evaluate(()=>{const o=observationState(),t=Date.now();o.pending={mode:'cctv',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:0,suppression:0,strain:0};o.mind.closed=false;renderObservation();});
 for(let i=0;i<3;i++)await p.locator('#obs-frame').click({position:{x:2,y:2}});
 assert.equal(await pt(),before+3);assert.equal(await p.evaluate(()=>S.observation.pending.suppression),0);
 await p.locator('#obs-help').click();assert.equal(await pt(),before+3,'help does not award');
 for(let i=0;i<6;i++)await p.locator('[data-watch-region="4"]').click();
 assert.equal(await pt(),before+3+6+80);assert(await p.locator('#sheet-bg').isHidden());
 const complete=await pt();await p.locator('#obs-rest').click();
 await p.locator('#obs-frame').evaluate(e=>e.click());assert.equal(await pt(),complete,'closed monitor does not award');
 await p.evaluate(()=>{observationTick();observationTick();});assert.equal(await pt(),complete,'background observation does not award tap points');
 await p.locator('.nav [data-nav="gacha"]').click();assert(await p.locator('[data-pull="5"]').isEnabled(),'new tap income refreshes affordability');
 await p.reload();assert.equal(await pt(),complete);assert(await p.evaluate(()=>S.observation.mind.closed));
 // Counter animation cannot overwrite a newer immediate tap amount.
 await p.evaluate(()=>{S.currency=200;shownPt=0;animatePt();S.currency=201;animatePt(true);});await p.waitForTimeout(400);assert.equal(await p.locator('#pt').innerText(),'201');
 assert.deepEqual(errors,[]);console.log('Every active tap and region contact pays 1pt; target-only suppression, additive bonuses, disabled/help/idle exclusions, wallet, navigation affordability and reload passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
