const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='docs/qa-incursions';const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};applyMode();});
async function font(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}}
await font();

await p.evaluate(()=>{go('home');setHomeTab('desk');S.currency=100;S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.observation=WatchModel.create(Date.now(),42);S.streak={last:dayKey(),n:1};save();render();});
assert.equal(await p.locator('[data-obs-mode],#obs-report,#obs-reference,#sniff,.obs-preview').count(),0,'no permanent comparison/report/tap button group');
assert.equal(await p.locator('.thread-radar button').count(),4,'scene, rest, colleagues and unlocked settings; no patrol button');
const initial=await p.evaluate(()=>S.currency);assert(await p.locator('#obs-frame').isEnabled());
for(let i=0;i<9;i++)await p.locator('#obs-frame').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>S.currency),initial,'partial patrol does not pay');
const expected=8;await p.locator('#obs-frame').click();assert.equal(await p.evaluate(()=>S.currency),initial+expected);await p.locator('#obs-frame').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>S.currency),initial+expected);
await p.keyboard.press('Escape'); // A keyboard tap on an anomaly opens location selection.
// Collection records discoveries, survives reload and never pays for replay.
const recordKey=await p.evaluate(()=>S.observation.history[0].mode+':'+S.observation.history[0].rarity);
await p.evaluate(()=>{go('archive');setSectionTab('archive:observations');});
assert.equal(await p.locator('[data-watch-record]:enabled').count(),1);assert.equal(await p.locator('[data-watch-record]:disabled').count(),15);
await p.locator(`[data-watch-record="${recordKey}"]`).click();assert(await p.locator('.watch-record-image').isVisible());assert.equal(await p.evaluate(()=>S.currency),initial+expected);await p.keyboard.press('Escape');
await p.evaluate(()=>save());await p.reload();await font();assert.equal(await p.evaluate(k=>S.observation.collection[k],recordKey),1);
// Album comparison never reveals an uncollected normal image; completion pays once.
await p.evaluate(()=>{S.lastTick=Date.now()+600000;S.observation=WatchModel.create(Date.now(),42);S.observation.collection={'cctv:1':1};go('archive');setSectionTab('archive:observations');render();});
await p.locator('[data-watch-record="cctv:1"]').click();assert.equal(await p.locator('[data-watch-compare]').count(),0);await p.keyboard.press('Escape');
await p.evaluate(()=>{S.observation.collection={'cctv:0':1,'cctv:1':3,'cctv:2':1,'cctv:3':1};renderObservationAlbum();});
const beforeSet=await p.evaluate(()=>S.currency);
await p.locator('[data-watch-record="cctv:3"]').click();
await p.locator('[data-watch-compare]').click();assert.equal(await p.locator('[data-watch-compare]').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('.watch-record-image').getAttribute('aria-label'),'日中の公園');
await p.locator('[data-watch-compare]').click();assert.equal(await p.locator('.watch-record-image').getAttribute('aria-label'),'砂場の整列');assert((await p.locator('.watch-record-image').getAttribute('style')).includes('cctv-variants.webp'));assert.equal(await p.evaluate(()=>S.currency),beforeSet);await p.keyboard.press('Escape');
for(const [width,height] of [[320,568],[390,844],[844,390]]){
 await p.setViewportSize({width,height});await p.locator('[data-watch-set="cctv"]').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
 assert(await p.locator('[data-watch-set="cctv"]').evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {ok:r.height>=44&&e.scrollWidth<=e.clientWidth&&(hit===e||e.contains(hit)),height:r.height,scroll:e.scrollWidth,client:e.clientWidth,hit:hit?.outerHTML.slice(0,200),y:r.y};}).then(x=>{assert(x.ok,JSON.stringify(x));return true;}));
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(width===390)await p.screenshot({path:`${out}/album-completion-390.jpg`,quality:85});
}
await p.locator('[data-watch-set="cctv"]').click();assert.equal(await p.evaluate(()=>S.currency),beforeSet+80);
await p.locator('[data-watch-set="cctv"]').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>S.currency),beforeSet+80);assert(await p.locator('[data-watch-set="photo"]').isDisabled());
await p.reload();await font();await p.evaluate(()=>{go('archive');setSectionTab('archive:observations');});assert(await p.locator('[data-watch-set="cctv"]').isDisabled());assert(await p.evaluate(()=>S.observation.completedSets.cctv));
await p.setViewportSize({width:390,height:844});
// Research confirmation consumes only duplicates and never pays or disturbs a held record.
await p.evaluate(()=>{S.observation=WatchModel.create(Date.now(),42);const o=observationState();o.collection={'cctv:0':47,'cctv:1':2,'cctv:2':2};o.dueAt=Date.now()-100;observationSync();S.lastTick=Date.now()+600000;go('archive');setSectionTab('archive:observations');render();});
const researchBefore=await p.evaluate(()=>({pt:S.currency,pending:JSON.stringify(S.observation.pending),count:S.observation.collected}));
await p.locator('[data-watch-research="cctv"]').click();assert(!(await p.locator('#sheet').textContent()).includes('砂場の整列'),'no unseen name in confirmation');
await p.locator('[data-watch-research-cancel]').click();assert.equal(await p.evaluate(()=>S.observation.researchSpent.cctv),0);
for(const [width,height] of [[320,568],[390,844],[844,390]]){
 await p.setViewportSize({width,height});await p.locator('[data-watch-research="cctv"]').click();
 const confirm=p.locator('[data-watch-research-confirm]');await confirm.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
 assert(await confirm.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&e.scrollWidth<=e.clientWidth&&(hit===e||e.contains(hit));}));
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(width===390)await p.screenshot({path:`${out}/research-confirm-390.jpg`,quality:85});
 await p.locator('[data-watch-research-cancel]').click();
}
await p.setViewportSize({width:390,height:844});await p.locator('[data-watch-research="cctv"]').click();await p.locator('[data-watch-research-confirm]').click();
assert((await p.locator('.watch-record-caption').textContent()).includes('照合で復元'));assert.equal(await p.locator('.watch-record-image').getAttribute('aria-label'),'砂場の整列');
assert.deepEqual(await p.evaluate(()=>({pt:S.currency,pending:JSON.stringify(S.observation.pending),count:S.observation.collected})),researchBefore);
assert.equal(await p.evaluate(()=>S.observation.researchSpent.cctv),48);assert.equal(await p.evaluate(()=>S.observation.collection['cctv:0']),47);
await p.screenshot({path:`${out}/research-result-390.jpg`,quality:85});await p.keyboard.press('Escape');assert.equal(await p.locator('[data-watch-research="cctv"]').count(),0);
await p.reload();await font();assert(await p.evaluate(()=>S.observation.reconstructed['cctv:3']));assert.equal(await p.evaluate(()=>S.observation.researchSpent.cctv),48);
await p.evaluate(()=>{S.observation=WatchModel.create(Date.now(),42);save();});
// Genuine growth flow: locked source -> unlock -> equip, with point deductions.
await p.evaluate(()=>{S.currency=1000;S.observation.collected=5;go('lab');render();});
await p.locator('[data-watch-unlock="photo"]').click();assert.equal(await p.evaluate(()=>S.currency),900);await p.locator('[data-watch-equip="photo"]').click();assert.equal(await p.evaluate(()=>S.observation.mode),'photo');assert(await p.locator('[data-watch-unlock="vision"]').isDisabled());
await p.locator('.watch-upgrades summary').click();await p.locator('[data-watch-upgrade="retention"]').click();assert.equal(await p.evaluate(()=>S.currency),820);assert.equal(await p.evaluate(()=>S.observation.upgrades.retention),1);
await p.evaluate(()=>{go('home');S.observation.dueAt=Date.now()-1000;renderObservation();save();});
const saved=await p.evaluate(()=>JSON.stringify(S.observation.pending));await p.reload();await font();assert.equal(await p.evaluate(()=>JSON.stringify(S.observation.pending)),saved);assert(await p.locator('#obs-ready').isVisible());
await p.locator('[data-watch="settings"]').click();assert(await p.locator('.watch-settings').isVisible());await p.locator('[data-watch-quiet]').check();await p.keyboard.press('Escape');assert.equal(await p.locator('#obs-frame').getAttribute('data-quiet'),'true');
// Every medium and rarity draws a decoded large image; only one capture surface exists.
for(const [width,height] of [[320,568],[390,844],[430,932],[844,390]]){
 await p.setViewportSize({width,height});
 for(const mode of ['cctv','photo','vision','dash']){
  for(const rarity of [0,1,2,3]){
   await p.evaluate(({mode,rarity})=>{const o=observationState();o.unlocked=Object.keys(WatchModel.MODES);o.mode=mode;const now=Date.now();o.pending={mode,rarity,readyAt:now,expiresAt:now+WatchModel.hold(o),sequence:o.sequence};go('home');render();},{mode,rarity});
   const frame=p.locator('#obs-frame');await frame.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   assert(await frame.isVisible());const rect=await frame.boundingBox();assert(rect.width>=Math.min(width-32,576)&&rect.height>=100,JSON.stringify(rect));
   assert(await p.locator('#obs-image').evaluate(async e=>{const im=new Image();im.src=getComputedStyle(e).backgroundImage.slice(5,-2);await im.decode();return im.naturalWidth>1000;}));
   await frame.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   assert(await frame.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {ok:hit===e||e.contains(hit),rect:r.toJSON(),hit:hit?.outerHTML.slice(0,300),scroll:scrollY};}).then(x=>{assert(x.ok,JSON.stringify({mode,rarity,width,...x}));return true;}),'scene tap not covered');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width===390&&rarity===3){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${out}/watch-${mode}-390.jpg`,quality:85});}
  }
 }
 for(const view of ['gacha','archive','lab','report']){await p.evaluate(v=>go(v),view);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width===390)await p.screenshot({path:`${out}/focus-${view}-390.jpg`,quality:85});}
}
// Header menu: notices persist read state; game mail attachments pay once only.
await p.setViewportSize({width:320,height:568});
await p.evaluate(()=>{go('home');S.lastTick=Date.now()+600000;render();});
await p.locator('#game-menu').click();await p.locator('[data-menu="news"]').click();
const noticeIds=await p.evaluate(()=>GAME_NOTICES.map(n=>n.id));
for(const id of noticeIds){await p.locator(`[data-notice="${id}"]`).click();assert(await p.locator('.game-message h2').isVisible());await p.locator('[data-menu="news"]').click();}
await p.locator('[data-menu="home"]').click();await p.locator('[data-menu="inbox"]').click();await p.locator('[data-mail="welcome-1"]').click();
const beforeMail=await p.evaluate(()=>S.currency);await p.locator('[data-mail-claim="welcome-1"]').click();assert.equal(await p.evaluate(()=>S.currency),beforeMail+50);await p.locator('[data-mail-claim="welcome-1"]').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>S.currency),beforeMail+50);
await p.reload();await font();assert(await p.evaluate(()=>S.communications.mail['welcome-1'].claimed));assert.equal(await p.evaluate(()=>S.communications.readNotices.length),noticeIds.length);
await p.locator('#game-menu').click();await p.locator('[data-menu="inbox"]').click();assert(await p.locator('[data-mail="records-5"]').isVisible());
await p.screenshot({path:`${out}/menu-inbox-320.jpg`,quality:85});await p.keyboard.press('Escape');
for(const width of [320,390,430]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.locator('#game-menu').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e||e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));}
// Expired observation never pays or escalates danger; passive pt still work.
await p.evaluate(()=>{go('home');S.incursion.level=0;S.incursion.event=null;const o=observationState();o.lastSeen=Date.now()-2000;o.pending.expiresAt=Date.now()-1000;o.pending.readyAt=Date.now()-4*3600000;S.lastTick=Date.now()+600000;render();});assert(!(await p.locator('#obs-ready').isVisible()));const expired=await p.evaluate(()=>S.currency);assert(await p.locator('#obs-frame').isEnabled());await p.locator('#obs-frame').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>S.currency),expired);assert.equal(await p.evaluate(()=>incursionState().level),0);
await p.evaluate(()=>{S.lastTick=Date.now()-idleStep()*2;tick();});assert.equal(await p.evaluate(()=>S.currency),expired+2);
assert.deepEqual(errors,[]);console.log('Single scene clock collection, unlock/growth, persistence, 16 visuals and four responsive sizes passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
