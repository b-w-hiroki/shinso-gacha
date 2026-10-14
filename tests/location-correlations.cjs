const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());
  await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  await p.evaluate(()=>{
   S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,history:[]};S.streak={last:dayKey(),n:1};
   S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');render();
  });
  await p.evaluate(()=>openEncyclopedia('places'));
  assert.equal(await p.locator('.catalog-cross-sites').count(),0,'unearned comparison stays absent');
  assert.equal(await p.locator('[data-location-link]').count(),0);
  await p.evaluate(()=>{
   const o=observationState(),now=Date.now();
   o.locationRecords={'alt:cctv':{visits:1,lastSequence:1,firstAt:now,rarities:{0:1}}};
   openEncyclopedia('places');
  });
  await p.locator('[data-catalog-entry="alt:cctv"]').click();
  assert.equal(await p.locator('.catalog-cross-sites').count(),0,'one discovered site is not enough');
  await p.evaluate(()=>{
   const o=observationState(),now=Date.now();
   o.locationRecords['alt:photo']={visits:1,lastSequence:1,firstAt:now,rarities:{0:1}};
   openEncyclopedia('places');
  });
  await p.locator('[data-catalog-entry="alt:cctv"]').click();
  assert(await p.locator('.catalog-cross-sites summary').isVisible());
  assert.equal(await p.locator('[data-location-link]').count(),1);
  assert(!(await p.locator('#sheet').innerText()).includes('踏切前'),'undiscovered location title stays out of DOM');
  await p.locator('.catalog-cross-sites summary').click();
  await p.locator('[data-location-link="cctv-photo"]').click();
  assert(await p.locator('.site-correlation').isVisible());
  const detail=await p.locator('.site-correlation').innerText();
  assert(detail.includes('地下通路')&&detail.includes('夜の教室'));
  assert(detail.includes('照会番号'));
  assert(!detail.includes('踏切前')&&!detail.includes('海沿い'));
  assert.equal(await p.locator('.site-correlation-images img').count(),2);
  // Lazy-loading can abort decode in WebKit when a new sheet replaces the old source.
  // Load eagerly and assert both actual decoded pixel dimensions, not just src presence.
  await p.waitForFunction(()=>{
   const images=Array.from(document.querySelectorAll('.site-correlation-images img'));
   return images.length===2&&images.every(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);
  },null,{timeout:10000});
  assert(await p.locator('.site-correlation-images img').evaluateAll(els=>els.length===2&&els.every(x=>x.naturalWidth>=320&&x.naturalHeight>=160)),'both originals loaded and decoded');
  const original=await p.evaluate(()=>({currency:S.currency,records:JSON.stringify(S.observation.locationRecords),collected:S.observation.collected}));
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
   const button=p.locator('.site-correlation [data-catalog-entry="alt:photo"]');await button.scrollIntoViewIfNeeded();
   assert(await button.evaluate(e=>e.getBoundingClientRect().height>=44),'comparison navigation reachable');
   if(width===390&&!process.env.QA_WEBKIT){await p.evaluate(()=>{document.getElementById('sheet').scrollTop=0;});await p.screenshot({path:'docs/qa-incursions/cross-location-evidence-390.jpg',quality:85});}
  }
  await p.locator('.site-correlation [data-catalog-entry="alt:photo"]').click();
  assert((await p.locator('.catalog-detail h2').first().innerText()).includes('夜の教室'));
  await p.evaluate(()=>{S.observation.locationRecords['alt:vision']={visits:1,lastSequence:1,firstAt:Date.now(),rarities:{1:1}};openEncyclopedia('places');});
  await p.locator('[data-catalog-entry="alt:cctv"]').click();
  assert.equal(await p.locator('[data-location-link]').count(),2,'links expand only with actual acquired sites');
  assert.equal(await p.locator('[data-location-link="photo-dash"]').count(),0);
  assert.deepEqual(await p.evaluate(()=>({currency:S.currency,records:JSON.stringify(Object.fromEntries(Object.entries(S.observation.locationRecords).filter(([id])=>id!=='alt:vision'))),collected:S.observation.collected})),original);
  await p.evaluate(()=>save());await p.reload();
  assert.equal(await p.evaluate(()=>LocationCorrelations.list(WatchLocations.discovered(observationState().locationRecords)).length),3,'links are derived from saved sites');
  assert.equal(await p.evaluate(()=>S.currency),original.currency);
  // Three acquired sites are not enough: the player must have actually
  // collected at least one anomaly from EACH independent location.
  await p.evaluate(()=>openEncyclopedia('places'));
  await p.locator('[data-catalog-entry="alt:cctv"]').click();
  assert.equal(await p.locator('[data-location-triad]').count(),0);
  await p.evaluate(()=>{
   const o=observationState(),records=o.locationRecords;
   records['alt:cctv'].rarities[1]=1;
   records['alt:photo'].rarities[2]=1;
   openEncyclopedia('places');
  });
  await p.locator('[data-catalog-entry="alt:cctv"]').click();
  assert(await p.locator('[data-location-triad="alt:cctv"]').isVisible());
  assert(!(await p.locator('.catalog-detail').innerText()).includes('海沿いの夜道'),
   'the fourth unearned original must remain secret');
  const triadOriginal=await p.evaluate(()=>JSON.stringify({
   currency:S.currency,records:S.observation.locationRecords,collected:S.observation.collected
  }));
  await p.locator('[data-location-triad="alt:cctv"]').click();
  assert(await p.locator('.site-triad').isVisible());
  const triadText=await p.locator('.site-triad').innerText();
  for(const title of ['地下通路','夜の教室','踏切前'])assert(triadText.includes(title));
  assert(!triadText.includes('海沿いの夜道'));
  assert.equal(await p.locator('.site-triad-images img').count(),3);
  await p.waitForFunction(()=>{
   const images=[...document.querySelectorAll('.site-triad-images img')];
   return images.length===3&&images.every(im=>im.complete&&im.naturalWidth===1440&&im.naturalHeight===720);
  },null,{timeout:10000});
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'triad must never overflow horizontally');
   const last=p.locator('.site-triad [data-catalog-entry="alt:vision"]');
   await last.scrollIntoViewIfNeeded();
   assert(await last.evaluate(e=>e.getBoundingClientRect().height>=44),'all three return routes must be tappable');
   if(width===390&&!process.env.QA_WEBKIT){
    await p.evaluate(()=>{document.getElementById('sheet').scrollTop=0;});
    await p.screenshot({path:'docs/qa-incursions/site-triad-390.jpg',quality:85});
   }
  }
  assert.equal(await p.evaluate(()=>JSON.stringify({
   currency:S.currency,records:S.observation.locationRecords,collected:S.observation.collected
  })),triadOriginal,'three-site examination must not reward or mutate progress');
  await p.locator('.site-triad [data-catalog-entry="alt:vision"]').click();
  assert((await p.locator('.catalog-detail h2').first().innerText()).includes('踏切前'));
  // New bridge: a visited place alone must never disclose a related legend.
  await p.evaluate(()=>{S.levels.u1=3;S.levels.u6=0;S.legendLayers={};openEncyclopedia('places');});
  await p.locator('[data-catalog-entry="alt:cctv"]').click();
  assert.equal(await p.locator('.site-legend-echoes').count(),0,'owned fragments without explicit difference record are hidden');
  const beforeBridge=await p.evaluate(()=>JSON.stringify({currency:S.currency,locations:S.observation.locationRecords,pulls:S.pulls}));
  await p.evaluate(()=>{
   S.observation.collection['cctv:1']=1;
   S.legendLayers={noticed:{u1:true},compared:{},linked:{}};
   openEncyclopedia('places');
  });
  await p.locator('[data-catalog-entry="alt:cctv"]').click();
  assert.equal(await p.locator('.site-legend-echoes').count(),1,'earned case and visited place unlock the reading');
  await p.locator('.site-legend-echoes summary').click();
  assert.equal(await p.locator('.site-legend-echoes [data-legend="case"]').count(),1);
  assert(!(await p.locator('.site-legend-echoes').innerText()).includes('封鎖校舎'),'unearned case never enters DOM');
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'cross-archive text should not overflow');
   const control=p.locator('.site-legend-echoes [data-legend="case"]');
   await control.scrollIntoViewIfNeeded();
   assert(await control.evaluate(el=>el.getBoundingClientRect().height>=44),'cross-archive target is tappable');
   if(width===390&&!process.env.QA_WEBKIT){
    await p.evaluate(()=>{document.getElementById('sheet').scrollTop=0;});
    await p.screenshot({path:'docs/qa-incursions/location-legend-crosscheck-390.jpg',quality:85});
   }
  }
  await p.locator('.site-legend-echoes [data-legend="case"]').click();
  assert(await p.locator('.legend-location-echo').isVisible(),'acquired location appears in the case dossier');
  assert.equal(await p.locator('.legend-location-after').count(),1,'only actually acquired anomaly adds an afterword');
  await p.locator('.legend-location-echo [data-legend="place"]').click();
  assert((await p.locator('.catalog-detail h2').first().innerText()).includes('地下通路'),'real UI returns to visited original');
  const afterBridge=await p.evaluate(()=>JSON.stringify({currency:S.currency,locations:S.observation.locationRecords,pulls:S.pulls}));
  assert.equal(afterBridge,beforeBridge,'new reading and navigation cannot alter save, points or ownership');
  await p.evaluate(()=>save());await p.reload();
  await p.evaluate(()=>openLegendCase('u1'));
  assert.equal(await p.locator('.legend-location-echo').count(),1,'earned bridge survives reload without a new save field');
  assert.equal(await p.evaluate(()=>S.currency),5000,'no passive read reward');
  assert.deepEqual(errors,[]);
  console.log('Cross-location links: acquisition gating, original image comparison, narrow screen, return route and save passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
