// Independent positive-control regression fixture for frozen task shinso-nav-click-01.
// Real browser touch input only: no force-click, JS click dispatch or weakened tests.
// Verifies current behavior, NOT reproduction of historical failing SHA.
const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const source=process.env.QA_WEBKIT==='1'?'webkit':'chromium';
const browserType=source==='webkit'?webkit:chromium;
const outDir=path.join('docs','qa-benchmarks');
fs.mkdirSync(outDir,{recursive:true});
const server=http.createServer((request,response)=>{
 try{
  const url=new URL(request.url,'http://localhost');
  const p=path.resolve(process.cwd(),'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!p.startsWith(process.cwd()+path.sep))throw Error('path outside fixture');
  response.setHeader('Content-Type',p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.css')?'text/css':p.endsWith('.js')?'application/javascript':'application/octet-stream');
  response.end(fs.readFileSync(p));
 }catch{response.writeHead(404);response.end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await browserType.launch(source==='webkit'?{}:{args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('https://**/*',route=>route.abort());
   await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
   await page.evaluate(()=>{
    S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};
    S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};
    S.streak={last:dayKey(),n:1};
    S.observation=WatchModel.create(Date.now(),42);S.observation.collected=5;
    S.currency=1000;applyMode();go('home');setHomeTab('desk');render();
   });
   const realTap=async(selector)=>{
    const control=page.locator(selector);
    await control.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    const hit=await control.evaluate(el=>{
     const b=el.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;
     const target=document.elementFromPoint(x,y);
     return {x,y,width:b.width,height:b.height,enabled:!el.disabled,
      inside:x>=0&&y>=0&&x<innerWidth&&y<innerHeight,
      uncovered:target===el||el.contains(target)};
    });
    assert(hit.inside&&hit.uncovered&&hit.enabled&&hit.width>=44&&hit.height>=44,
     source+' '+width+'x'+height+' '+selector+': touch hit is obscured or too small: '+JSON.stringify(hit));
    await page.touchscreen.tap(hit.x,hit.y);
   };
   await realTap('#obs-equipment');
   assert(await page.locator('[data-view="lab"]').isVisible(),'equipment navigation did not open the lab');
   if(!(await page.locator('.watch-upgrades').evaluate(el=>el.open))){
    await realTap('.watch-upgrades summary');
   }
   assert(await page.locator('[data-watch-upgrade="retention"]').isVisible(),
     'retention purchase unavailable on the active lab screen');
   if(width===390)await page.screenshot({path:path.join(outDir,'nav-before-'+source+'-390.png')});
   await realTap('[data-watch-upgrade="retention"]');
   const state=await page.evaluate(()=>({
    points:S.currency,retention:S.observation.upgrades.retention,
    scrollOverflows:document.documentElement.scrollWidth>innerWidth,
   }));
   assert.deepEqual(state,{points:965,retention:1,scrollOverflows:false},
    source+' '+width+'x'+height+': real touch failed to apply one 35pt upgrade');
   // The wallet uses requestAnimationFrame even in reduced-motion mode.
   // Wait for the user-visible number before taking the after screenshot.
   await page.waitForFunction(()=>document.getElementById('pt')?.textContent===
    String(Math.floor(S.currency)),null,{timeout:3000});
   assert.equal(await page.locator('#pt').innerText(),'965',
    'rendered wallet must match the actual saved balance');
   if(width===390)await page.screenshot({path:path.join(outDir,'nav-after-'+source+'-390.png')});
   // Explicit save tests persisted data without claiming autosave or Firebase QA.
   await page.evaluate(()=>save());
   await page.reload({waitUntil:'load'});
   assert.deepEqual(await page.evaluate(()=>({points:S.currency,retention:S.observation.upgrades.retention})),
    {points:965,retention:1},'saved wallet/retention changed after browser reload');
   await page.waitForFunction(()=>document.getElementById('pt')?.textContent===
    String(Math.floor(S.currency)),null,{timeout:3000});
   assert.deepEqual(errors,[],'unexpected JS exceptions');
   await page.close();
   console.log('PASS '+source+' '+width+'x'+height+': actual touch, 35pt spent once, saved restore');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
