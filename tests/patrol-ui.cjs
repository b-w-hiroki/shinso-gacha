const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='docs/qa-incursions';
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('lab');render();});
 await p.locator('.watch-upgrades summary').click();await p.locator('[data-watch-upgrade="patrol"]').click();await p.locator('[data-watch-upgrade="suppression"]').click();assert.equal(await p.evaluate(()=>S.currency),4100);
 await p.evaluate(()=>{go('home');setHomeTab('desk');scrollTo(0,0);const o=observationState(),t=Date.now();o.pending={mode:'cctv',rarity:1,readyAt:t,expiresAt:t+3600000,sequence:0,suppression:5};o.autoLastAt=t;renderObservation();});
 const before=await p.evaluate(()=>({pt:S.currency,clicks:S.clicks}));
 await p.evaluate(()=>{S.observation.autoLastAt=Date.now()-6000;watchLastTick=0;observationTick();});
 assert.deepEqual(await p.evaluate(()=>({pt:S.currency,clicks:S.clicks})),{pt:before.pt+80,clicks:before.clicks},'auto reward does not farm manual missions');
 for(const place of ['settings','archive','stage']){
  await p.evaluate(place=>{if(place==='settings')observationSettings();else if(place==='archive')go('archive');else document.getElementById('stage').hidden=false;S.observation.tapProgress=0;S.observation.autoLastAt=Date.now()-6000;watchLastTick=0;observationTick();},place);
  assert.equal(await p.evaluate(()=>S.observation.tapProgress),0,'pause in '+place);
  await p.evaluate(()=>{document.getElementById('sheet-bg').hidden=true;document.getElementById('stage').hidden=true;go('home');scrollTo(0,0);});
 }
 await p.locator('[data-watch="settings"]').click();await p.locator('[data-watch-auto]').uncheck();await p.keyboard.press('Escape');
 await p.evaluate(()=>{S.observation.autoLastAt=Date.now()-6000;watchLastTick=0;observationTick();});assert.equal(await p.evaluate(()=>S.observation.tapProgress),0);
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});
  for(const selector of ['#obs-tap','[data-watch="settings"]','#game-menu']){const el=p.locator(selector);await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));assert(await el.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.width>=44&&r.height>=44&&e.scrollWidth<=e.clientWidth&&(e===hit||e.contains(hit));}),selector+' accessible at '+width);}
  await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${out}/patrol-${width}.jpg`,quality:85});
  await p.evaluate(()=>{const it=ITEMS.find(i=>i.id==='u2');runStage([{item:it,before:4,after:5,opened:true}]);advance();});await p.locator('#st-card.truthy').waitFor();await p.locator('.ghost').waitFor({state:'hidden'});assert.equal(await p.locator('#stage').evaluate(e=>getComputedStyle(e,'::after').opacity),'0','reduced motion flash cannot cover the document');
  assert(await p.locator('#st-card').evaluate(e=>{const stamp=e.querySelector('.truth').getBoundingClientRect(),text=e.querySelector('.lyr').getBoundingClientRect();return stamp.top>=text.bottom+4&&stamp.left>=e.getBoundingClientRect().left;}),'truth stamp has its own space');
  await p.locator('#st-card .truth').evaluate(e=>e.scrollIntoView({block:'nearest',behavior:'instant'}));await p.screenshot({path:`${out}/truth-${width}.jpg`,quality:85});await p.evaluate(()=>closeStage());
  await p.evaluate(()=>{S.levels.u2=5;go('archive');setSectionTab('archive:files');render();});
  const folder=p.locator('.folder.truth').first();assert(await folder.count());assert(await folder.evaluate(e=>getComputedStyle(e).position==='relative'&&getComputedStyle(e,'::after').position==='static'),'archive truth marker stays in document flow');
  await p.evaluate(()=>go('home'));
 }
 assert.deepEqual(errors,[]);console.log('Foreground automation, reward accounting, lower controls and truth stamp separation passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
