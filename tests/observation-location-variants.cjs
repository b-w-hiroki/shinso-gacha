const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(done=>server.listen(0,'127.0.0.1',done));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+900000;S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,history:[]};S.currency=5000;applyMode();go('home');render();});
 await p.evaluate(()=>openEncyclopedia('places'));assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),0,'unknown places absent');
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
 await p.evaluate(()=>openEncyclopedia('places'));
 assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),1);
 await p.locator('[data-catalog-entry="alt:cctv"]').click();
 assert.equal(await p.locator('[data-location-record]:enabled').count(),1);
 assert(!(await p.locator('.catalog-detail').innerText()).includes('存在しない階段'),'unowned titles are never disclosed');
 await p.locator('[data-location-record="alt:cctv:1"]').click();
 assert((await p.locator('.watch-record-caption').innerText()).includes('通路に残る足跡'));
 assert(await p.locator('.watch-site-record-overlay').count());
 for(const [w,h]of [[320,568],[390,844],[844,390]]){await p.setViewportSize({width:w,height:h});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(w===390&&!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-location-rarity-390.jpg',quality:85});}
 await p.evaluate(()=>{hideSheet();go('home');});
 for(const mode of ['cctv','photo','vision','dash'])for(const rarity of [0,1,2,3]){
  await p.evaluate(({mode,rarity})=>{const o=observationState(),t=Date.now();o.mode=mode;o.sequence=1;o.mind.closed=false;o.pending={mode,rarity,readyAt:t,expiresAt:t+3600000,sequence:1,suppression:0};renderObservation();},{mode,rarity});
  assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
  const overlay=await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage);
  if(rarity===0)assert.equal(overlay,'none');
  else{assert(overlay.includes(mode+'-'+rarity+'.svg'));const valid=await p.evaluate(({mode,rarity})=>WatchModel.TARGETS[mode][rarity].some(([x,y])=>WatchModel.hit(observationState(),{x,y})),{mode,rarity});assert(valid,'matching hit target '+mode+rarity);}
 }
 await p.evaluate(()=>save());await p.reload();assert.equal(await p.evaluate(()=>WatchLocations.discovered(S.observation.locationRecords)[0].rarities[1]),1);
 assert.equal(await p.evaluate(()=>S.currency),wallet);
 assert.deepEqual(errors,[]);console.log('New scenes: earned R/SR/SSR, original suppression coordinates, mobile image, save and secrecy passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});