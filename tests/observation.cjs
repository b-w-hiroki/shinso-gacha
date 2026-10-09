const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='docs/qa-incursions';const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};applyMode();});
async function font(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}}
await font();

await p.evaluate(()=>{go('home');setHomeTab('desk');S.currency=100;S.sniffDay={d:dayKey(),pts:0};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};delete S.observation;render();});
for(const [width,height] of [[320,568],[390,844],[430,932],[844,390]]){
 await p.setViewportSize({width,height});
 for(const mode of ['cctv','photo','vision','dash']){
  await p.locator(`[data-obs-mode="${mode}"]`).click();
  assert.equal(await p.locator('#obs-frame').getAttribute('data-mode'),mode);
  assert(await p.locator('#obs-frame').isVisible(),'scene must not be hidden by page navigation');
  assert(await p.locator('#obs-image').evaluate(async e=>{const i=new Image();i.src=getComputedStyle(e).backgroundImage.slice(5,-2);await i.decode();return i.naturalWidth>1000&&e.getBoundingClientRect().height>=150;}),'asset decoded at useful size');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('.obs-preview summary').click();
  const before=await p.evaluate(()=>({pt:S.currency,level:incursionState().level,frames:observationState().frames}));
  await p.locator('[data-obs="preview-after"]').click();
  assert.equal(await p.locator('#obs-frame').getAttribute('data-observation-view'),'after');
  assert(await p.locator('#sniff').isDisabled());assert(await p.locator('#obs-report').isDisabled());
  await p.evaluate(()=>document.getElementById('sniff').click());
  assert.deepEqual(await p.evaluate(()=>({pt:S.currency,level:incursionState().level,frames:observationState().frames})),before);
  await p.locator('[data-obs="preview-before"]').click();assert.equal(await p.locator('#obs-frame').getAttribute('data-observation-view'),'before');
  await p.locator('[data-obs="preview-exit"]').click();await p.locator('.obs-preview summary').click();
  if(width===390){await p.evaluate(()=>scrollTo(0,0));const tap=await p.locator('#sniff').boundingBox(),nav=await p.locator('.nav').boundingBox();assert(tap.y+tap.height<=nav.y,'observation action fits first view');}
  // All action hit areas remain reachable, with no decorative overlay intercepting taps.
  for(const id of ['obs-reference','obs-report','sniff']){
   const el=p.locator('#'+id);await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   assert(await el.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&(hit===e||e.contains(hit));}),`${width}/${mode}/${id}`);
  }
  await p.evaluate(()=>scrollTo(0,0));
  if(width===390){await p.evaluate(()=>{observationPreview=true;observationMessage='';renderObservation();renderSniffCap();});await p.screenshot({path:`${out}/observation-${mode}-390.jpg`,quality:85});await p.evaluate(()=>{observationPreview=null;renderObservation();});}
 }
}
await p.setViewportSize({width:390,height:844});
await p.evaluate(()=>{S.observation.remaining=1;tapTimes=[];S.incursion.level=0;S.incursion.event=null;render();});
const pt=await p.evaluate(()=>S.currency);await p.locator('#sniff').evaluate(e=>e.scrollIntoView({block:'center'}));await p.locator('#sniff').click();
assert.equal(await p.evaluate(()=>S.currency),pt+2);assert.equal(await p.locator('#obs-frame').getAttribute('data-observation-view'),'after');
await p.locator('#obs-reference').click();assert.equal(await p.locator('#obs-frame').getAttribute('data-observation-view'),'before');await p.locator('#obs-reference').click();
await p.locator('#obs-report').click();assert.equal(await p.evaluate(()=>S.currency),pt+7);assert.equal(await p.evaluate(()=>incursionState().level),12);
await p.locator('#obs-report').click();assert.equal(await p.evaluate(()=>S.currency),pt+7,'no duplicate reward');
await p.evaluate(()=>{S.observation.reports=10;S.observation.anomaly=true;render();});await p.locator('#obs-report').click();assert.equal(await p.evaluate(()=>S.currency),pt+7,'daily cap');
await p.evaluate(()=>{S.observation.day='2000-1-1';S.observation.anomaly=true;render();});await p.locator('#obs-report').click();assert.equal(await p.evaluate(()=>S.currency),pt+12);assert(await p.evaluate(()=>!!incursionState().event));
await p.locator('#obs-report').click();assert(await p.locator('#incursion-dialog').isVisible());await p.keyboard.press('Escape');
// Automatic protection uses existing upgrades and leaves the observed scene calm.
await p.evaluate(()=>{S.incursion.level=24;S.incursion.event=null;S.incursion.defense.guardian=2;S.incursion.autoWait=0;S.incursion.autoEnabled=true;S.incursion.cooldown=0;S.observation.anomaly=true;render();});
await p.locator('#obs-report').click();assert.equal(await p.evaluate(()=>incursionState().level),0);assert.equal(await p.locator('#obs-frame').getAttribute('data-observation-view'),'before');
await p.evaluate(()=>{observationState().quiet=true;S.streak={last:dayKey(),n:1};S.lastTick=Date.now()+600000;save();});const saved=await p.evaluate(()=>JSON.stringify(S.observation));await p.reload();assert.equal(await p.evaluate(()=>JSON.stringify(S.observation)),saved);assert.equal(await p.locator('#obs-frame').getAttribute('data-quiet'),'true');
assert.deepEqual(errors,[]);console.log('Four observation media, preview isolation, reward caps, defense, persistence and mobile hit targets passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
