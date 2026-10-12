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
  await p.evaluate(()=>openLegendCase('u1'));
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
  assert.deepEqual(errors,[]);
  console.log('Next-day forecast UI: gated issuance, real observation, one-time comparison and mail, responsive and persisted passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
