// Dedicated WebKit low-light/zoom interaction fixture. Run one mode per
// process to prevent layered high-res image caches from contaminating later
// 16-state photography tests. This uses real pointer input, no force-click.
const {webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const mode=process.env.QA_OBSERVATION_MODE;
assert(['cctv','photo','vision','dash'].includes(mode),'explicit photo mode required');
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const file=url.pathname==='/font.otf'?process.env.QA_FONT:
   path.join(process.cwd(),url.pathname==='/'?'index.html':url.pathname);
  res.setHeader('Content-Type',
   file.endsWith('.html')?'text/html; charset=utf-8':
   file.endsWith('.js')?'application/javascript':
   file.endsWith('.css')?'text/css':'application/octet-stream');
  res.end(fs.readFileSync(file));
 }catch{res.writeHead(404);res.end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await webkit.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',route=>route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){
   await page.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});
   await page.evaluate(()=>document.fonts.load('16px QAJP'));
  }
  await page.evaluate(mode=>{
   S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};
   S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};
   S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);
   S.currency=5000;applyMode();go('home');setHomeTab('desk');
   const o=observationState(),t=Date.now();
   o.mode=mode;o.sequence=1;o.mind.closed=false;
   o.pending={mode,rarity:0,readyAt:t,expiresAt:t+3600000,sequence:1,suppression:0};
   renderObservation();fitObservation();
  },mode);
  assert.equal(await page.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
  assert.equal(await page.locator('#obs-viewpoint-label').innerText(),
   {cctv:'監視カメラ',photo:'写真記録',vision:'視界ジャック',dash:'車載カメラ'}[mode]);
  const headerHit=await page.evaluate(()=>{
   const source=document.getElementById('obs-viewpoint-label').getBoundingClientRect();
   const place=document.getElementById('obs-name').getBoundingClientRect();
   const buttons=document.querySelector('.obs-zoom-tools').getBoundingClientRect();
   const footage=document.getElementById('obs-frame').getBoundingClientRect();
   return source.height>=14&&source.right<=buttons.left+1&&
    place.right<=buttons.left+1&&place.bottom<=footage.top+1;
  });
  assert(headerHit,'viewpoint must not be covered by image or controls');
  const light=page.locator('#obs-enhance-toggle');
  assert(await light.isVisible(),'enhance button hidden '+mode);
  const baseline=await page.evaluate(()=>({
   currency:S.currency,
   suppression:observationState().pending?.suppression,
   collection:JSON.stringify(observationState().collection),
   filter:getComputedStyle(document.querySelector('#obs-site-overlay')).filter,
  }));
  const pressReal=async selector=>{
   const loc=page.locator(selector);
   await loc.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   const box=await loc.evaluate(e=>{
    const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
    const item=document.elementFromPoint(x,y),nav=document.querySelector('.nav')?.getBoundingClientRect();
    return {x,y,width:r.width,height:r.height,
      valid:(item===e||e.contains(item))&&x>=0&&x<innerWidth&&y>=0&&y<innerHeight
        &&(!nav||y<nav.top)};
   });
   assert(box.valid&&box.width>=44&&box.height>=44,
    selector+': full real tappable area invalid '+JSON.stringify(box));
   await page.mouse.click(box.x,box.y);
  };
  await pressReal('#obs-enhance-toggle');
  assert.equal(await light.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#obs-frame').getAttribute('data-enhance'),'true');
  const brighter=await page.locator('#obs-site-overlay').evaluate(e=>({
   filter:getComputedStyle(e).filter,
   overlay:getComputedStyle(e,'::after').backgroundColor,
  }));
  assert.equal(brighter.filter,'none','brightness must not force GPU filter: '+mode);
  assert(brighter.overlay!==''&&brighter.overlay!=='rgba(0, 0, 0, 0)',
   'visible compensation layer missing '+mode);
  await pressReal('#obs-zoom-toggle');
  assert.equal(await page.locator('#obs-frame').getAttribute('data-zoom'),'2');
  assert.equal(await page.locator('#obs-frame').getAttribute('data-enhance'),'true');
  await pressReal('#obs-zoom-toggle');
  assert.equal(await page.locator('#obs-frame').getAttribute('data-zoom'),'1');
  await pressReal('#obs-enhance-toggle');
  assert.equal(await light.getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#obs-frame').getAttribute('data-enhance'),'false');
  const after=await page.evaluate(()=>({
   currency:S.currency,
   suppression:observationState().pending?.suppression,
   collection:JSON.stringify(observationState().collection),
   filter:getComputedStyle(document.querySelector('#obs-site-overlay')).filter,
  }));
  assert.deepEqual(after,baseline,'visual toggles cannot change observation rewards or image filters '+mode);
  assert.deepEqual(errors,[],'page console errors after actual WebKit viewer interaction');
  console.log('Real WebKit enhancement, 2x zoom, safe hit area and no economy changes passed: '+mode);
  await page.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
