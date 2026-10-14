const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),p=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);res.setHeader('Content-Type',p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());
  await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.levels={u2:3};S.lastTick=Date.now()+600000;S.streak={last:dayKey(),n:1};S.incursion={version:1,level:0,resolved:0,history:[]};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;S.forecastFollowups=undefined;applyMode();go('home');setHomeTab('desk');render();});
  // Saved, well-formed future reports must not unlock an unknown case or
  // mismatched observation medium through the inbox.
  await p.evaluate(()=>{
   const issued=new Date();issued.setDate(issued.getDate()-3);
   S.forecastFollowups={version:1,entries:{u1:{mode:'cctv',issuedAt:issued.getTime(),observedAt:Date.now()-3600000,rarity:2}}};
   renderMenuBadge();
  });
  assert.equal(await p.evaluate(()=>!!S.communications?.mail?.['forecast-u1']),false,'unacquired forecast cannot create mail');
  await p.evaluate(()=>{
   S.communications.mail['forecast-u1']={receivedAt:Date.now(),read:false,claimed:false};
   openGameMail('forecast-u1');
  });
  assert.equal(await p.locator('[data-legend="case"][data-id="u1"]').count(),0,'unearned archived letter cannot link to a secret case');
  await p.evaluate(()=>{
   delete S.communications.mail['forecast-u1'];
   const issued=new Date();issued.setDate(issued.getDate()-3);
   S.forecastFollowups={version:1,entries:{u2:{mode:'photo',issuedAt:issued.getTime(),observedAt:Date.now()-3600000,rarity:2}}};
   renderMenuBadge();
  });
  assert.equal(await p.evaluate(()=>!!S.communications?.mail?.['forecast-u2']),false,'wrong-medium saved report cannot generate mail');
  await p.evaluate(()=>{S.forecastFollowups=undefined;hideSheet();openLegendCase('u1');});
  assert.equal(await p.locator('[data-forecast-issue]').count(),0,'unacquired reports are hidden');
  await p.evaluate(()=>openLegendCase('u2'));
  assert(await p.locator('[data-forecast-issue="u2"]').isVisible());
  const initial=await p.evaluate(()=>S.currency);
  await p.locator('[data-forecast-issue="u2"]').click();
  assert((await p.locator('.forecast-action').innerText()).includes('翌日以降'));
  assert.equal(await p.locator('[data-forecast-issue="u2"]').count(),0);
  assert.equal(await p.evaluate(()=>S.currency),initial,'making a request grants nothing');
  await p.evaluate(()=>{
   const o=observationState(),now=Date.now();o.mode='dash';o.mind.closed=false;
   o.pending={mode:'dash',rarity:0,readyAt:now,expiresAt:now+600000,sequence:o.sequence,suppression:0};
   const record=WatchModel.claim(o,now);if(!record)throw Error('expected ordinary claimed record');
   observationReward({kind:'patrol',record});
  });
  assert.equal(await p.evaluate(()=>ForecastFollowup.inspect(S.forecastFollowups,'u2').status),'pending','same-day patrol does not complete the future');
  assert.equal(await p.evaluate(()=>Boolean(S.communications?.mail?.['forecast-u2'])),false,'no premature mail');
  await p.evaluate(()=>{
   const x=S.forecastFollowups.entries.u2,day=new Date();day.setDate(day.getDate()-1);x.issuedAt=day.getTime();
   const o=observationState(),now=Date.now();o.mode='dash';o.mind.closed=false;
   o.pending={mode:'dash',rarity:0,readyAt:now,expiresAt:now+600000,sequence:o.sequence,suppression:0};
   const record=WatchModel.claim(o,now);if(!record)throw Error('expected tomorrow record');
   observationReward({kind:'patrol',record});
  });
  const completed=await p.evaluate(()=>({entry:ForecastFollowup.inspect(S.forecastFollowups,'u2'),mail:S.communications?.mail?.['forecast-u2'],currency:S.currency}));
  assert.equal(completed.entry.status,'compared');
  assert(completed.entry.copy.includes('平常'),'normal conditions also create a contradiction');
  assert(completed.mail&&!completed.mail.read);
  assert.equal(completed.currency,initial+32,'2 genuine dash patrols, no additional forecast points');
  await p.evaluate(()=>openLegendCase('u2'));
  assert((await p.locator('.forecast-action').innerText()).includes('受領印'));
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   await p.locator('.forecast-action').scrollIntoViewIfNeeded();
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no viewport overflow');
   if(width===390&&!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/forecast-followup-390.jpg',quality:85});
  }
  await p.evaluate(()=>{hideSheet();openGameInbox();});
  await p.locator('[data-mail="forecast-u2"]').click();
  assert(await p.locator('[data-legend="case"][data-id="u2"]').isVisible(),'saved mail returns to acquired case');
  await p.locator('[data-legend="case"][data-id="u2"]').click();
  assert((await p.locator('.forecast-action').innerText()).includes('平常'));
  await p.evaluate(()=>save());await p.reload();
  assert.equal(await p.evaluate(()=>ForecastFollowup.inspect(S.forecastFollowups,'u2').status),'compared');
  assert.equal(await p.evaluate(()=>S.communications.mail['forecast-u2'].read),true);
  assert.equal(await p.evaluate(()=>S.currency),initial+32);
  // A different earned observation of the same media appends a separate contradiction.
  await p.evaluate(()=>{
   const o=observationState(),now=Date.now();o.mode='dash';o.mind.closed=false;
   o.pending={mode:'dash',rarity:0,readyAt:now,expiresAt:now+600000,sequence:o.sequence,suppression:0};
   const record=WatchModel.claim(o,now);if(!record)throw Error('expected additional real observation');
   observationReward({kind:'patrol',record});
  });
  const later=await p.evaluate(()=>ForecastFollowup.inspect(S.forecastFollowups,'u2'));
  assert.equal(later.rarity,0,'first report finding stays frozen');
  assert.equal(later.rechecks.length,1);
  assert.equal(await p.evaluate(()=>S.currency),initial+48,'one real dash patrol only, no forecast bonus');
  assert.equal(await p.evaluate(()=>Object.keys(S.communications.mail).filter(k=>k==='forecast-u2').length),1,'follow-ups do not reissue the first mail');
  await p.setViewportSize({width:390,height:844});
  await p.evaluate(()=>openLegendCase('u2'));
  assert.equal(await p.locator('.forecast-rechecks summary').count(),1);
  await p.locator('.forecast-rechecks summary').click();
  await p.locator('.forecast-rechecks').scrollIntoViewIfNeeded();
  assert((await p.locator('.forecast-rechecks').innerText()).includes('最初の照合結果は書き換えられていません'));
  if(!process.env.QA_WEBKIT)await p.screenshot({path:'docs/qa-incursions/forecast-followup-rechecks-390.jpg',quality:85});
  await p.evaluate(()=>save());await p.reload();
  assert.equal(await p.evaluate(()=>ForecastFollowup.inspect(S.forecastFollowups,'u2').rechecks.length),1,'real subsequent observations survive reload');
  assert.equal(await p.evaluate(()=>S.currency),initial+48);
  // Two legitimately acquired tomorrow reports from the same observation medium
  // may be compared without unlocking a third person's unowned investigation.
  await p.evaluate(()=>{
   S.levels.u1=3;S.levels.u6=3;
   const now=Date.now(),issuedAt=now-86400000*2;
   const kept=ForecastFollowup.normalize(S.forecastFollowups);
   kept.entries.u1={mode:'cctv',issuedAt,observedAt:now-3600000,rarity:1,firstSequence:7};
   kept.entries.u6={mode:'cctv',issuedAt,observedAt:now-1500000,rarity:0,firstSequence:9};
   S.forecastFollowups=kept;
   openLegendCase('u1');
  });
  const beforeCross=await p.evaluate(()=>JSON.stringify({currency:S.currency,followups:S.forecastFollowups,levels:S.levels}));
  assert.equal(await p.locator('.forecast-cross-case').count(),1);
  await p.locator('.forecast-cross-case summary').click();
  assert.equal(await p.locator('.forecast-cross-case [data-legend="case"]').count(),1);
  assert((await p.locator('.forecast-cross-case').innerText()).includes('照合'));
  assert(!(await p.locator('.forecast-cross-case').innerText()).includes('u9'),'an unowned report is never referenced');
  if(!process.env.QA_WEBKIT){
   await p.setViewportSize({width:390,height:844});
   await p.locator('.forecast-cross-case').scrollIntoViewIfNeeded();
   await p.screenshot({path:'docs/qa-incursions/forecast-cross-case-390.jpg',quality:85});
  }
  await p.locator('.forecast-cross-case [data-legend="case"][data-id="u6"]').click();
  assert((await p.locator('.legend-case h2').innerText()).length>0,'linked report can open its acquired case');
  assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,followups:S.forecastFollowups,levels:S.levels})),beforeCross,
   'cross-report reading is strictly non-rewarding and read-only');
  // Third genuine acquired investigation and later observation unlock the
  // shared three-report register without creating new reward/state counters.
  await p.evaluate(()=>{
   openLegendCase('u1');
  });
  assert.equal(await p.locator('.forecast-triple').count(),0,'only two reports: triple archive absent from DOM');
  await p.evaluate(()=>{
   S.levels.u9=3;
   const now=Date.now(),day=now-3*86400000;
   const state=ForecastFollowup.normalize(S.forecastFollowups);
   state.entries.u9={mode:'cctv',issuedAt:day,observedAt:now-500000,rarity:2,firstSequence:11};
   S.forecastFollowups=state;
   openLegendCase('u1');
  });
  const beforeTriple=await p.evaluate(()=>JSON.stringify({currency:S.currency,followups:S.forecastFollowups,levels:S.levels}));
  assert.equal(await p.locator('.forecast-triple').count(),1);
  await p.locator('.forecast-cross-case summary').first().click();
  await p.locator('.forecast-triple summary').click();
  assert.equal(await p.locator('.forecast-triple li').count(),3);
  assert((await p.locator('.forecast-triple').innerText()).includes('食い違う'));
  assert(!(await p.locator('.forecast-triple').innerText()).includes('u8'),'unknown cases absent');
  if(!process.env.QA_WEBKIT){
   await p.setViewportSize({width:390,height:844});
   await p.locator('.forecast-triple').scrollIntoViewIfNeeded();
   await p.screenshot({path:'docs/qa-incursions/forecast-three-report-390.jpg',quality:85});
  }
  assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,followups:S.forecastFollowups,levels:S.levels})),beforeTriple,
   'three-report archive reading never writes or rewards');
  await p.evaluate(()=>{S.levels.u9=0;openLegendCase('u1');});
  assert.equal(await p.locator('.forecast-triple').count(),0,'unearned third case must never leak');
  assert.deepEqual(errors,[]);
  console.log('Next-day forecast UI: gated issuance, real observation, one-time comparison and mail, responsive and persisted passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
