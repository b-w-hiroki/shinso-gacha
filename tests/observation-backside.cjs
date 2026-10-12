const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{
 const u=new URL(q.url,'http://localhost'),file=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);
 r.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');
 r.end(fs.readFileSync(file));
}catch{r.writeHead(404);r.end();}});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await(process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{
  executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']
 });
 try{
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('https://**/*',route=>route.abort());
  await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){
   await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')}body,button{font-family:QAJP}"});
   await p.evaluate(()=>document.fonts.load('16px QAJP'));
  }
  await p.evaluate(()=>{
   S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;
   S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};
   S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');render();
  });
  await p.evaluate(()=>showAlternateLocationRecord('photo',2));
  assert.equal(await p.locator('.watch-site-backside').count(),0,'unowned photo note must be absent from DOM');
  await p.evaluate(()=>{
   const o=observationState(),now=Date.now();
   o.locationRecords={'alt:photo':{visits:1,lastSequence:1,firstAt:now,rarities:{2:1}}};
   showAlternateLocationRecord('photo',2);
  });
  const before=await p.evaluate(()=>JSON.stringify({currency:S.currency,locationRecords:S.observation.locationRecords}));
  assert.equal(await p.locator('.watch-site-backside').count(),1,'only owned anomaly has a reverse');
  assert((await p.locator('.watch-site-backside summary').innerText()).includes('裏面'));
  await p.locator('.watch-site-backside summary').click();
  assert((await p.locator('.watch-site-backside').innerText()).includes('黒板'));
  assert((await p.locator('.watch-site-backside').innerText()).includes('通常の映像が回収'));
  assert(!(await p.locator('.watch-site-backside').innerText()).includes('出席番号の欠番'),'never leak unowned SSR');
  assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,locationRecords:S.observation.locationRecords})),before,
   'reading reverse gives no reward or altered collection');
  for(const [w,h] of [[320,568],[390,844],[844,390]]){
   await p.setViewportSize({width:w,height:h});
   await p.locator('.watch-site-backside').scrollIntoViewIfNeeded();
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow at '+w+'x'+h);
   assert(await p.locator('.watch-site-backside summary').evaluate(e=>e.getBoundingClientRect().height>=44));
   if(w===390&&!process.env.QA_WEBKIT){
    fs.mkdirSync('docs/qa-incursions',{recursive:true});
    await p.screenshot({path:'docs/qa-incursions/observation-backside-390.jpg',quality:87});
   }
  }
  await p.evaluate(()=>{
   const o=observationState();o.locationRecords['alt:photo'].rarities[0]=1;
   showAlternateLocationRecord('photo',2);
  });
  await p.locator('.watch-site-backside summary').click();
  assert.equal(await p.locator('.watch-backside-compare').count(),1,'normal original unlocks comparison copy');
  const second=await p.evaluate(()=>JSON.stringify({currency:S.currency,locationRecords:S.observation.locationRecords}));
  await p.locator('.watch-site-backside summary').click();
  await p.locator('.watch-site-backside summary').click();
  assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,locationRecords:S.observation.locationRecords})),second,
   'repeat browsing is read-only');
  await p.evaluate(()=>showAlternateLocationRecord('photo',3));
  assert.equal(await p.locator('.watch-site-backside').count(),0,'unknown SSR reverse must not appear');
  assert.deepEqual(errors,[]);
  console.log('Photo reverse UI: only owned anomaly, locked-to-earned normal comparison, 320/390/844px, repeat reads and no rewards passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
