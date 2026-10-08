const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='docs/qa-incursions';const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};applyMode();});
async function font(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}}
await font();

await p.evaluate(()=>{S.incursion={version:1,level:0,resolved:0,history:[]};S.currency=543;S.lastTick=Date.now()+600000;go("home");setHomeTab("desk");render();});
for(const [level,tier,label] of [[0,1,'静穏'],[12,1,'微かな反応'],[36,2,'反応あり'],[90,3,'接近中']]){
 await p.evaluate(({level,tier})=>{S.incursion.level=level;S.incursion.event=level>=36?{kind:2,tier,round:0,step:0}:null;renderIncursion();},{level,tier});
 assert.equal(await p.locator('#radar-distance').innerText(),label);
 if(level>=36){await p.locator('.radar-head button').click();assert(await p.locator('#incursion-dialog').isVisible());await p.keyboard.press('Escape');}
}
await p.evaluate(()=>{S.incursion.level=0;S.incursion.event=null;render();});
await p.locator('.radar-head button').click();assert(await p.locator('.evidence-stack').isVisible());assert.equal(await p.locator('.case-choices button').count(),3);await p.keyboard.press('Escape');
for(const [width,height] of [[320,568],[390,700],[430,932]]){
 await p.setViewportSize({width,height});await p.locator('#wallet').click();assert.equal(await p.locator('.wallet-rank').count(),0);assert.equal(await p.locator('#wallet-current').innerText(),'543pt');
 await p.evaluate(()=>{S.currency=654;render();});assert.equal(await p.locator('#wallet-current').innerText(),'654pt');assert(await p.locator('#wallet-hour').isVisible());
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`${out}/wallet-clean-${width}.jpg`,quality:85});await p.keyboard.press('Escape');await p.evaluate(()=>{S.currency=543;render();});
 await p.evaluate(()=>go('report'));await p.locator('#agent-record').click();assert(await p.locator('#rk-lv').isVisible());await p.keyboard.press('Escape');await p.evaluate(()=>go('home'));
}
await p.setViewportSize({width:390,height:700});await p.screenshot({path:`${out}/home-clean.jpg`,quality:85});
assert.deepEqual(errors,[]);console.log('Information hierarchy checks passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
