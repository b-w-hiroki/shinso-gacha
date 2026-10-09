const {compareEvidence,finishWork}=require('./incursion-steps.cjs');
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());const url='http://127.0.0.1:'+server.address().port;await p.goto(url);
async function font(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}}
await font();
await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;applyMode();});
async function setup(kind,tier=1){await p.evaluate(({kind,tier})=>{S.incursion={version:1,level:40,resolved:kind,manual:8,history:[],event:{kind,tier,step:0,seen:0,round:0}};openIncursion();},{kind,tier});if(await p.locator('[data-inc="inspect"]').count())await p.locator('[data-inc="inspect"]').click();await compareEvidence(p);}
async function select(kind){const answer=await p.evaluate(kind=>INCURSIONS[kind].answer,kind);await p.locator(`[data-inc="isolate"][data-value="${answer}"]`).click();}
// Progress in every grammar survives a reload; premature completion never awards materials.
for(const [kind,action,value,field,expected] of [[7,'procedure',0,'work',1],[48,'wire',0,'wires',1],[34,'contact',0,'contacts',1],[76,'current',0,'seen',3]]){
 await setup(kind);await select(kind);
 if(kind!==76)await p.locator(`[data-inc="${action}"]${action==='contact'?'':`[data-value="${value}"]`}`).click();
 const state=await p.evaluate(()=>structuredClone(S.incursion));
 if(kind!==76){await p.evaluate(()=>incursionAction('quarantine',0));assert.equal(await p.evaluate(()=>S.incursion.samples),0);assert(await p.locator('[data-inc="quarantine"]').isDisabled());}
 await p.reload();await font();await p.evaluate(()=>openIncursion());assert.equal(await p.evaluate(field=>S.incursion.event[field],field),expected);assert.equal(await p.evaluate(()=>S.incursion.event.kind),kind);
 // Resume from the saved position via available controls.
 if(action==='procedure')for(let i=1;i<3;i++)await p.locator(`[data-inc="procedure"][data-value="${i}"]`).click();
 else if(action==='wire')await p.locator('[data-inc="wire"][data-value="1"]').click();else if(action==='contact')await finishWork(p);
 await p.locator('[data-inc="quarantine"]').click();assert.equal(await p.evaluate(kind=>S.incursion.discovered[kind],kind),true);assert.equal(await p.evaluate(()=>S.incursion.samples),1);
 await p.evaluate(()=>incursionAction('quarantine',0));assert.equal(await p.evaluate(()=>S.incursion.samples),1);
}
// Actual photograph target geometry, misses, and reduced/quiet path.
for(const kind of [6,91,92,96]){
 await setup(kind);await select(kind);const photo=p.locator('.inc-contact-photo');await photo.locator('img').evaluate(im=>im.decode());
 if(kind===91){await photo.scrollIntoViewIfNeeded();await p.screenshot({path:'docs/qa-incursions/experience-contact-390.jpg',quality:85});}
 await photo.click({position:{x:3,y:3}});assert.equal(await p.evaluate(()=>S.incursion.event.contacts),0);
 const target=await p.evaluate(kind=>INC_VISUALS[INCURSIONS[kind].visual].target,kind);
 for(let i=0;i<5;i++){const box=await photo.boundingBox();await photo.click({position:{x:box.width*target[0],y:box.height*target[1]}});}
 assert(await p.locator('[data-inc="quarantine"]').isEnabled());await p.locator('[data-inc="quarantine"]').click();
}
// Every family is readable/reachable at narrow portrait and short landscape sizes.
const samples=[7,20,34,48,62,76,91],shots=[];
for(const [width,height] of [[320,568],[390,680],[844,390]]){
 await p.setViewportSize({width,height});
 for(const kind of samples){
  await setup(kind);assert(await p.evaluate(()=>document.getElementById('incursion-dialog').scrollWidth<=document.getElementById('incursion-dialog').clientWidth+1));
  if(width===390){await p.locator('#incursion-title').scrollIntoViewIfNeeded();await p.screenshot({path:`docs/qa-incursions/experience-${kind}-390.jpg`,quality:85});shots.push(kind);}
  await select(kind);await finishWork(p);const btn=p.locator('[data-inc="quarantine"]');await btn.scrollIntoViewIfNeeded();assert(await btn.evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.bottom<=innerHeight&&r.top>=0;}));await btn.click();
 }
}
// Repeat tier 3 rounds with fresh work, preserving single final payout.
await p.setViewportSize({width:390,height:680});await setup(48,3);
for(let round=0;round<3;round++){await select(48);assert(await p.locator('[data-inc="quarantine"]').isDisabled());await finishWork(p);await p.locator('[data-inc="quarantine"]').click();assert.equal(await p.evaluate(()=>S.incursion.samples),round===2?3:0);}
await setup(91);await p.evaluate(()=>{S.incursion.quiet=true;drawIncursion();});assert.equal(await p.locator('.inc-presence,.inc-contact-photo').count(),0);await select(91);await finishWork(p);await p.locator('[data-inc="quarantine"]').click();
assert.deepEqual(errors,[]);console.log('All grammars save/resume, photo hit/miss, seven families at three phone layouts, quiet path and tier-3 accounting passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
