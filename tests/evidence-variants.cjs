const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.currency=5000;S.lastTick=Date.now()+600000;S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.caseLog={};applyMode();go('home');render();});
  // Every one of the six evidence types renders a readable sheet at 320px and 390px.
  const seen=new Set();
  for(const [i,type] of ['cctv','map','audio','intercom','transit','photo'].entries()){
   const pulls=await p.evaluate(i=>{for(let n=0;n<4000;n++){S.pulls=n;if(EVIDENCE_TYPES[radarSignal().seed%EVIDENCE_TYPES.length]===EVIDENCE_TYPES[i])return n;}return -1;},i);
   assert(pulls>=0,'no seed found for '+type);
   await p.evaluate(()=>openAnomalyEvidence());
   assert.equal(await p.evaluate(()=>anomalyEvidence().type),type);seen.add(type);
   for(const w of [320,390]){
    await p.setViewportSize({width:w,height:844});
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),type+' overflows at '+w);
    assert((await p.locator('#sheet').innerText()).length>40,type+' empty');
    assert(await p.locator('#sheet button').evaluateAll(xs=>xs.filter(x=>x.offsetParent).every(x=>x.getBoundingClientRect().height>=40)),type+' tap target');
   }
   if(type==='photo'||type==='audio')await p.screenshot({path:`docs/qa-incursions/evidence-${type}-390.jpg`,quality:85});
   await p.evaluate(()=>hideSheet());
  }
  assert.equal(seen.size,6);
  // Nine continued-anomaly patterns (field/seal/watch x3) each reach the player as readable text.
  const bodies=new Set();
  for(const choice of ['field','seal','watch'])for(let k=0;k<3;k++){
   const got=await p.evaluate(({choice,k})=>{for(let n=0;n<300;n++){const day='2026-09-'+String(10+(n%20))+'x'.repeat(n%7);S.caseLog={[day]:{choice,code:'C'.repeat(n%5),clearanceRank:0,at:1}};S.ups={};S.levels={};const a=caseAftermath();if(a&&AFTERMATH[choice].findIndex(x=>x[1]===a.title)===k)return a;}return null;},{choice,k});
   assert(got&&got.title&&got.body&&got.state,'aftermath '+choice+' '+k);bodies.add(got.title);
  }
  assert.equal(bodies.size,9,'nine distinct aftermath patterns');
  assert.deepEqual(errors,[]);console.log('Six evidence types render at 320/390 and nine continued-anomaly patterns are distinct and complete');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
