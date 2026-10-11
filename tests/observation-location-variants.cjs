const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(done=>server.listen(0,'127.0.0.1',done));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+900000;S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,history:[]};S.currency=5000;applyMode();go('home');render();});
 await p.evaluate(()=>openEncyclopedia('places'));assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),0,'unknown places absent');
 await p.evaluate(()=>openEncyclopedia('anomalies'));assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),0,'unknown anomaly locations absent');
 await p.evaluate(()=>{hideSheet();go('home');const o=observationState(),now=Date.now();o.mode='cctv';o.sequence=1;o.mind.closed=false;o.pending={mode:'cctv',rarity:1,readyAt:now,expiresAt:now+3600000,sequence:1,suppression:0};renderObservation();});
 assert.equal(await p.locator('#obs-name').innerText(),'地下通路');
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
 assert((await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('cctv-1.svg'));
 const targetCheck=await p.evaluate(()=>WatchModel.hit(observationState(),{x:.51,y:.34}));assert(targetCheck);
 await p.evaluate(()=>{const o=observationState();let result;for(let i=0;i<WatchModel.SUPPRESS[1];i++)result=WatchModel.suppress(o,Date.now(),{x:.51,y:.34});if(!result)throw Error('failed authentic image-space suppression');observationReward(result);});
 assert.equal(await p.evaluate(()=>S.observation.collection['cctv:1']),1);
 const visits=await p.evaluate(()=>WatchLocations.discovered(S.observation.locationRecords));
 assert.equal(visits.length,1);assert.equal(visits[0].id,'alt:cctv');assert.equal(visits[0].rarities[1],1);assert.equal(visits[0].rarities[0]||0,0);
 const wallet=await p.evaluate(()=>S.currency);
 await p.evaluate(()=>openEncyclopedia('anomalies'));
 assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),1,'only acquired location anomaly is shown');
 assert((await p.locator('[data-catalog-entry="alt:cctv:1"]').innerText()).includes('通路に残る足跡'));
 assert.equal(await p.locator('[data-catalog-entry="alt:cctv:2"]').count(),0,'unowned anomaly details never enter DOM');
 await p.locator('[data-catalog-entry="alt:cctv:1"]').click();
 assert(await p.locator('.watch-site-record-image').isVisible(),'catalog entry opens original acquired location evidence');
 assert((await p.locator('.watch-record-caption').innerText()).includes('通路に残る足跡'));
 await p.evaluate(()=>openEncyclopedia('places'));
 assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),1);
 await p.locator('[data-catalog-entry="alt:cctv"]').click();
 assert.equal(await p.locator('[data-location-record]:enabled').count(),1);
 assert(!(await p.locator('.catalog-detail').innerText()).includes('存在しない階段'),'unowned titles are never disclosed');
 await p.locator('[data-location-record="alt:cctv:1"]').click();
 assert((await p.locator('.watch-record-caption').innerText()).includes('通路に残る足跡'));
 assert(await p.locator('.watch-site-record-overlay').count());
 assert.equal(await p.locator('[data-site-compare]').count(),0,'no comparison until the normal view is actually acquired');
 await p.evaluate(()=>{
  const o=observationState();o.locationRecords['alt:cctv'].rarities[0]=1;
  showAlternateLocationRecord('cctv',1);
 });
 const comparison=p.locator('[data-site-compare="cctv:1"]');
 assert(await comparison.isVisible(),'normal and anomaly both owned');
 const beforeCompare=await p.evaluate(()=>JSON.stringify({currency:S.currency,collected:S.observation.collected,locations:S.observation.locationRecords}));
 await comparison.click();
 assert.equal(await comparison.getAttribute('aria-pressed'),'true');
 assert.equal(await p.locator('.watch-site-record-overlay').isVisible(),false);
 assert((await p.locator('#watch-site-compare-status').innerText()).includes('平常'));
 assert((await p.locator('.watch-site-record-image').getAttribute('aria-label')).includes('無人'));
 if(!process.env.QA_WEBKIT){await p.setViewportSize({width:390,height:844});await p.screenshot({path:'docs/qa-incursions/alt-compare-normal-390.jpg',quality:85});}
 await comparison.click();
 assert.equal(await comparison.getAttribute('aria-pressed'),'false');
 assert(await p.locator('.watch-site-record-overlay').isVisible());
 assert((await p.locator('#watch-site-compare-status').innerText()).includes('発見した'));
 if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-compare-anomaly-390.jpg',quality:85});
 assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,collected:S.observation.collected,locations:S.observation.locationRecords})),beforeCompare,'comparison never changes saved state');
 for(const [w,h]of [[320,568],[390,844],[844,390]]){await p.setViewportSize({width:w,height:h});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(w===390&&!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-location-rarity-390.jpg',quality:85});}
 await p.evaluate(()=>{hideSheet();go('home');});
 await p.setViewportSize({width:390,height:844});
 await p.emulateMedia({reducedMotion:'no-preference'});
 for(const mode of ['cctv','photo','vision','dash'])for(const rarity of [0,1,2,3]){
  await p.evaluate(({mode,rarity})=>{const o=observationState(),t=Date.now();o.mode=mode;o.sequence=1;o.mind.closed=false;o.pending={mode,rarity,readyAt:t,expiresAt:t+3600000,sequence:1,suppression:0};renderObservation();},{mode,rarity});
  assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
  assert(await p.locator('#obs-frame').evaluate(frame=>{
   const f=frame.getBoundingClientRect(),im=document.getElementById('obs-image').getBoundingClientRect();
   return Math.abs(f.left-im.left)<8&&Math.abs(f.top-im.top)<8&&Math.abs(f.width-im.width)<8&&Math.abs(f.height-im.height)<8;
  }),'all four sources and all four rarity states stay in frame during live motion');
  const overlay=await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage);
  if(rarity===0)assert.equal(overlay,'none');
  else{assert(overlay.includes(mode+'-'+rarity+'.svg'));const valid=await p.evaluate(({mode,rarity})=>WatchModel.TARGETS[mode][rarity].some(([x,y])=>WatchModel.hit(observationState(),{x,y})),{mode,rarity});assert(valid,'matching hit target '+mode+rarity);}
  if(rarity>0&&!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-'+mode+'-'+rarity+'-390.jpg',quality:85});
 }
 await p.evaluate(()=>save());await p.reload();assert.equal(await p.evaluate(()=>WatchLocations.discovered(S.observation.locationRecords)[0].rarities[1]),1);
 assert.equal(await p.evaluate(()=>S.currency),wallet);
 // Four-source patrols revisit a mode every four observations. Old global
 // parity made some locations effectively permanent; the new selection flips.
 await p.evaluate(()=>{hideSheet();go('home');const o=observationState();o.locationSceneVersion=2;o.mind.closed=false;o.pending=null;o.dueAt=Date.now()+3600000;renderObservation();});
 for(const [offset,mode] of ['cctv','photo','vision','dash'].entries()){
  for(let cycle=0;cycle<4;cycle++){
   const seq=offset+cycle*4;
   await p.evaluate(({mode,seq})=>{const o=observationState();o.mode=mode;o.sequence=seq;o.pending=null;o.dueAt=Date.now()+3600000;renderObservation();},{mode,seq});
   const shown=await p.locator('#obs-frame').getAttribute('data-scene-alt');
   assert.equal(shown, String((seq%2+Math.floor(seq/4)%2)%2===1),mode+' toggles after four observations');
  }
 }
 // Existing held footage uses legacy parity until its actual collection;
 // subsequent patrols switch to the versioned schedule without rerolling.
 await p.evaluate(()=>{const o=observationState(),now=Date.now();o.locationSceneVersion=undefined;o.mode='cctv';o.sequence=5;o.pending={mode:'cctv',rarity:0,readyAt:now,expiresAt:now+3600000,sequence:5,suppression:0};o.mind.closed=false;renderObservation();});
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
 await p.evaluate(()=>{const o=observationState();const record=WatchModel.claim(o,Date.now());if(!record)throw Error('missing held record');observationReward({kind:'patrol',record});});
 assert.equal(await p.evaluate(()=>S.observation.locationSceneVersion),2);
 assert.equal(await p.evaluate(()=>WatchLocations.discovered(S.observation.locationRecords).some(x=>x.id==='alt:cctv')),true);
 await p.evaluate(()=>save());await p.reload();
 assert.equal(await p.evaluate(()=>S.observation.locationSceneVersion),2);

 assert.deepEqual(errors,[]);console.log('New scenes: earned R/SR/SSR, original suppression coordinates, mobile image, save and secrecy passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});