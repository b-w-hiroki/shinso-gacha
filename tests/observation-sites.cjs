const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+900000;S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,history:[]};S.currency=5000;applyMode();go('home');render();});
 await p.evaluate(()=>openEncyclopedia('places'));
 assert.equal(await p.locator('[data-catalog-entry^="site:"]:enabled').count(),0,'new sites remain hidden without their own records');
 assert(!(await p.locator('.catalog-list').innerText()).includes('地下通路'));
 await p.evaluate(()=>{hideSheet();go('home');const o=observationState(),now=Date.now();o.mode='cctv';o.sequence=1;o.mind.closed=false;o.pending={mode:'cctv',rarity:1,readyAt:now,expiresAt:now+3600000,sequence:1,suppression:0};renderObservation();});
 assert.equal(await p.locator('#obs-name').innerText(),'地下通路');
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
 assert((await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('cctv-1.svg'));
 assert(await p.locator('#obs-site-overlay').evaluate(async e=>{const bg=getComputedStyle(e).backgroundImage,im=new Image();im.src=bg.slice(5,-2);await im.decode();return im.naturalWidth>0;}));
 const successful=await p.evaluate(()=>{
  const o=observationState();let result=null;for(let i=0;i<WatchModel.SUPPRESS[1];i++)result=WatchModel.suppress(o,Date.now(),{x:.51,y:.34});
  if(!result)throw Error('normal target coordinates did not suppress the new overlay');observationReward(result);return result.record;
 });
 assert.equal(successful.mode,'cctv');assert.equal(successful.rarity,1);
 assert.equal(await p.evaluate(()=>ObservationSites.count(S.observation.siteCollection,'cctv','alt',1)),1);
 assert.equal(await p.evaluate(()=>S.observation.collection['cctv:1']),1,'legacy media record remains credited');
 const currency=await p.evaluate(()=>S.currency);
 await p.evaluate(()=>openEncyclopedia('places'));
 const newly=p.locator('[data-catalog-entry="site:cctv:alt"]');assert(await newly.isVisible());
 assert.equal(await p.locator('[data-catalog-entry^="site:"]:enabled').count(),1);
 assert(!(await p.locator('.catalog-list').innerText()).includes('夜の教室'));
 await newly.click();assert((await p.locator('.catalog-detail').innerText()).includes('地下通路'));
 assert.equal(await p.locator('[data-site-record]:enabled').count(),1);
 assert(!(await p.locator('.catalog-detail').innerText()).includes('存在しない階段'));
 await p.locator('[data-site-record="cctv:1"]').click();
 assert((await p.locator('.watch-record-caption').innerText()).includes('通路に残る足跡'));
 assert(await p.locator('.watch-site-record-overlay').count());
 for(const [width,height]of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390&&!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/eight-locations-record-390.jpg',quality:86});
 }
 await p.evaluate(()=>{hideSheet();go('home');});
 for(const [mode,meta]of Object.entries(await p.evaluate(()=>ObservationSites.LOCATIONS))){
  for(let rarity=0;rarity<=3;rarity++){
   await p.evaluate(({mode,rarity})=>{const o=observationState(),now=Date.now();o.mode=mode;o.sequence=1;o.mind.closed=false;o.pending={mode,rarity,readyAt:now,expiresAt:now+3600000,sequence:1,suppression:0};renderObservation();},{mode,rarity});
   assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
   assert.equal(await p.locator('#obs-name').innerText(),meta.alt.name);
   const overlay=await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage);
   assert.equal(rarity===0,overlay==='none','rarity-specific overlay');
   if(rarity>0){
    assert(overlay.includes(mode+'-'+rarity+'.svg'));
    const result=await p.evaluate(({mode,rarity})=>{const targets=WatchModel.TARGETS[mode][rarity];return targets.some(([x,y])=>WatchModel.hit(observationState(),{x,y}));},{mode,rarity});
    assert(result,'visible delta must match the same native-image coordinate');
   }
  }
 }
 await p.evaluate(()=>save());await p.reload();
 assert.equal(await p.evaluate(()=>ObservationSites.count(S.observation.siteCollection,'cctv','alt',1)),1);
 assert.equal(await p.evaluate(()=>S.currency),currency);
 assert.deepEqual(errors,[]);
 console.log('Eight scenes: acquired-only alt catalog, layered rare overlays, hit geometry, mobile layout, reload and old collection passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});