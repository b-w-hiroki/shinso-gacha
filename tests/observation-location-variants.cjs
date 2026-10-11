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
 const targetCheck=await p.evaluate(()=>{
  const o=observationState(),site=WatchLocations.targets(o.mode,o.pending.rarity),legacy=WatchModel.TARGETS[o.mode][o.pending.rarity];
  if(WatchModel.activeTargets(o)!==site||site===legacy)return false;
  return WatchModel.hit(o,{x:site[0][0],y:site[0][1]});
 });assert(targetCheck,'live contact uses the displayed location\'s own touch region');
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
 let projectedContactTaps=0;
 for(const mode of ['cctv','photo','vision','dash'])for(const rarity of [0,1,2,3]){
  await p.evaluate(({mode,rarity})=>{const o=observationState(),t=Date.now();o.mode=mode;o.sequence=1;o.mind.closed=false;o.pending={mode,rarity,readyAt:t,expiresAt:t+3600000,sequence:1,suppression:0};renderObservation();},{mode,rarity});
  assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
  if(rarity===0){
   await p.evaluate(async mode=>{
    const scene=WatchLocations.byId('alt:'+mode),img=new Image();
    img.src='assets/observation/'+scene.file;
    await img.decode();
    if(img.naturalWidth!==1440||img.naturalHeight!==720)throw Error('not the native asset for '+mode);
   },mode);
   if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-'+mode+'-native-normal-390.jpg',quality:86});
  }
  assert(await p.locator('#obs-frame').evaluate(frame=>{
   const f=frame.getBoundingClientRect(),im=document.getElementById('obs-image').getBoundingClientRect();
   return Math.abs(f.left-im.left)<8&&Math.abs(f.top-im.top)<8&&Math.abs(f.width-im.width)<8&&Math.abs(f.height-im.height)<8;
  }),'all four sources and all four rarity states stay in frame during live motion');
  const overlay=await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage);
  if(rarity===0)assert.equal(overlay,'none');
  else{
   assert(overlay.includes(mode+'-'+rarity+'.svg'));
   const valid=await p.evaluate(({mode,rarity})=>WatchLocations.targets(mode,rarity).some(([x,y])=>WatchModel.hit(observationState(),{x,y})),{mode,rarity});
   assert(valid,'matching native image-space target '+mode+rarity);
   // Browser animation can keep Playwright's element-stability waiter pending in WebKit.
   // Scroll explicitly, verify hit testing, then issue a real pointer click at the image point.
   await p.evaluate(()=>document.getElementById('obs-frame').scrollIntoView({block:'center',behavior:'instant'}));
   const geometry=await p.evaluate(({mode,rarity})=>{
    const f=document.getElementById('obs-frame').getBoundingClientRect(),overlay=document.getElementById('obs-site-overlay'),v=getComputedStyle(overlay);
    const pictureWidth=Math.max(f.width,2*f.height),[x,y]=WatchLocations.targets(mode,rarity)[0];
    return {coverMatches:Math.abs(parseFloat(v.width)-pictureWidth)<2&&Math.abs(parseFloat(v.height)-pictureWidth/2)<2,
     point:{x:f.left+f.width/2+(x-.5)*pictureWidth,y:f.top+f.height/2+(y-.5)*pictureWidth/2},f:{left:f.left,top:f.top,right:f.right,bottom:f.bottom}};
   },{mode,rarity});
   assert(geometry.coverMatches,'visual anomaly overlay must match photographic cover framing '+mode+rarity);
   const q=geometry.point,f=geometry.f;
   if(q.x>=f.left+2&&q.x<=f.right-2&&q.y>=f.top+2&&q.y<=f.bottom-2){
    const reachable=await p.evaluate(point=>{
      const hit=document.elementFromPoint(point.x,point.y);
      return hit===document.getElementById('obs-frame')||document.getElementById('obs-frame').contains(hit);
    },q);
    assert(reachable,'actual rendered hotspot must not be obscured by UI '+mode+rarity);
    await p.mouse.click(q.x,q.y);
    projectedContactTaps++;
    assert.equal(await p.evaluate(()=>observationState().pending?.suppression),1,'clicking actual projected visual hotspot must suppress '+mode+rarity);
   }
  }
  if(rarity>0&&!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-'+mode+'-'+rarity+'-390.jpg',quality:85});
 }
 // The scene must repaint when the next idle sequence changes, even without a pending record.
 await p.evaluate(()=>{
  const o=observationState(),t=Date.now();
  o.mode='cctv';o.pending=null;o.sequence=1;o.dueAt=t+600000;o.mind.closed=false;renderObservation();
 });
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
 await p.evaluate(()=>{const o=observationState();o.sequence=2;renderObservation();});
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'false','idle scene switch repaints the original');
 await p.evaluate(()=>{const o=observationState();o.sequence=3;renderObservation();});
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true','later idle scene returns to its own image');
 await p.evaluate(()=>save());await p.reload();assert.equal(await p.evaluate(()=>WatchLocations.discovered(S.observation.locationRecords)[0].rarities[1]),1);
 assert.equal(await p.evaluate(()=>S.currency),wallet+projectedContactTaps,'real coordinate taps earn their normal 1pt each');
 assert.deepEqual(errors,[]);console.log('New scenes: earned R/SR/SSR, original suppression coordinates, mobile image, save and secrecy passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});