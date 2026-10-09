const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});

 await p.locator('[data-trail="guide"]').click();assert((await p.locator('.investigation-goal').innerText()).includes('100pt'));await p.screenshot({path:'docs/qa-incursions/trail-guide-390.jpg',quality:85});
 for(const route of ['gacha','files','lab','home']){
  await p.evaluate(()=>openInvestigationGuide());await p.locator(`[data-trail="${route}"]`).click();assert(await p.locator(`[data-view="${route==='files'?'archive':route}"]`).isVisible());
 }
 // One known anomaly is resolved through actual image-space inputs.
 await p.evaluate(()=>{const o=observationState(),t=Date.now();o.pending={mode:'cctv',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:0,suppression:0,strain:0};o.mind.closed=false;renderObservation();});
 const before=await p.evaluate(()=>S.currency);
 for(let i=0;i<3;i++)await p.locator('#obs-frame').click({position:{x:3,y:3}});
 assert.equal(await p.evaluate(()=>S.observation.pending.suppression),0);assert((await p.locator('#obs-feedback').innerText()).includes('反応がない'));
 const hit=async()=>{const point=await p.locator('#obs-image').evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width*.51,y:r.y+r.height*.34};});await p.mouse.click(point.x,point.y);};
 await hit();assert((await p.locator('#obs-feedback').innerText()).includes('輪郭が揺らいだ'));
 for(let i=0;i<5;i++)await hit();assert.equal(await p.evaluate(()=>S.currency),before+80);
 await p.evaluate(()=>{watchMessage='';watchMessageUntil=0;S.observation.mind.load=0;renderObservation();});
 await p.locator('[data-trail="latest"]').click();assert((await p.locator('.investigation-memo').innerText()).includes('風速計'));assert(await p.evaluate(()=>S.observation.mind.closed));
 assert(await p.evaluate(()=>S.observation.investigation.read['cctv:1']));
 await p.screenshot({path:'docs/qa-incursions/trail-record-390.jpg',quality:85});
 await p.locator('[data-trail="witness"]').click();const line=await p.locator('.watch-conversation blockquote').innerText();assert(line.includes('点検票'));
 const talks=await p.evaluate(()=>S.observation.mind.talks.records);
 await p.locator('[data-trail="record"]').click();assert(await p.locator('.investigation-discrepancy').isVisible());
 await p.locator('[data-trail="witness"]').click();assert.equal(await p.locator('.watch-conversation blockquote').innerText(),line);assert.equal(await p.evaluate(()=>S.observation.mind.talks.records),talks);
 await p.screenshot({path:'docs/qa-incursions/trail-witness-390.jpg',quality:85});
 await p.keyboard.press('Escape');await p.reload();
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 assert(await p.evaluate(()=>S.observation.investigation.discussed['cctv:1']));assert(await p.evaluate(()=>S.observation.mind.closed));assert.equal(await p.evaluate(()=>S.currency),before+80);
 assert.equal(await p.evaluate(()=>investigationRecord('photo:3')),null);assert.equal(await p.evaluate(()=>investigationRecord('__proto__')),null);
 await p.evaluate(()=>{showWatchRecord('photo',3);});assert(await p.locator('#sheet-bg').isHidden(),'unseen record stays hidden');
 await p.locator('#obs-rest').click();assert(!(await p.evaluate(()=>S.observation.mind.closed)));
 // Each acquired record has deterministic notes and testimony, without changing points.
 await p.evaluate(()=>{const o=observationState();for(const mode of Object.keys(OBSERVATIONS))for(let r=0;r<4;r++)o.collection[mode+':'+r]=1;});
 for(const mode of ['cctv','photo','vision','dash'])for(let rarity=0;rarity<4;rarity++){
  await p.evaluate(({mode,rarity})=>showWatchRecord(mode,rarity),{mode,rarity});assert((await p.locator('.investigation-memo p').first().innerText()).length>10);await p.locator('[data-trail="witness"]').click();assert((await p.locator('.watch-conversation blockquote').innerText()).length>10);
 }
 await p.keyboard.press('Escape');
 for(const [width,height] of [[320,568],[390,680],[844,390]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>openInvestigationGuide());
  for(const button of await p.locator('.investigation-guide .game-menu-list button').all()){await button.scrollIntoViewIfNeeded();assert(await button.evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&e.scrollWidth<=e.clientWidth;}));}
  await p.keyboard.press('Escape');await p.evaluate(()=>{S.observation.mind.load=80;S.observation.mind.closed=false;S.observation.quiet=false;renderObservation();});await p.emulateMedia({reducedMotion:'no-preference'});
  assert(await p.locator('#watch-veil').evaluate(e=>getComputedStyle(e,'::after').content!=='none'));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width===390)await p.screenshot({path:'docs/qa-incursions/trail-intrusion-390.jpg',quality:85});
  await p.evaluate(()=>{S.observation.quiet=true;renderObservation();});assert(await p.locator('#watch-veil').isHidden());
  await p.evaluate(()=>{const o=observationState();WatchModel.closeMonitor(o,Date.now(),true);WatchModel.mindTick(o,o.mind.lastAt+300000,{visible:false});renderObservation();});assert.equal(await p.locator('body').getAttribute('data-watch-mind'),'0');
 }
 assert.deepEqual(errors,[]);console.log('Guide routes, missed/valid hits, resolved record → witness → contradiction, persisted rest and idempotent testimony, all 16 records and quiet recovery passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
