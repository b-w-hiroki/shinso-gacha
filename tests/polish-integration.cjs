const {chromium,webkit}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((request,response)=>{
 try{
  const pathname=new URL(request.url,'http://localhost').pathname;
  const file=path.join(process.cwd(),pathname==='/'?'index.html':pathname);
  response.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');
  response.end(fs.readFileSync(file));
 }catch{response.writeHead(404);response.end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.evaluate(()=>{
   S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.streak={last:dayKey(),n:1};
   S.currency=5000;S.observation=WatchModel.create(Date.now(),42);S.observation.collection={'cctv:0':1,'cctv:2':1};
   S.incursion={version:1,level:0,resolved:0,history:[],discovered:{}};applyMode();go('home');setHomeTab('tasks');render();
  });
  const progress=()=>page.evaluate(()=>JSON.stringify({currency:S.currency,collection:S.observation.collection,discovered:S.incursion.discovered}));
  const before=await progress();
  await page.locator('#game-menu').click();await page.locator('[data-view="menu"] [data-menu="catalog"]').click();
  const search=page.getByRole('searchbox',{name:'取得済みの記録を検索'});
  await search.fill('来園者');const record=page.locator('[data-catalog-entry="cctv:2"]');await record.focus();await page.keyboard.press('Enter');
  assert(await page.getByRole('dialog',{name:'観測資料'}).isVisible());await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');await page.keyboard.press('Escape');
  assert.equal(await search.inputValue(),'来園者');assert(await record.evaluate(element=>document.activeElement===element),'closing a search result returns to that result');
  await search.focus();await page.keyboard.press('Escape');assert.equal(await search.inputValue(),'');await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.menu),'catalog','cleared search returns to the catalog menu entry');
  await page.keyboard.press('Escape');assert(await page.locator('[data-hpane="tasks"]').isVisible());assert.equal(await page.evaluate(()=>document.activeElement.id),'game-menu');

  // Legacy dates remain stored; only their display falls back to a readable label.
  await page.evaluate(()=>{
   S.observation.locationRecords={'alt:cctv':{visits:1,lastSequence:1,firstAt:Number.MAX_SAFE_INTEGER,rarities:{0:1}}};
   openEncyclopedia('places');
  });
  await page.locator('[data-catalog-entry="alt:cctv"]').click();assert((await page.locator('#sheet').innerText()).includes('最初の観測 日時不明'));await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>S.observation.locationRecords['alt:cctv'].firstAt),Number.MAX_SAFE_INTEGER);
  await page.evaluate(()=>{
   S.observation.history=[{mode:'cctv',rarity:2,readyAt:1e20}];
   S.levels.u1=3;S.researchReports={version:1,files:{u1:{history:[{choice:2,note:'保管済み',at:1e20}]}}};
  });
  const dates=await page.evaluate(()=>({history:catalogObservationHistory('cctv',2),report:researchReportHTML('u1',{hypothesis:null}),saved:S.researchReports.files.u1.history[0].at}));
  assert(dates.history.includes('日時不明')&&!dates.history.includes('Invalid Date'));assert(dates.report.includes('日時不明')&&!dates.report.includes('Invalid Date'));assert.equal(dates.saved,1e20);

  // A pending clipboard rejection must not select a different or removed report.
  await page.evaluate(()=>{
   Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:text=>new Promise((resolve,reject)=>{window.clipboardJob={text,resolve,reject};})}});
   sheet('共有',shareBlock('元の共有文'));
  });
  await page.locator('[data-act="copy"]').click();const missions=await page.evaluate(()=>JSON.stringify(S.missions));
  await page.evaluate(()=>{sheet('別の資料','<p>共有本文のない資料</p>');window.clipboardJob.reject(new Error('denied'));});
  await page.waitForFunction(()=>document.getElementById('toast').textContent.includes('共有画面を開き直して'));
  assert.equal(await page.evaluate(()=>JSON.stringify(S.missions)),missions,'stale clipboard failures cannot report a successful share');
  await page.evaluate(()=>sheet('共有',shareBlock('実際にコピーする本文')));await page.locator('[data-act="copy"]').click();
  assert.equal(await page.evaluate(()=>window.clipboardJob.text),'実際にコピーする本文');await page.evaluate(()=>window.clipboardJob.resolve());
  await page.waitForFunction(()=>document.getElementById('toast').textContent==='コピーしました');
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}});sheet('共有',shareBlock('手動でコピーする本文'));});
  await page.locator('[data-act="copy"]').click();await page.waitForFunction(()=>getSelection()?.toString()==='手動でコピーする本文');
  await page.keyboard.press('Escape');

  // Escape closes the visible upper sheet before the opening screen underneath.
  await page.evaluate(()=>{$('stage').hidden=false;Q=[];phase='shown';sheet('添付資料','<p>上に開いた資料</p>');});
  await page.keyboard.press('Escape');assert(await page.locator('#sheet-bg').isHidden());assert(await page.locator('#stage').isVisible());
  await page.keyboard.press('Escape');assert(await page.locator('#stage').isHidden());
  assert.equal(await progress(),before,'browsing and copying preserve currency and acquired records');assert.deepEqual(errors,[]);
  console.log('Combined polish: search/detail/menu return, legacy dates, async clipboard success/failure and top-sheet Escape passed');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
