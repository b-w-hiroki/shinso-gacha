const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage',...(process.platform==='win32'?[]:['--no-zygote','--single-process'])]});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});


 const initializeMock=()=>p.evaluate(()=>{
  const clone=x=>JSON.parse(JSON.stringify(x));window.accountCalls=[];window.accountFailure='';window.accountDocs={};
  cloud=null;accountDeleting=false;accountBusy=false;localStorage.removeItem(KEY+'_account_deletion');
  const user={uid:'guest',isAnonymous:true,displayName:'Guest'};
  const originalError=accountError;accountError=e=>{window.accountLastError={code:e?.code,message:e?.message,stack:e?.stack};return originalError(e);};
  class GoogleAuthProvider{setCustomParameters(){} static credentialFromError(){return {token:'test-only'};}}
  const auth={currentUser:user};
  FB={auth,db:{},doc:(_,kind,uid)=>kind+'/'+uid,Au:{GoogleAuthProvider,
   linkWithPopup:async()=>{accountCalls.push('link');if(accountFailure==='popup')throw {code:'auth/popup-closed-by-user'};if(accountFailure==='existing')throw {code:'auth/credential-already-in-use'};auth.currentUser={uid:'guest',isAnonymous:false,email:'investigator@example.test'};},
   signInWithPopup:async()=>{auth.currentUser={uid:'google',isAnonymous:false,email:'return@example.test'};},
   signInWithCredential:async()=>{auth.currentUser={uid:'google',isAnonymous:false,email:'return@example.test'};},
   reauthenticateWithPopup:async u=>{accountCalls.push('reauth:'+u.uid);if(accountFailure==='reauth')throw {code:'auth/popup-closed-by-user'};},
   deleteUser:async u=>{accountCalls.push('delete:'+u.uid);if(accountFailure==='auth-delete')throw {code:'auth/network-request-failed'};auth.currentUser=null;},
   signOut:async()=>{accountCalls.push('logout');auth.currentUser=null;}
  },getDoc:async ref=>{if(accountFailure==='read')throw {code:'unavailable'};return {exists:()=>!!accountDocs[ref],data:()=>clone(accountDocs[ref])};},
  setDoc:async(ref,value)=>{accountDocs[ref]=clone(value);},getCountFromServer:async()=>({data:()=>({count:1})}),collection:(_,x)=>x,
  runTransaction:async(_,fn)=>{
   accountCalls.push('transaction');const pending=clone(accountDocs);
   const result=await fn({get:async ref=>({exists:()=>!!pending[ref],data:()=>clone(pending[ref])}),set:(ref,value)=>{pending[ref]=clone(value);},delete:ref=>{delete pending[ref];}});
   if(accountFailure==='transaction')throw {code:'permission-denied'};accountDocs=pending;return result;
  }};
  accountReady=true;accountStatus='ゲストの記録';bindCloud(user);cloud.canWrite=true;cloud.revision=0;openAccount();
 });
 await initializeMock();
 // Canceled login preserves progress and cloud identity.
 await p.evaluate(()=>{accountFailure='popup';});const before=await p.evaluate(()=>S.currency);
 await p.locator('[data-account="login"]').click();await p.waitForFunction(()=>!accountBusy);assert.equal(await p.evaluate(()=>S.currency),before);assert.equal(await p.evaluate(()=>cloud.uid),'guest');
 await p.evaluate(()=>{accountFailure='';});await p.locator('[data-account="login"]').click();await p.waitForFunction(()=>!accountBusy);
 assert.equal(await p.locator('#account-identity').innerText(),'investigator@example.test');assert(await p.evaluate(()=>accountDocs['users/guest'].state.currency===S.currency));
 await p.screenshot({path:'docs/qa-incursions/account-390.jpg'});
 // A failed reauthentication cannot touch either saved document.
 await p.locator('[data-account="delete-offer"]').click();assert(await p.locator('[data-account="delete"]').isDisabled());
 await p.locator('#account-delete-check').check();await p.evaluate(()=>{accountFailure='reauth';accountCalls=[];});await p.locator('[data-account="delete"]').click();await p.waitForFunction(()=>!accountBusy);
 assert.deepEqual(await p.evaluate(()=>accountCalls),['reauth:guest']);assert.equal(await p.evaluate(()=>accountPending()),null);
 // A rules failure is atomic and retryable; no account deletion or false success.
 await p.locator('[data-account="delete-offer"]').click();await p.locator('#account-delete-check').check();await p.evaluate(()=>{accountFailure='transaction';accountCalls=[];});
 const saved=await p.evaluate(()=>JSON.stringify(accountDocs));await p.locator('[data-account="delete"]').click();await p.waitForFunction(()=>!accountBusy);
 assert.equal(await p.evaluate(()=>JSON.stringify(accountDocs)),saved);assert(!(await p.evaluate(()=>accountCalls)).some(x=>x.startsWith('delete:')));assert(await p.locator('[data-account="delete-retry"]').isVisible());assert.equal(await p.evaluate(()=>cloud.canWrite),false);
 // Auth deletion can fail after the game data was erased; a retry never resurrects progress.
 await p.evaluate(()=>{accountFailure='auth-delete';});await p.locator('[data-account="delete-retry"]').click();await p.waitForFunction(()=>!accountBusy);
 assert.deepEqual(await p.evaluate(()=>accountDocs['users/guest'].state),{accountDeleted:true});assert.equal(await p.evaluate(()=>accountDocs['scouts/guest']),undefined);assert.equal(await p.evaluate(()=>accountPending()),'guest');
 await p.evaluate(()=>{accountFailure='';});await p.locator('[data-account="delete-retry"]').click();await p.waitForFunction(()=>!accountBusy);
 assert.equal(await p.evaluate(()=>FB.auth.currentUser),null);assert.equal(await p.evaluate(()=>S.pulls),0);assert.equal(await p.evaluate(()=>accountPending()),null);assert((await p.locator('#account-status').innerText()).includes('削除しました'),JSON.stringify(await p.evaluate(()=>({last:accountLastError,status:accountStatus}))));
 // Logout persists before clearing the local account and never clears on save failure.
 await initializeMock();await p.evaluate(()=>{S.role='agent';S.currency=123;FB.auth.currentUser.isAnonymous=false;openAccount();accountFailure='transaction';});
 await p.locator('[data-account="logout-offer"]').click();await p.locator('[data-account="logout"]').click();await p.waitForFunction(()=>!accountBusy);assert.equal(await p.evaluate(()=>S.currency),123);assert(await p.evaluate(()=>!!FB.auth.currentUser));
 await p.evaluate(()=>{accountFailure='';});await p.locator('[data-account="logout-offer"]').click();await p.locator('[data-account="logout"]').click();await p.waitForFunction(()=>!accountBusy);
 assert.equal(await p.evaluate(()=>accountDocs['users/guest'].state.currency),123);assert.equal(await p.evaluate(()=>S.currency),30);assert.equal(await p.evaluate(()=>FB.auth.currentUser),null);
 // A returning Google account loads its existing game rather than uploading the guest's progress.
 await p.evaluate(()=>{S.currency=999;accountDocs['users/google']={state:{...fresh(),role:'agent',currency:456},revision:8};openAccount();});
 await p.evaluate(()=>{accountFailure='read';});await p.locator('[data-account="login"]').click();await p.waitForFunction(()=>!accountBusy);assert.equal(await p.evaluate(()=>S.currency),999);assert.equal(await p.evaluate(()=>accountDocs['users/google'].state.currency),456);await p.evaluate(()=>{accountFailure='';});await p.locator('[data-account="sync"]').click();await p.waitForFunction(()=>!accountBusy);assert.equal(await p.evaluate(()=>S.currency),456);assert.equal(await p.evaluate(()=>accountDocs['users/google'].state.currency),456);
 // Catalog: locked names/assets absent; browsing and transitions preserve wallet and discoveries.
 await p.evaluate(()=>{cloud=null;FB=null;S.role='agent';S.lastTick=Date.now()+600000;S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,discovered:{},history:[]};applyMode();openEncyclopedia();});
 assert.equal(await p.locator('.catalog-entry:enabled').count(),0);assert(!(await p.locator('.catalog').innerText()).includes('影だけの来園者'));assert.equal(await p.locator('.catalog img').count(),0);
 assert(!(await p.locator('.catalog-summary').innerText()).includes('/'),'catalog must not show total capacity');
 const search=p.getByRole('searchbox',{name:'取得済みの記録を検索'});
 await search.fill('影だけの来園者');assert.equal(await p.locator('.catalog-entry').count(),0,'search cannot reveal an unacquired record');assert(await p.locator('[data-catalog-no-results]').isVisible());await p.getByRole('button',{name:'検索をクリア'}).click();assert(await p.locator('[data-catalog-empty]').isVisible());
 await p.evaluate(()=>{S.observation.collection={'cctv:0':1,'cctv:2':1};S.observation.contacts={records:true};S.incursion.discovered={0:true};save();openEncyclopedia();});
 const state=await p.evaluate(()=>JSON.stringify({currency:S.currency,collection:S.observation.collection,discovered:S.incursion.discovered}));
 await search.fill('来園者');assert.equal(await p.locator('.catalog-entry:visible').count(),1);assert(await p.locator('[data-catalog-entry="cctv:2"]').isVisible());assert.equal(await search.evaluate(e=>document.activeElement===e),true,'typing keeps focus in the search box');assert.equal(await p.locator('[data-catalog-status]').innerText(),'1件が一致');
 await search.fill('封筒調査');assert(await p.locator('[data-catalog-entry="inc:0"]').isVisible());assert.equal(await p.locator('.catalog-entry:visible').count(),1,'source labels are searchable');
 await search.fill(' ＳＲ ');assert(await p.locator('[data-catalog-entry="cctv:2"]').isVisible(),'width and case variants match');
 await search.fill('砂場の整列');assert.equal(await p.locator('.catalog-entry:visible').count(),0);assert.equal(await p.locator('.catalog-entry').count(),2);assert(!(await p.locator('.catalog').innerText()).includes('砂場の整列'));assert(await p.locator('[data-catalog-no-results]').isVisible());
 await search.fill('<img src=x onerror=alert(1)>');assert.equal(await p.locator('.catalog img').count(),0,'search text is never rendered as markup');await p.keyboard.press('Escape');assert.equal(await search.inputValue(),'','Escape clears the search before leaving the catalog');assert.equal(await search.evaluate(e=>document.activeElement===e),true);assert.equal(await p.locator('.catalog-entry:visible').count(),2);
 await search.evaluate(e=>{e.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));e.value='来園者';e.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));});assert.equal(await p.locator('.catalog-entry:visible').count(),2,'Japanese conversion does not filter an unfinished composition');await search.dispatchEvent('compositionend');assert.equal(await p.locator('.catalog-entry:visible').count(),1);await p.getByRole('button',{name:'検索をクリア'}).click();
 assert.equal(await p.locator('.catalog-entry:enabled').count(),2);await search.fill('来園者');await p.locator('[data-catalog-entry="cctv:2"]').click();assert((await p.locator('.watch-record-caption').innerText()).includes('影だけの来園者'));assert((await p.locator('.catalog-history').innerText()).includes('回収済み 1回'));await p.keyboard.press('Escape');assert.equal(await search.inputValue(),'来園者','closing a detail preserves the search');assert.equal(await p.locator('.catalog-entry:visible').count(),1);await p.getByRole('button',{name:'検索をクリア'}).click();
 await p.locator('[data-catalog-entry="inc:0"]').click();assert(await p.locator('#incursion-dialog').isVisible());await p.locator('[data-inc="close"]').click();
 await search.fill('来園者');await p.locator('[data-catalog-tab="people"]').click();assert.equal(await search.inputValue(),'','a new category starts with its acquired records visible');assert.equal(await p.locator('.catalog-entry:enabled').count(),1);await p.locator('[data-catalog-entry="records"]').click();assert(await p.locator('.watch-speaker img').isVisible());await p.keyboard.press('Escape');
 await p.locator('[data-catalog-tab="places"]').click();assert.equal(await p.locator('.catalog-entry:enabled').count(),1);await p.locator('[data-catalog-entry="cctv"]').click();assert.equal(await p.locator('[data-catalog-record]:enabled').count(),2);
 assert.equal(await p.locator('[data-catalog-record]').count(),2,'unacquired rarity buttons must not exist');
 assert(!(await p.locator('#sheet').innerText()).includes('未観測'),'no rarity capacity leaks inside an acquired place');assert(!(await p.locator('#sheet').innerText()).includes('砂場の整列'));await p.keyboard.press('Escape');
 assert.equal(await p.evaluate(()=>JSON.stringify({currency:S.currency,collection:S.observation.collection,discovered:S.incursion.discovered})),state);
 await p.locator('#toast').waitFor({state:'hidden'});
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});
  for(const tab of ['anomalies','people','places']){
   await p.locator(`[data-catalog-tab="${tab}"]`).click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await search.fill('一致しない検索語');const searchLayout=await p.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.catalog *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right}))}));assert(searchLayout.document<=searchLayout.width,'search and clear controls fit narrow screens: '+JSON.stringify(searchLayout));assert(await search.evaluate(e=>e.getBoundingClientRect().height>=44));await p.getByRole('button',{name:'検索をクリア'}).click();
   assert(await p.locator('.catalog-entry:enabled').first().evaluate(e=>e.getBoundingClientRect().height>=44));
   if(width===390)await p.screenshot({path:`docs/qa-incursions/catalog-${tab}-390.jpg`});
  }
 }
 // Classified category is not even rendered before evidence; acquired-only witnesses unlock it.
 await p.evaluate(()=>{S.levels.u1=3;S.legendLayers={};go('home');openEncyclopedia('anomalies');});
 assert.equal(await p.locator('[data-catalog-tab="confidential"]').count(),0);
 await p.evaluate(()=>{openEncyclopedia('people');});
 assert.equal(await p.locator('[data-catalog-entry="ghost:registry"]').count(),0);
 await p.evaluate(()=>{S.legendLayers.noticed={u1:true};S.legendLayers.compared={u1:true};openEncyclopedia('anomalies');});
 assert.equal(await p.locator('[data-catalog-tab="confidential"]').count(),1);
 await p.evaluate(()=>openEncyclopedia('people'));
 assert.equal(await p.locator('[data-catalog-entry="ghost:registry"]').count(),1);
 await p.locator('[data-catalog-entry="ghost:registry"]').click();
 assert(await p.locator('.witness-dossier').count());assert(await p.locator('.forecast-archive').count());assert((await p.locator('.witness-photo').getAttribute('aria-label')).includes('肖像写真'));
 await p.evaluate(()=>openEncyclopedia('anomalies'));
 await p.locator('[data-catalog-tab="confidential"]').click();
 assert.equal(await p.locator('.catalog-entry:enabled').count(),1);
 assert(!(await p.locator('.catalog-list').innerText()).includes('u2'));
 await p.locator('.catalog-entry:enabled').click();
 assert(await p.locator('.forecast-archive').count());
 await p.evaluate(()=>{S.levels.u1=0;openEncyclopedia('confidential');});
 assert.equal(await p.locator('[data-catalog-tab="confidential"]').count(),0);
 await p.evaluate(()=>{go('home');setHomeTab('desk');S.observation.upgrades.retention=1;S.currency=200;render();});
 const pending=await p.evaluate(()=>JSON.stringify(S.observation.pending));await p.locator('#obs-equipment').click();assert(await p.locator('.watch-upgrades').evaluate(e=>e.open));await p.locator('[data-watch-upgrade="sensitivity"]').click();await p.locator('.watch-lab [data-watch="return"]').click();assert.equal(await p.evaluate(()=>JSON.stringify(S.observation.pending)),pending);
 assert.deepEqual(errors,[]);console.log('Login/cancel/return, save-before-logout, reauth/atomic deletion failure/retry, acquired-only catalog search + Japanese composition, links, responsive UI and observation/lab return passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
