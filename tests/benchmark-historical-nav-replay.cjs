// Diagnostic historical regression replay: same real Playwright click on an
// isolated old SHA and current code. If the original intermittent interception
// does not reproduce, the result is INCONCLUSIVE, not a confirmed negative.
// No test skips, force-clicks or JS-synthesized click events.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict');
const current=process.cwd(),old=path.resolve(current,'historical');
const historicalSHA='2769ec27710f4efecf3e49aea9ff5738e298a4ca';
const out=path.join(current,'artifacts','benchmark-nav-historical');
fs.mkdirSync(out,{recursive:true});
assert(fs.statSync(old).isDirectory(),'historical checkout is missing');
const sig=(s)=>/intercepts pointer events/i.test(s)&&/nav|game-menu/i.test(s);

async function run(root,label,browser){
 const server=http.createServer((req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
   const file=(relative==='/font.otf'&&process.env.QA_FONT)
    ?path.resolve(process.env.QA_FONT)
    :path.resolve(root,'.'+relative);
   if(relative!=='/font.otf'&&!file.startsWith(root+path.sep))throw Error('path outside checkout');
   res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'application/octet-stream');
   res.end(fs.readFileSync(file));
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const page=await browser.newPage({viewport:{width:390,height:680},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',route=>route.abort());
 try{
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  if(process.env.QA_FONT){
   await page.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});
   await page.evaluate(()=>document.fonts.load('16px QAJP'));
  }
  await page.evaluate(()=>{
   S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};
   S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};
   S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);
   S.currency=5000;applyMode();go('home');setHomeTab('desk');render();
  });
  // Reproduce the original failing CI's prerequisite sequence: Playwright
  // clock, completed route, and the same unlocked-level transition.
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.evaluate(()=>{
   const o=observationState();o.collected=5;o.pending=null;
   S.currency=100;watchMessage='';renderObservation();
  });
  await page.evaluate(()=>{observationState().tapProgress=9;});
  await page.locator('#obs-frame').click();
  await page.evaluate(()=>{
   S.currency=5000;const o=observationState();o.collected=20;o.pending=null;
   go('lab');renderObservationLab();
  });
  await page.locator('.watch-upgrades summary').click();
  const target=page.locator('[data-watch-upgrade="patrol"]');
  assert(await target.isVisible(),label+': patrol button absent');
  const prior=await page.evaluate(()=>observationState().upgrades.patrol);
  let clickError=null;
  try { await target.click({timeout:5500}); }
  catch(error) {clickError=String(error);}
  const after=await page.evaluate(()=>observationState().upgrades.patrol);
  const location=await target.evaluate(el=>{
   const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
   const hit=document.elementFromPoint(x,y);
   return {
    viewport:[innerWidth,innerHeight],rectangle:[r.x,r.y,r.width,r.height],
    center:[x,y],hit_self:hit===el||el.contains(hit),
    blocked_by_nav:!!hit?.closest?.('.nav'),
    hit_element_tag:hit?.tagName?.toLowerCase()||null,
   };
  });
  await page.screenshot({path:path.join(out,label+'.png')});
  assert.deepEqual(errors,[],label+': JavaScript page exceptions');
  return {label,prior,after,location,click_had_error:!!clickError,
    observed_nav_pointer_interception:!!clickError&&sig(clickError),
    // Do not store raw Playwright logs from private game contexts.
    result: clickError ? (sig(clickError)?'fixed_nav_intercepted_real_click':'other_click_failure')
                       : after>prior?'clicked_and_upgraded':'clicked_without_expected_upgrade'};
 }finally{
  await page.close();
  await new Promise(resolve=>server.close(resolve));
 }
}

(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  // Historical click failure was intermittent in the original CI. Collect
  // multiple independent browser-page observations without modifying old
  // source or introducing forced click / JS click shortcuts.
  const historical=[];
  for(let i=1;i<=3;i++) {
    const result=await run(old,'historical-'+i,browser);
    historical.push(result);
    assert(['fixed_nav_intercepted_real_click','clicked_and_upgraded'].includes(result.result),
      'Historical run produced an unrelated failure; do not silently reclassify it');
  }
  const fixed=await run(current,'current',browser);
  const reproduced=historical.some(x=>x.result==='fixed_nav_intercepted_real_click');
  const report={
   task_id:'shinso-nav-click-01',historical_sha:historicalSHA,
   fixed_sha:process.env.GITHUB_SHA||null,
   source_run:'https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38197626223',
   historical, fixed,
   real_click_tested:true,
   historical_click_attempts:historical.length,
   ai_agent_trials_executed:0,
   original_failure_reproduced:reproduced,
   current_positive_control:fixed.result==='clicked_and_upgraded',
   negative_replay_status:reproduced?'confirmed_in_one_or_more_historical_trials':'inconclusive_not_reproduced',
   replay_baseline_ready:reproduced,
   limitations:['Chromium headless 390x680 only','No physical Safari or external Firebase',
    'Historical failure was intermittent; passing historical replay must not be treated as regression-fixed proof',
    'A diagnostic CI pass does not certify an old failure was reproduced or a model A/B was executed'],
  };
  fs.writeFileSync(path.join(out,'historical-replay-report.json'),
   JSON.stringify(report,null,2)+'\n');
  console.log('Isolated historical diagnostic',JSON.stringify({
    historical:historical.map(x=>x.result),
    current:fixed.result,
    replay_status:report.negative_replay_status,
  }));
  assert(report.current_positive_control,
    'Current main failed patrol purchase: never weaken real click test');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
