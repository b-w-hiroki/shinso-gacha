const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{
 const u=new URL(q.url,'http://localhost');
 const file=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);
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
  assert.equal(await p.locator('.site-verso').count(),0,'unacquired reverse must not exist in DOM');
  const modes=['cctv','photo','vision','dash'];
  for(const mode of modes){
   await p.evaluate(mode=>{
    const o=observationState(),now=Date.now();
    o.locationRecords={['alt:'+mode]:{visits:1,lastSequence:1,firstAt:now,rarities:{2:1}}};
    showAlternateLocationRecord(mode,2);
   },mode);
   assert.equal(await p.locator('.site-verso').count(),1,'each earned location has exactly one paper reverse: '+mode);
   await p.locator('.site-verso summary').click();
   assert((await p.locator('.site-verso-paper').innerText()).includes('第六文書課'),'paper header visible');
   assert((await p.locator('.site-verso-paper').innerText()).includes('平常の原本が届く'));
   const baseline=await p.evaluate(()=>JSON.stringify({currency:S.currency,records:S.observation.locationRecords}));
   await p.locator('.site-verso summary').click();await p.locator('.site-verso summary').click();
   assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,records:S.observation.locationRecords})),baseline,
    'open-close reverse cannot award pt or mutate discoveries');
   if(!process.env.QA_WEBKIT){
    await p.setViewportSize({width:390,height:844});
    await p.locator('.site-verso').scrollIntoViewIfNeeded();
    fs.mkdirSync('docs/qa-incursions',{recursive:true});
    await p.screenshot({path:'docs/qa-incursions/verso-'+mode+'-390.jpg',quality:86});
   }
  }
  await p.evaluate(()=>{
   const o=observationState();o.locationRecords={'alt:photo':{visits:3,lastSequence:3,firstAt:Date.now(),rarities:{0:1,2:1}}};
   showAlternateLocationRecord('photo',2);
  });
  await p.locator('.site-verso summary').click();
  assert.equal(await p.locator('.site-verso-comparison').count(),1,'acquired normal image adds a compare-only sentence');
  assert.equal(await p.locator('.site-verso-pending').count(),0);
  for(const [w,h] of [[320,568],[390,844],[844,390]]){
   await p.setViewportSize({width:w,height:h});
   await p.locator('.site-verso').scrollIntoViewIfNeeded();
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow at '+w+'x'+h);
   assert(await p.locator('.site-verso summary').evaluate(e=>e.getBoundingClientRect().height>=44));
  }
  await p.evaluate(()=>{hideSheet();showAlternateLocationRecord('photo',3);});
  assert.equal(await p.locator('.site-verso:visible').count(),0,'unacquired third-level reverse cannot open a new visible sheet');
  await p.evaluate(()=>{save();showAlternateLocationRecord('photo',2);});
  await p.reload();
  await p.evaluate(()=>showAlternateLocationRecord('photo',2));
  assert.equal(await p.locator('.site-verso').count(),1,'reread from existing save is compatible');
  assert.equal(await p.evaluate(()=>S.currency),5000,'reading not a reward');
  assert.deepEqual(errors,[]);
  console.log('4-source earned reverse dossier, original comparison, 320/390/844px, reload and zero extra rewards passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
