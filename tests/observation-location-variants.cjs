const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(done=>server.listen(0,'127.0.0.1',done));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 // CSS animation may keep WebKit's locator stability heuristic pending.
 // A real coordinate pointer click with elementFromPoint hit testing is the
 // stronger user-facing contract; never force/dispatch a synthetic click.
 const clickRealViewerControl=async selector=>{
  const loc=p.locator(selector);
  await loc.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  const point=await loc.evaluate(el=>{
   const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
   const target=document.elementFromPoint(x,y);
   return {x,y,width:r.width,height:r.height,inViewport:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,
     actualHit:target===el||el.contains(target)};
  });
  assert(point.inViewport&&point.actualHit&&point.width>=44&&point.height>=44,
   selector+': not really tappable above evidence/navigation '+JSON.stringify(point));
  await p.mouse.click(point.x,point.y);
 };
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+900000;S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,history:[]};S.currency=5000;applyMode();go('home');render();});
 // The full earned-evidence, catalog, zoom/pan, and save/restore scenario
 // is shared across source types. Execute it once in WebKit (cctv), rather
 // than repeatedly creating high-resolution photo layers in the same process
 // before each source-specific 4-rarity inspection. Chromium still runs it
 // alongside the complete 16-state matrix.
 let wallet;
 const requestedRarity=process.env.QA_OBSERVATION_RARITY;
 assert(requestedRarity===undefined||['0','1','2','3'].includes(requestedRarity),'invalid isolated QA rarity');
 const runSharedScenario=!process.env.QA_WEBKIT||!process.env.QA_OBSERVATION_MODE||
  (process.env.QA_OBSERVATION_MODE==='cctv'&&(requestedRarity===undefined||requestedRarity==='1'));
 if(runSharedScenario){
 await p.evaluate(()=>openEncyclopedia('places'));assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),0,'unknown places absent');
 await p.evaluate(()=>openEncyclopedia('anomalies'));assert.equal(await p.locator('[data-catalog-entry^="alt:"]').count(),0,'unknown anomaly locations absent');
 await p.evaluate(()=>{hideSheet();go('home');const o=observationState(),now=Date.now();o.mode='cctv';o.sequence=1;o.mind.closed=false;o.pending={mode:'cctv',rarity:1,readyAt:now,expiresAt:now+3600000,sequence:1,suppression:0};renderObservation();});
 // No guide, zoom control or dark-area control may cover the footage.
 for(const [width,height] of [[320,568],[390,844],[430,932],[844,390]]){
  await p.setViewportSize({width,height});
  await p.evaluate(()=>fitObservation());
  const geometry=await p.evaluate(()=>{
   const image=document.getElementById('obs-frame').getBoundingClientRect();
   const controls=document.querySelector('.obs-zoom-tools').getBoundingClientRect();
   const guide=document.getElementById('obs-zoom-hint').getBoundingClientRect();
   return {imageTop:image.top,controlsBottom:controls.bottom,guideWidth:guide.width};
  });
  assert(geometry.controlsBottom<=geometry.imageTop+1,'viewer controls overlap evidence at '+width+'x'+height);
  assert(geometry.guideWidth<=1,'instruction must be screen-reader-only at '+width+'x'+height);
 }
 await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>fitObservation());
 if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/observation-guide-outside-footage-390.jpg',quality:86});
 assert.equal(await p.locator('#obs-name').innerText(),'地下通路');
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
 assert((await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('cctv-1.svg'));
 assert((await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('cctv-1.webp'));
 await p.evaluate(()=>{const o=observationState();o.mind.closed=true;renderObservation();});
 assert.equal(await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).visibility),'hidden','closed monitor cannot leak photograph or anomaly art');
 await p.evaluate(()=>{const o=observationState();o.mind.closed=false;renderObservation();});
 assert.equal(await p.locator('#obs-site-overlay').evaluate(e=>getComputedStyle(e).visibility),'visible','restored monitor shows the visual evidence');

 // This is a real pointer interaction, not just a mathematical transform test.
 // Zooming must retain the same single earned point and hotspot as the 1x view.
 const zoomButton=p.locator('#obs-zoom-toggle');
 assert(await zoomButton.isVisible());
 assert.equal(await zoomButton.getAttribute('aria-pressed'),'false');
 await zoomButton.click();
 assert.equal(await zoomButton.getAttribute('aria-pressed'),'true');
 assert.equal(await p.locator('#obs-frame').getAttribute('data-zoom'),'2');
 await p.evaluate(()=>document.getElementById('obs-frame').scrollIntoView({block:'center',behavior:'instant'}));
 const zoomTap=await p.evaluate(()=>{
  const f=document.getElementById('obs-image').getBoundingClientRect();
  const target=WatchLocations.targets('cctv',1)[0],r=WatchZoom.rect(f.width,f.height,2);
  const x=f.left+r.left+target[0]*r.width,y=f.top+r.top+target[1]*r.height;
  if(!WatchZoom.point(x-f.left,y-f.top,f.width,f.height,2))throw Error('zoom target not visible');
  return {x,y};
 });
 await p.mouse.click(zoomTap.x,zoomTap.y);
 assert.equal(await p.evaluate(()=>observationState().pending.suppression),1,'2x projected real tap must count exactly once');
 if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-cctv-zoom-2x-390.jpg',quality:87});
 // A drag pans the source pixels, never counts as touching an anomaly or earning pt.
 const beforeDrag=await p.evaluate(()=>({currency:S.currency,suppression:observationState().pending.suppression}));
 const center=await p.locator('#obs-frame').evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width*.5,y:r.top+r.height*.5};});
 await p.mouse.move(center.x,center.y);
 await p.mouse.down();
 await p.mouse.move(center.x-76,center.y-18,{steps:6});
 await p.mouse.up();
 const afterDrag=await p.evaluate(()=>({currency:S.currency,suppression:observationState().pending.suppression,
  panX:watchPanX,panY:watchPanY,limits:WatchZoom.limits(document.getElementById('obs-image').clientWidth,document.getElementById('obs-image').clientHeight,2)}));
 assert.equal(afterDrag.currency,beforeDrag.currency,'a pan gesture never creates a manual tap reward');
 assert.equal(afterDrag.suppression,beforeDrag.suppression,'drag is not a suppress action');
 assert(afterDrag.panX<0&&Math.abs(afterDrag.panX)<=afterDrag.limits.x,'drag pans but respects original photo edge');
 await p.locator('#obs-frame').focus();
 await p.keyboard.press('ArrowRight');
 assert((await p.evaluate(()=>watchPanX))<=afterDrag.panX,'keyboard right arrow can also reach image edge');
 const afterPanTap=await p.evaluate(()=>{
  const f=document.getElementById('obs-image').getBoundingClientRect();
  const target=WatchLocations.targets('cctv',1)[0],r=WatchZoom.rect(f.width,f.height,2,watchPanX,watchPanY);
  return {x:f.left+r.left+target[0]*r.width,y:f.top+r.top+target[1]*r.height};
 });
 await p.mouse.click(afterPanTap.x,afterPanTap.y);
 assert.equal(await p.evaluate(()=>observationState().pending.suppression),2,'panned projection must suppress the same native hotspot');
 assert.equal(await p.evaluate(()=>S.currency),beforeDrag.currency+1,'only the genuine follow-up tap earns 1pt');
 if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-cctv-pan-2x-390.jpg',quality:87});
 await zoomButton.click();
 assert.equal(await p.evaluate(()=>watchPanX),0,'returning to full frame recenters the scene');
 assert.equal(await p.locator('#obs-frame').getAttribute('data-zoom'),'1');
 await p.evaluate(()=>{observationState().pending.suppression=0;});

 const targetCheck=await p.evaluate(()=>{
  const o=observationState(),site=WatchLocations.targets(o.mode,o.pending.rarity),legacy=WatchModel.TARGETS[o.mode][o.pending.rarity];
  if(WatchModel.activeTargets(o)!==site||site===legacy)return false;
  return WatchModel.hit(o,{x:site[0][0],y:site[0][1]});
 });assert(targetCheck,'live contact uses the displayed location\'s own touch region');
 await p.evaluate(()=>{const o=observationState();let result;for(let i=0;i<WatchModel.SUPPRESS[1];i++)result=WatchModel.suppress(o,Date.now(),{x:.51,y:.34});if(!result)throw Error('failed authentic image-space suppression');observationReward(result);});
 assert.equal(await p.evaluate(()=>S.observation.collection['cctv:1']),1);
 const visits=await p.evaluate(()=>WatchLocations.discovered(S.observation.locationRecords));
 assert.equal(visits.length,1);assert.equal(visits[0].id,'alt:cctv');assert.equal(visits[0].rarities[1],1);assert.equal(visits[0].rarities[0]||0,0);
 wallet=await p.evaluate(()=>S.currency);
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
 }else{
  // The independent WebKit process starts directly from a clean observation.
  // The normal/missing/anomalous photo contract and real pointer hits below
  // still run for every single source+rarity without skipping an image state.
  await p.evaluate(()=>{hideSheet();go('home');setHomeTab('desk');});
  wallet=await p.evaluate(()=>S.currency);
 }

 await p.setViewportSize({width:390,height:844});
 await p.emulateMedia({reducedMotion:'no-preference'});
 let projectedContactTaps=0;
 // Each WebKit run uses a fresh browser process for one photographic source,
 // avoiding a long-lived 16-scene layered WebP/animation cache. CI executes
 // ALL four runs; Chromium keeps the complete matrix in one process.
 const everyMode=['cctv','photo','vision','dash'];
 const selectedMode=process.env.QA_OBSERVATION_MODE;
 assert(!selectedMode||everyMode.includes(selectedMode),'unsupported QA observation mode');
 const allModes=selectedMode?[selectedMode]:everyMode;
 const selectedRarities=requestedRarity===undefined?[0,1,2,3]:[Number(requestedRarity)];
 for(const mode of allModes)for(const rarity of selectedRarities){
  await p.evaluate(({mode,rarity})=>{const o=observationState(),t=Date.now();o.mode=mode;o.sequence=1;o.mind.closed=false;o.pending={mode,rarity,readyAt:t,expiresAt:t+3600000,sequence:1,suppression:0};renderObservation();},{mode,rarity});
  assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true');
  if(rarity===0){
   if(process.env.QA_WEBKIT){
    // WebKit has already decoded/rendered the CSS-backed photo in this live
    // monitor. Creating a *second* native-size Image in the same page can
    // terminate WebKit's image compositor (most visible for the road source).
    // Validate the actual served RIFF/VP8 frame's native dimensions instead;
    // Chromium still calls Image.decode(), and both browsers inspect and tap
    // the real composited source and every anomaly variant.
    await p.evaluate(async mode=>{
     const scene=WatchLocations.byId('alt:'+mode);
     const response=await fetch('assets/observation/'+scene.file,{cache:'no-store'});
     if(!response.ok)throw Error('missing native photographic source '+mode);
     const b=new Uint8Array(await response.arrayBuffer());
     const fourcc=(at,n)=>String.fromCharCode(...b.slice(at,at+n));
     if(b.length<30||fourcc(0,4)!=='RIFF'||fourcc(8,4)!=='WEBP')
      throw Error('corrupted original WebP '+mode);
     let width,height;
     if(fourcc(12,4)==='VP8 '){
      if(b[23]!==0x9d||b[24]!==0x01||b[25]!==0x2a)
       throw Error('invalid lossy WebP frame header '+mode);
      width=(b[26]|(b[27]<<8))&0x3fff;
      height=(b[28]|(b[29]<<8))&0x3fff;
     }else if(fourcc(12,4)==='VP8X'){
      width=1+b[24]+(b[25]<<8)+(b[26]<<16);
      height=1+b[27]+(b[28]<<8)+(b[29]<<16);
     }else throw Error('unsupported original WebP encoding '+mode);
     if(width!==1440||height!==720)throw Error('native source dimensions changed '+mode);
    },mode);
   }else{
    await p.evaluate(async mode=>{
     const scene=WatchLocations.byId('alt:'+mode),img=new Image();
     img.src='assets/observation/'+scene.file;
     await img.decode();
     if(img.naturalWidth!==1440||img.naturalHeight!==720)throw Error('not the native asset for '+mode);
    },mode);
   }
   if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/alt-'+mode+'-native-normal-390.jpg',quality:86});
   // WebKit exercises this full optional display control interaction in an
   // isolated browser process to avoid GPU resource accumulation before
   // sixteen heavy 1440x720 layered photo/raster variants.
   if(!process.env.QA_LOWLIGHT_ISOLATED){
   const enhance=p.locator('#obs-enhance-toggle');
   assert(await enhance.isVisible(),'optional low-light control must be reachable: '+mode);
   assert.equal(await enhance.getAttribute('aria-pressed'),'false');
   const beforeEnhance=await p.evaluate(()=>JSON.stringify({currency:S.currency,suppression:observationState().pending?.suppression,collection:observationState().collection}));
   const regular=await p.locator('#obs-site-overlay').evaluate(e=>({
    filter:getComputedStyle(e).filter,
    veil:getComputedStyle(e,'::after').backgroundColor,
   }));
   await clickRealViewerControl('#obs-enhance-toggle');
   assert.equal(await enhance.getAttribute('aria-pressed'),'true','display compensation is explicit opt-in');
   assert.equal(await p.locator('#obs-frame').getAttribute('data-enhance'),'true');
   const corrected=await p.locator('#obs-site-overlay').evaluate(e=>({
    filter:getComputedStyle(e).filter,
    veil:getComputedStyle(e,'::after').backgroundColor,
   }));
   assert.equal(corrected.filter,'none','enhancement must not invoke an expensive GPU image filter: '+mode);
   assert.notEqual(corrected.veil,regular.veil,'user-selected compensation must visibly change the evidence: '+mode);
   assert(await p.locator('#obs-frame').evaluate(e=>e.getBoundingClientRect().width>0));
   if((mode==='vision'||mode==='dash')&&!process.env.QA_WEBKIT)
    await p.screenshot({path:'docs/qa-incursions/alt-'+mode+'-lowlight-on-390.jpg',quality:87});
   await clickRealViewerControl('#obs-zoom-toggle');
   assert.equal(await p.locator('#obs-frame').getAttribute('data-zoom'),'2');
   assert.equal(await p.locator('#obs-frame').getAttribute('data-enhance'),'true','correction remains available while zooming');
   await clickRealViewerControl('#obs-zoom-toggle');
   await clickRealViewerControl('#obs-enhance-toggle');
   assert.equal(await enhance.getAttribute('aria-pressed'),'false');
   assert.equal(await p.locator('#obs-frame').getAttribute('data-enhance'),'false');
   assert.deepEqual(await p.locator('#obs-site-overlay').evaluate(e=>({
    filter:getComputedStyle(e).filter,
    veil:getComputedStyle(e,'::after').backgroundColor,
   })),regular,'original unenhanced evidence appearance returns exactly');
   assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,suppression:observationState().pending?.suppression,collection:observationState().collection})),beforeEnhance,
    'changing the display must never grant or withdraw rewards or mutate observation state');
   }
  }
  assert(await p.locator('#obs-frame').evaluate(frame=>{
   const f=frame.getBoundingClientRect(),im=document.getElementById('obs-image').getBoundingClientRect();
   return Math.abs(f.left-im.left)<8&&Math.abs(f.top-im.top)<8&&Math.abs(f.width-im.width)<8&&Math.abs(f.height-im.height)<8;
  }),'all four sources and all four rarity states stay in frame during live motion');
  const overlay=await p.evaluate(()=>{const e=document.getElementById('obs-site-overlay');return e?getComputedStyle(e).backgroundImage:null;});
  assert(overlay!==null,'site overlay element must exist in DOM');
  const originalPhoto=await p.evaluate(m=>WatchLocations.byId('alt:'+m).file,mode);
  assert(overlay.includes(originalPhoto),'original photograph must be visible at full width '+mode+rarity);
  if(rarity>0){
   const compositor=await p.evaluate(()=>{
    const ambient=document.getElementById('obs-image');
    return {animation:getComputedStyle(ambient).animationName,
      duplicate:getComputedStyle(ambient,'::after').content};
   });
   assert.equal(compositor.animation,'none','large photographic ambient backdrop must not animate '+mode+rarity);
   assert.equal(compositor.duplicate,'none','large filtered photographic copy must not be duplicated '+mode+rarity);
  }
  if(rarity===0)assert(!overlay.includes('alt-overlays/')&&!overlay.includes('photo-deltas/'),'ordinary footage never includes anomaly art');
  else{
   assert(overlay.includes(mode+'-'+rarity+'.svg'));
   assert(overlay.includes('photo-deltas/'+mode+'-'+rarity+'.webp'),'photographic anomaly must share source photo: '+mode+rarity);
   // The photo evidence already renders in the CSS layer. Decoding a second
   // full-size off-DOM Image for every rarity can exhaust WebKit GPU memory.
   // Verify the actual served RIFF/VP8X payload and source-native dimensions
   // instead; all 12 live visual layers and real hotspot clicks remain tested.
   await p.evaluate(async ({mode,rarity})=>{
    const url=WatchLocations.photoDelta(mode,rarity);
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw Error('missing photographed anomaly evidence: '+url);
    const b=new Uint8Array(await response.arrayBuffer());
    const ascii=(at,n)=>String.fromCharCode(...b.slice(at,at+n));
    if(b.length<30||ascii(0,4)!=='RIFF'||ascii(8,4)!=='WEBP'||ascii(12,4)!=='VP8X')
     throw Error('invalid native WebP evidence: '+url);
    const w=1+b[24]+(b[25]<<8)+(b[26]<<16),
          h=1+b[27]+(b[28]<<8)+(b[29]<<16);
    if(w!==1440||h!==720)throw Error('native photo evidence dimension changed: '+url);
   },{mode,rarity});
   const valid=await p.evaluate(({mode,rarity})=>WatchLocations.targets(mode,rarity).some(([x,y])=>WatchModel.hit(observationState(),{x,y})),{mode,rarity});
   assert(valid,'matching native image-space target '+mode+rarity);
   // Browser animation can keep Playwright's element-stability waiter pending in WebKit.
   // Scroll explicitly, verify hit testing, then issue a real pointer click at the image point.
   await p.evaluate(()=>document.getElementById('obs-frame').scrollIntoView({block:'center',behavior:'instant'}));
   const geometry=await p.evaluate(({mode,rarity})=>{
    const f=document.getElementById('obs-frame').getBoundingClientRect(),overlay=document.getElementById('obs-site-overlay'),v=getComputedStyle(overlay);
    const pictureWidth=Math.min(f.width,2*f.height),pictureHeight=pictureWidth/2,rect=WatchLocations.imageRect(f.width,f.height);
    const points=WatchLocations.targets(mode,rarity).map(([x,y])=>({
     x:f.left+rect.left+x*rect.width,y:f.top+rect.top+y*rect.height
    }));
    return {containMatches:Math.abs(parseFloat(v.width)-pictureWidth)<2&&Math.abs(parseFloat(v.height)-pictureHeight)<2,
     atmosphereFit:getComputedStyle(document.getElementById('obs-image')).backgroundSize,
     atmosphereFilter:getComputedStyle(document.getElementById('obs-image')).filter,
     photoFit:v.backgroundSize,foreground:v.backgroundImage,
     points,projected:points.map(({x,y})=>WatchLocations.imagePoint(x-f.left,y-f.top,f.width,f.height)),
     targets:WatchLocations.targets(mode,rarity),f:{left:f.left,top:f.top,right:f.right,bottom:f.bottom}};
   },{mode,rarity});
   assert(await p.locator('#obs-site-overlay').evaluate(e=>e.parentElement?.id==='obs-frame'),
    'the photo must be a sibling of the blurred layer, not its child');
   assert(geometry.containMatches&&geometry.atmosphereFit==='cover'&&geometry.atmosphereFilter==='none',
    'unfiltered ambient backing cannot crop native photographic evidence '+mode+rarity);
   assert(geometry.photoFit.startsWith('100% 100%')&&geometry.foreground.includes(originalPhoto),
    'sharp native photograph and visual anomaly share an image-space rectangle '+mode+rarity);
   const f=geometry.f;
   for(let i=0;i<geometry.points.length;i++){
    const q=geometry.points[i],point=geometry.projected[i],target=geometry.targets[i];
    assert(q.x>=f.left&&q.x<=f.right&&q.y>=f.top&&q.y<=f.bottom,'no illustrated hotspot can be cropped '+mode+rarity);
    assert(point&&Math.abs(point.x-target[0])<.0001&&Math.abs(point.y-target[1])<.0001,'image tap position matches its SVG hotspot '+mode+rarity);
   }
   const q=geometry.points[0];
   const reachable=await p.evaluate(point=>{
    const hit=document.elementFromPoint(point.x,point.y);
    return hit===document.getElementById('obs-frame')||document.getElementById('obs-frame').contains(hit);
   },q);
   assert(reachable,'actual rendered hotspot must not be obscured by UI '+mode+rarity);
   await p.mouse.click(q.x,q.y);
   projectedContactTaps++;
   assert.equal(await p.evaluate(()=>observationState().pending?.suppression),1,'clicking projected visual hotspot must suppress '+mode+rarity);
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
 assert.equal(await p.locator('#obs-enhance-toggle').isVisible(),false,'old media cannot expose a nonfunctional light control');
 assert.equal(await p.locator('#obs-zoom-toggle').isHidden(),true,'legacy media must not expose a nonworking zoom control');
 await p.evaluate(()=>{const o=observationState();o.sequence=3;renderObservation();});
 assert.equal(await p.locator('#obs-frame').getAttribute('data-scene-alt'),'true','later idle scene returns to its own image');
 // Persist every source's real pointer-earned rewards before teardown.
 // A full WebKit navigation while 3 native-size photo layers are active is a
 // separate stress case and can terminate Playwright's renderer. The shared
 // acquired-record scenario still exercises actual save -> browser reload ->
 // restored evidence and currency in WebKit; Chromium covers the full matrix.
 // Source-only processes independently inspect their persisted JSON, not skip
 // saving or native photo/hotspot interaction.
 const saved=await p.evaluate(()=>{
  save();
  const state=JSON.parse(localStorage.getItem(KEY));
  return {currency:state.currency,places:WatchLocations.discovered(state.observation.locationRecords).length};
 });
 assert.equal(saved.currency,wallet+projectedContactTaps,'every real tap must persist exactly one earned point');
 if(runSharedScenario){
  await p.reload({waitUntil:'domcontentloaded'});
  assert.equal(await p.evaluate(()=>WatchLocations.discovered(S.observation.locationRecords)[0].rarities[1]),1,
   'earned photographic evidence must survive an actual browser reload');
  assert.equal(await p.evaluate(()=>S.currency),saved.currency,'earned currency survives reload');
 }else{
  assert.equal(saved.places,0,'source-only QA must not secretly save an uncollected place');
  assert.equal(await p.evaluate(()=>S.currency),saved.currency,'save does not change in-memory currency');
 }
 assert.deepEqual(errors,[]);console.log('Photo QA passed: '+(selectedMode||'all')+
  ' rarity '+(requestedRarity===undefined?'0,1,2,3':requestedRarity)+
  ' (shared scenario '+(runSharedScenario?'included':'separate')+')');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});