const {chromium,webkit}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((request,response)=>{
 try{
  const file=path.join(process.cwd(),new URL(request.url,'http://localhost').pathname==='/'?'index.html':new URL(request.url,'http://localhost').pathname);
  response.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');
  response.end(fs.readFileSync(file));
 }catch{response.writeHead(404);response.end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.evaluate(()=>{
   S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;
   S.streak={last:dayKey(),n:1};S.currency=5000;
   S.observation=WatchModel.create(Date.now(),42);S.observation.collection={'cctv:0':1,'cctv:2':1};
   S.incursion={version:1,level:0,resolved:0,history:[],discovered:{}};
   applyMode();go('home');render();openEncyclopedia('anomalies');
  });
  const progress=()=>page.evaluate(()=>JSON.stringify({currency:S.currency,collection:S.observation.collection,discovered:S.incursion.discovered}));
  const before=await progress(),opener=page.locator('[data-catalog-entry="cctv:2"]');
  await opener.focus();await page.keyboard.press('Enter');
  const detail=page.getByRole('dialog',{name:'観測資料'}),close=detail.getByRole('button',{name:'閉じる',exact:true});
  assert(await detail.isVisible(),'the acquired record opens a named dialog');
  assert(await close.evaluate(element=>document.activeElement===element),'opening the record moves focus into its dialog');
  const controls=detail.locator('button:visible:not(:disabled)');assert(await controls.count()>1);
  await page.keyboard.press('Shift+Tab');assert(await controls.last().evaluate(element=>document.activeElement===element),'reverse Tab wraps within the record');
  await page.keyboard.press('Tab');assert(await close.evaluate(element=>document.activeElement===element),'Tab wraps from the final control');
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.getElementById('sheet').contains(document.activeElement)));
  // A new detail replaces the current body without losing the original list item.
  await page.evaluate(()=>showWatchRecord('cctv',0));await close.click();
  assert(await opener.evaluate(element=>document.activeElement===element),'closing a replacement detail restores the original acquired item');
  await page.keyboard.press('Enter');await page.keyboard.press('Escape');
  assert(await detail.isHidden());assert(await opener.evaluate(element=>document.activeElement===element),'Escape restores the original item');
  // The native top-layer dialog must keep control when shown above a record.
  await page.keyboard.press('Enter');await page.evaluate(()=>openIncursion());
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.getElementById('incursion-dialog').contains(document.activeElement)),'native dialog focus must not be captured by the record underneath');
  await page.keyboard.press('Escape');assert(await detail.isVisible(),'Escape closes only the upper native dialog');
  await page.keyboard.press('Escape');assert(await detail.isHidden());assert(await opener.evaluate(element=>document.activeElement===element));
  // Disabled and hidden actions must never become the wrap destination.
  await page.evaluate(()=>sheet('操作できない記録','<button disabled>未開放</button><button hidden>非表示</button>'));
  await page.keyboard.press('Tab');assert(await page.locator('#sheet [data-act="close"]').evaluate(element=>document.activeElement===element));
  await page.keyboard.press('Shift+Tab');assert(await page.locator('#sheet [data-act="close"]').evaluate(element=>document.activeElement===element));
  await page.keyboard.press('Escape');assert(await opener.evaluate(element=>document.activeElement===element));
  assert.equal(await progress(),before,'keyboard browsing does not change currency or acquired records');assert.deepEqual(errors,[]);
  console.log('Record dialog label, entry focus, Tab boundaries, replacement/close/Escape return and native-dialog priority passed');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
