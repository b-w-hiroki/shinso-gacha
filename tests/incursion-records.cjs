const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const requested=new Set();
const server=http.createServer((q,r)=>{try{if(q.url.startsWith('/assets/incursions/cases/'))requested.add(q.url);const f=path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'no-preference'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};applyMode();render();});

 if(process.env.QA_FONT){const font=fs.readFileSync(process.env.QA_FONT).toString('base64');await p.addStyleTag({content:`@font-face{font-family:QA;src:url(data:font/otf;base64,${font})}body{--f-body:QA;--f-display:QA;--f-mono:QA}`});await p.evaluate(()=>document.fonts.ready);}
 await p.evaluate(()=>{go('archive');setSectionTab('archive:observations');});
 await p.locator('[data-spane="archive:observations"] [data-inc="records"]').click();
 assert.equal(await p.locator('.inc-record-list button').count(),0);
 assert.equal(requested.size,0,'Empty collection never loads unseen photos');
 await p.evaluate(()=>{S.incursion={version:1,level:40,resolved:2,discovered:{34:true,99:true},history:[],event:{kind:6,tier:1,step:0,seen:0,round:0}};openIncursionRecords();});
 const before=await p.evaluate(()=>JSON.stringify({a:incursionState(),pt:S.pt}));
 assert.equal(await p.locator('.inc-record-list button').count(),2);
 assert.equal(requested.size,0,'List does not preload any photos');
 await p.evaluate(()=>openIncursionRecords(91));assert.equal(await p.locator('.inc-record-list button').count(),2,'Unowned records cannot be opened directly');
 await p.locator('[data-inc="record"][data-value="34"]').click();
 await p.locator('.inc-record-photo img').evaluate(im=>im.decode());
 assert.equal(await p.locator('[data-inc="record"]').first().isDisabled(),true);
 assert.equal(await p.locator('[data-inc="quarantine"]').count(),0,'Reading has no completion action');
 await p.locator('[data-inc="record"][data-value="99"]').click();await p.locator('.inc-record-photo img').evaluate(im=>im.decode());
 assert.equal(await p.locator('[data-inc="record"]').last().isDisabled(),true);
 assert.deepEqual([...requested].sort(),['/assets/incursions/cases/034.webp','/assets/incursions/cases/099.webp']);
 for(const [width,height] of [[320,568],[390,680],[844,390]]){
  await p.setViewportSize({width,height});
  assert(await p.locator('#incursion-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1),'No horizontal overflow');
  const nav=await p.locator('.inc-record-nav').boundingBox();assert(nav.y>=0&&nav.y+nav.height<=height,'All navigation stays inside viewport');
  if(width===390){await p.evaluate(()=>document.getElementById('incursion-dialog').scrollTop=0);fs.mkdirSync('docs/qa-incursions',{recursive:true});await p.screenshot({path:'docs/qa-incursions/record-viewer-390.jpg'});}
 }
 await p.locator('#incursion-dialog [data-inc="records"]').click();
 assert.equal(await p.evaluate(()=>document.activeElement.dataset.value),'99','Back restores the selected record focus');
 assert.equal(await p.evaluate(()=>JSON.stringify({a:incursionState(),pt:S.pt})),before,'Reading does not change danger, contact, rewards or discovery');
 await p.locator('#incursion-dialog [data-inc="open"]').click();assert.equal(await p.evaluate(()=>S.incursion.event.kind),6);
 await p.evaluate(()=>{S.incursion.quiet=true;openIncursionRecords(34);});assert.equal(await p.locator('.inc-record-photo img').count(),0);
 await p.keyboard.press('Escape');assert.equal(await p.locator('#incursion-dialog').evaluate(d=>d.open),false);
 assert.equal(await p.evaluate(()=>document.activeElement.dataset.inc),'records','Close restores launch control focus');
 await p.evaluate(()=>{markDirty();});await p.reload();await p.evaluate(()=>openIncursionRecords());
 assert.equal(await p.locator('.inc-record-list button').count(),2,'Collection persists across reload');
 assert.deepEqual(errors,[]);console.log('Collection: owned-only photos, quiet mode, mobile bounds, focus, persisted discovery and read-only rewards/encounter passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
