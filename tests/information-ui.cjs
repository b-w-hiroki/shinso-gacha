const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='docs/qa-incursions';const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};applyMode();});
async function font(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}}
await font();

await p.evaluate(()=>{S.incursion={version:1,level:0,resolved:0,history:[]};S.currency=543;S.lastTick=Date.now()+600000;go("home");setHomeTab("desk");render();});
for(const [level,tier,label] of [[0,1,'静穏'],[12,1,'微かな反応'],[36,2,'反応あり'],[90,3,'接近中']]){
 await p.evaluate(({level,tier})=>{S.incursion.level=level;S.incursion.event=level>=36?{kind:2,tier,round:0,step:0}:null;renderIncursion();},{level,tier});
 assert.equal(await p.locator('#incursion-status').isVisible(),level>=36);
 if(level>=36){await p.locator('#incursion-status').click();assert(await p.locator('#incursion-dialog').isVisible());await p.keyboard.press('Escape');}
}
await p.evaluate(()=>{S.incursion.level=0;S.incursion.event=null;observationState().upgrades.retention=1;render();});
await p.locator('#obs-equipment').click();await p.locator('[data-watch="settings"]').click();await p.locator('.watch-settings [data-desk="evidence"]').click();assert(await p.locator('.evidence-stack').isVisible());assert.equal(await p.locator('.case-choices button').count(),3);await p.keyboard.press('Escape');await p.locator('.watch-lab [data-watch="return"]').click();
for(const [width,height] of [[320,568],[390,700],[430,932]]){
 await p.setViewportSize({width,height});await p.locator('#wallet').click();assert.equal(await p.locator('.wallet-rank').count(),0);assert.equal(await p.locator('#wallet-current').innerText(),'543pt');
 await p.evaluate(()=>{S.currency=654;render();});assert.equal(await p.locator('#wallet-current').innerText(),'654pt');assert(await p.locator('#wallet-hour').isVisible());
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`${out}/wallet-clean-${width}.jpg`,quality:85});await p.keyboard.press('Escape');await p.evaluate(()=>{S.currency=543;render();});
 await p.evaluate(()=>go('report'));await p.locator('#agent-record').click();assert(await p.locator('#rk-lv').isVisible());await p.keyboard.press('Escape');await p.evaluate(()=>go('home'));
}
await p.setViewportSize({width:390,height:700});await p.screenshot({path:`${out}/home-clean.jpg`,quality:85});

for(const width of [320,390]){
 await p.setViewportSize({width,height:700});
 for(const type of ['cctv','map','audio','intercom','transit','photo']){
  await p.evaluate(type=>{for(let i=0;i<1000;i++){S.pulls=i;if(anomalyEvidence().type===type)break;}openAnomalyEvidence();},type);
  assert.equal(await p.locator('.evidence-view').getAttribute('data-kind'),type);
  const caption=await p.locator('.ev-transcript').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),range=document.createRange();range.selectNodeContents(e);const text=range.getBoundingClientRect();return {left:parseFloat(s.paddingLeft),right:parseFloat(s.paddingRight),inside:text.left>=r.left+12&&text.right<=r.right-12,overflow:e.scrollWidth>e.clientWidth};});
  assert(caption.left>=12&&caption.right>=12&&caption.inside&&!caption.overflow,JSON.stringify({width,type,caption}));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(type==='transit'&&width===390)await p.screenshot({path:out+'/evidence-spacing-390.jpg',quality:85});
  await p.keyboard.press('Escape');
 }
}

// Passive income remains independent of the single observation slot.
await p.evaluate(()=>{go('home');S.currency=100;S.lastTick=Date.now()-idleStep()*2;tick();});assert.equal(await p.evaluate(()=>S.currency),102);
await p.evaluate(()=>{S.lastTick=Date.now()+600000;S.streak={last:dayKey(),n:1};save();});const saved=await p.evaluate(()=>S.currency);await p.reload();assert.equal(await p.evaluate(()=>S.currency),saved);
assert.deepEqual(errors,[]);console.log('Information hierarchy checks passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
