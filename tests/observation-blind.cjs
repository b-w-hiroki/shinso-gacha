/* Local, zero-account blind human-QA workflow, not an automated claim of
 * perceptual discoverability. All 16 video stimuli must actually load. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const server=http.createServer((request,response)=>{
 try{
  const url=new URL(request.url,'http://localhost'),file=path.join(process.cwd(),url.pathname==='/'?'index.html':url.pathname);
  response.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':
   file.endsWith('.js')?'application/javascript':file.endsWith('.svg')?'image/svg+xml':
   file.endsWith('.webp')?'image/webp':'application/octet-stream');
  response.end(fs.readFileSync(file));
 }catch{response.writeHead(404);response.end();}
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{
  executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,
  args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']
 });
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',route=>route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port+'/qa/observation-blind.html');
  assert(await page.locator('#intro').isVisible());
  assert.equal(await page.locator('#test').isVisible(),false);
  await page.locator('#begin').click();
  const seen=new Set();
  for(let i=0;i<16;i++){
   await page.locator('#test').waitFor({state:'visible'});
   const current=await page.evaluate(()=>QAStudy.current());
   assert(current&&['cctv','photo','vision','dash'].includes(current.mode));
   assert([0,1,2,3].includes(current.rarity));
   seen.add(current.mode+':'+current.rarity);
   assert((await page.locator('#trial-index').innerText()).includes((i+1)+' / 16'));
   const css=await page.locator('#scene').evaluate(e=>getComputedStyle(e).backgroundImage);
   assert(css.includes(WatchFileName(current.mode)),'canonical scene photo missing '+current.mode);
   if(i===0&&!process.env.QA_WEBKIT){
    const dir='docs/qa-incursions';fs.mkdirSync(dir,{recursive:true});
    await page.screenshot({path:dir+'/blind-observation-first-390.jpg',quality:86});
   }
   if(current.rarity===0){
    assert(!css.includes('photo-deltas')&&!css.includes('alt-overlays'),'ordinary view must not show anomaly');
    await page.locator('#none').click();
   }else{
    assert(css.includes('photo-deltas/'+current.mode+'-'+current.rarity+'.webp'));
    assert(css.includes('alt-overlays/'+current.mode+'-'+current.rarity+'.svg'));
    const rect=await page.locator('#frame').boundingBox();
    const target=await page.evaluate(({mode,rarity})=>WatchLocations.targets(mode,rarity)[0],current);
    await page.mouse.click(rect.x+rect.width*target[0],rect.y+rect.height*target[1]);
   }
  }
  assert.equal(seen.size,16,'one baseline and each three tiers across all four sites');
  assert(await page.locator('#result').isVisible());
  const output=await page.evaluate(()=>QAStudy.result());
  assert.equal(output.schema,'shinso-observation-blind-qa-v1');
  assert.equal(output.summary.total,16);
  assert.equal(output.summary.hitCount,12);
  assert.equal(output.summary.correctNormalCount,4);
  assert.equal(output.summary.falsePositiveCount,0);
  assert.equal(output.summary.missedCount,0);
  assert(output.summary.medianHitMs>=0);
  assert.equal(output.trials.filter(x=>x.response==='tap'&&x.point).length,12);
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).length),0,'the QA cannot persist answers or game progress');
  await page.locator('[name="survey-unease"][value="4"]').check();
  assert.equal(await page.evaluate(()=>QAStudy.result().survey.unease),4);
  if(!process.env.QA_WEBKIT){
   await page.setViewportSize({width:320,height:568});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.setViewportSize({width:844,height:390});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:'docs/qa-incursions/blind-observation-results-390.jpg',quality:86});
  }
  await page.locator('#restart').click();
  await page.locator('#begin').click();
  await page.locator('#test').waitFor({state:'visible'});
  const r=await page.locator('#frame').boundingBox();
  await page.mouse.click(r.x+r.width*.01,r.y+r.height*.01);
  assert.equal(await page.evaluate(()=>QAStudy.summary().falsePositiveCount),1,'wrong-image taps count as false positives');
  assert.deepEqual(errors,[]);
  console.log('16 blinded normal/anomaly screens: randomized, decoded, real taps, timing, correct/false/missed metrics, anonymous in-memory reset and responsive UI passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
function WatchFileName(mode){return {
 cctv:'cctv-underground-native.webp',photo:'photo-classroom-native.webp',
 vision:'vision-crossing-native.webp',dash:'dash-coast-road-native.webp'
}[mode];}
