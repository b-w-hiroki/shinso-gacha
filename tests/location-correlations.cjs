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
  await p.locator('.site-correlation-images img').evaluateAll(async els=>await Promise.all(els.map(x=>x.decode())));
  assert(await p.locator('.site-correlation-images img').evaluateAll(els=>els.every(x=>x.naturalWidth>0)));
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
  assert.deepEqual(errors,[]);
  console.log('Cross-location links: acquisition gating, original image comparison, narrow screen, return route and save passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
