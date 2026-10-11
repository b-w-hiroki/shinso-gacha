const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.levels={u1:3};S.lastTick=Date.now()+900000;S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,history:[]};S.currency=1337;applyMode();openLegendCase('u2');});
 assert.equal(await p.locator('[data-inquiry="save-report"]').count(),0,'unowned report hidden');
 await p.evaluate(()=>openLegendCase('u1'));await p.locator('.investigation-report summary').first().click();
 assert(await p.locator('[data-inquiry="save-report"]').isVisible());
 const initial=await p.evaluate(()=>({wallet:S.currency,original:JSON.stringify(LegendModel.CASES.u1),conclusions:JSON.stringify(legendState().conclusions)}));
 await p.locator('[data-report-choice]').selectOption('0');await p.locator('[data-report-note]').fill('同じ巡回票には、別の日時がある。');
 await p.locator('[data-inquiry="save-report"]').click();
 assert.equal(await p.evaluate(()=>ResearchReports.inspect(S.researchReports,S.levels,'u1').revisions),1);
 await p.locator('.investigation-report summary').first().click();
 assert.equal(await p.locator('[data-report-choice]').inputValue(),'0');
 assert((await p.locator('[data-report-note]').inputValue()).includes('巡回票'));
 await p.locator('[data-report-choice]').selectOption('1');await p.locator('[data-report-note]').fill('<img src=x onerror=alert(1)>');
 await p.locator('[data-inquiry="save-report"]').click();
 await p.locator('.investigation-report summary').first().click();
 assert.equal(await p.locator('.research-editor img').count(),0,'user note escaped from HTML');
 assert.equal(await p.locator('[data-report-note]').inputValue(),'<img src=x onerror=alert(1)>');
 assert.equal(await p.locator('.research-editor li').count(),2);
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});
  await p.locator('[data-inquiry="save-report"]').scrollIntoViewIfNeeded();
  assert(await p.locator('[data-inquiry="save-report"]').evaluate(e=>e.getBoundingClientRect().height>=44));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390&&!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/research-reports-390.jpg',quality:86});
 }
 assert.deepEqual(await p.evaluate(()=>({wallet:S.currency,original:JSON.stringify(LegendModel.CASES.u1),conclusions:JSON.stringify(legendState().conclusions)})),initial,'historical source and rewards do not change');
 await p.evaluate(()=>save());await p.reload();
 assert.equal(await p.evaluate(()=>ResearchReports.inspect(S.researchReports,S.levels,'u1').revisions),2);
 assert.deepEqual(errors,[]);
 console.log('Research reports: acquired-only, editable revision history, escaping, 320/390/844, saved reload, immutable originals passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});