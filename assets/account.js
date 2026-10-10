/* Account operations freeze writers before changing identity. No provider credentials are stored here. */
let accountBusy=false,accountDeleting=false,accountStatus='接続を確認しています',accountReady=false;
function accountUser(){return FB?.auth.currentUser||null;}
function accountPending(){try{return localStorage.getItem(KEY+'_account_deletion');}catch{return null;}}
function accountLock(busy){
 accountBusy=busy;
 document.querySelectorAll('main,nav,.lite-footer').forEach(e=>e.inert=busy);
 document.querySelectorAll('[data-account]').forEach(e=>e.disabled=busy);
}
function accountMessage(text){accountStatus=text;const e=document.getElementById('account-status');if(e)e.textContent=text;}
function openAccount(){
 const u=accountUser(),linked=u&&!u.isAnonymous,pending=!!accountPending();
 openMenuPage('アカウント',menuBack()+`<section class="account-card"><small>第六文書課 ／ 記録の保管先</small><h2>${linked?'Googleでログイン中':'ゲストでプレイ中'}</h2>${linked?'<p id="account-identity"></p>':'<p>登録なしでも遊べます。Googleでログインすると、別の端末でも同じ記録を引き継げます。</p>'}<p id="account-status" role="status" aria-live="polite"></p>${pending?'<p>削除処理が途中です。完了までアカウントへの保存を停止しています。</p><button class="btn-paper" data-account="delete-retry">削除を再開する</button>':linked?'<button class="btn-paper" data-account="sync">今すぐ保存する</button><button class="btn-line" data-account="logout-offer">ログアウト</button>':`<button class="btn-paper" data-account="login" ${!accountReady?'disabled':''}>Googleでログイン・新規登録</button>${!accountReady?'<button class="btn-line" data-account="connect">接続を再試行</button>':''}`}<button class="btn-line" data-account="export">この端末の記録を保存する</button></section>${u&&!pending?'<section class="account-danger"><h2>アカウントの削除</h2><p>ゲームの進行とログイン情報を削除します。Googleアカウント自体は削除されません。</p><button class="btn-line" data-account="delete-offer">削除について確認する</button></section>':''}`);
 if(linked)document.getElementById('account-identity').textContent=u.email||u.displayName||'Googleアカウント';
 accountMessage(accountStatus);
}
function accountExport(){
 const url=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='shinso-records.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function accountDrain(){while(flushing)await new Promise(r=>setTimeout(r,40));}
function accountDetach(){clearTimeout(flushT);again=false;if(cloud)cloud.canWrite=false;}
function accountClearLocal(){
 for(const k of [KEY,KEY+'_conflict_backup',KEY+'_account_deletion'])localStorage.removeItem(k);
 S=fresh();shownPt=Math.floor(S.currency);watchPaint='';watchMessage='';watchMessageUntil=0;crowd=null;lastScout='';
 ensureMissions();save();applyMode();render();
}
async function accountLogin(){
 if(!FB||accountBusy||accountPending())return;
 accountLock(true);accountMessage('Googleの認証画面を開いています');
 const {auth,Au}=FB,provider=new Au.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
 if(!accountUnsubscribe&&Au.onAuthStateChanged)accountObserveAuth(auth,Au);
 const previous=cloud,previousCanWrite=cloud?.canWrite,guest=auth.currentUser?.isAnonymous;
 accountDetach();
 try{
  // Open synchronously from the gesture; do not put network awaits before the popup.
  const popup=guest?Au.linkWithPopup(auth.currentUser,provider):Au.signInWithPopup(auth,provider);
  await popup;await accountDrain();bindCloud(auth.currentUser);await pullRemote(!guest);
  if(accountDeleting)throw {code:'account-deleted'};
  localStorage.removeItem(KEY+'_signed_out');markDirty();await flush();accountMessage('ログインしました。'+(cloud?.lastError?'同期を再試行してください。':'記録をアカウントに保存しました。'));
 }catch(e){
  if(e?.code==='auth/credential-already-in-use'){
   const credential=Au.GoogleAuthProvider.credentialFromError(e);
   if(credential&&confirm('このGoogleアカウントの記録へ切り替えますか？ この端末の進行は退避します。')){
    try{localStorage.setItem(KEY+'_conflict_backup',JSON.stringify(S));await accountDrain();await Au.signInWithCredential(auth,credential);bindCloud(auth.currentUser);await pullRemote(true);if(accountDeleting)throw {code:'account-deleted'};localStorage.removeItem(KEY+'_signed_out');markDirty();await flush();accountMessage('アカウントの記録を読み込みました');}
    catch(err){accountMessage(accountError(err));}
   }else{cloud=previous;if(cloud)cloud.canWrite=previousCanWrite;accountMessage('ログインをキャンセルしました');}
  }else{if(auth.currentUser?.uid===previous?.uid&&!accountDeleting){cloud=previous;cloud.canWrite=previousCanWrite;}accountMessage(accountError(e));}
 }finally{accountLock(false);openAccount();}
}
function accountError(e){
 if(['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(e?.code))return '操作をキャンセルしました。';
 if(e?.code==='auth/popup-blocked')return '認証画面が開けませんでした。このサイトのポップアップを許可して再試行してください。';
 if(e?.code==='auth/requires-recent-login')return '本人確認が必要です。削除の再開から、もう一度Googleで認証してください。';
 if(e?.code==='account-deleted')return '削除中のアカウントです。削除を再開してください。';
 if(e?.code==='permission-denied')return 'サーバーの権限設定により完了できませんでした。削除済みとは扱っていません。';
 return '通信または認証に失敗しました。接続を確認して再試行してください。';
}
async function accountSync(){
 if(accountBusy||!cloud||accountDeleting)return;
 accountLock(true);accountMessage('保存しています');
 try{await accountDrain();if(!cloud.canWrite){await pullRemote();if(!cloud.canWrite)return;}await flush();accountMessage(cloud.lastError?'保存できませんでした。この端末の進行は残っています。':'アカウントに保存しました。');}
 catch(e){accountMessage(accountError(e));}finally{accountLock(false);}
}
async function accountLogout(){
 if(accountBusy||!FB||accountDeleting)return;
 accountLock(true);accountMessage('記録を保存してログアウトしています');
 try{
  await accountDrain();if(!cloud?.canWrite)throw {code:'save-conflict'};
  await flush();if(cloud.lastError)throw cloud.lastError;
  accountDetach();await accountDrain();await FB.Au.signOut(FB.auth);cloud=null;
  localStorage.setItem(KEY+'_signed_out','1');accountClearLocal();hideSheet();accountMessage('ログアウトしました。この端末の記録を消去しました。ログインすると保存済みの続きから遊べます。');
 }catch(e){if(cloud&&!accountDeleting)cloud.canWrite=true;accountMessage('保存・ログアウトを完了できませんでした。記録を保持しています。同期状態を確認して再試行してください。');hideSheet();}
 finally{accountLock(false);openAccount();}
}
function accountDeleteOffer(){
 sheet('アカウントの削除',`<h2>このゲームのアカウントを削除しますか？</h2><p>クラウドの進行・図鑑・集計情報、ログイン情報、この端末の記録と退避データを削除します。取り消せません。</p><p>別端末から記録が戻らないよう、識別用IDに対応する削除済みの印だけを残します。Googleアカウント自体は削除しません。</p><label class="account-confirm"><input id="account-delete-check" type="checkbox"> 削除する内容を確認しました</label><button class="btn-paper" data-account="delete" disabled>本人確認して削除する</button><button class="btn-line" data-act="close">戻る</button>`);
}
async function accountDelete(){
 const user=accountUser();if(!user||accountBusy)return;
 accountLock(true);accountMessage('本人確認と削除を進めています');
 try{
  if(!user.isAnonymous)await FB.Au.reauthenticateWithPopup(user,new FB.Au.GoogleAuthProvider());
  accountDetach();await accountDrain();accountDeleting=true;
  localStorage.setItem(KEY+'_account_deletion',user.uid);
  // The transaction is atomic: a permission/network error cannot delete just one game document.
  await CloudSave.erase(cloud.transaction,cloud.saveRef,cloud.scoutRef);
  await FB.Au.deleteUser(user);
  cloud=null;accountDeleting=false;localStorage.setItem(KEY+'_signed_out','1');accountClearLocal();hideSheet();accountMessage('アカウントとゲームの記録を削除しました。');
 }catch(e){
  // A lost response may mean deletion committed. Never resume writes until an explicit retry succeeds.
  hideSheet();accountMessage(accountError(e));
 }finally{accountLock(false);openAccount();}
}
document.addEventListener('change',e=>{if(e.target.id==='account-delete-check')document.querySelector('[data-account="delete"]').disabled=!e.target.checked;});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-account]');if(!b||b.disabled||accountBusy)return;
 const actions={login:accountLogin,connect:async()=>{accountMessage('接続しています');await initCloud();openAccount();},sync:accountSync,export:accountExport,'logout-offer':()=>sheet('ログアウト',`<h2>記録を保存してログアウト</h2><p>保存が成功した後、この端末の進行と退避データを消去します。続きは同じGoogleアカウントでログインしてください。</p><button class="btn-paper" data-account="logout">保存してログアウト</button><button class="btn-line" data-act="close">戻る</button>`),logout:accountLogout,'delete-offer':accountDeleteOffer,delete:accountDelete,'delete-retry':accountDelete};
 actions[b.dataset.account]?.();
});
window.addEventListener('storage',e=>{
 if(e.key===KEY+'_account_deletion'&&e.newValue===accountUser()?.uid){accountDeleting=true;accountDetach();accountMessage('別のタブで削除中です。保存を停止しています。');openAccount();}
});
let accountUnsubscribe=null;
function accountObserveAuth(auth,Au){
 accountUnsubscribe?.();let first=true;
 accountUnsubscribe=Au.onAuthStateChanged(auth,async user=>{
  if(first){first=false;return;}if(accountBusy||user?.uid===cloud?.uid)return;
  accountDetach();await accountDrain();cloud=null;
  if(accountBusy)return;
  accountDeleting=false;accountClearLocal();
  if(user){try{bindCloud(user);await pullRemote(true);accountMessage('アカウントを切り替えました。');}catch(e){accountMessage(accountError(e));}}
  else{localStorage.setItem(KEY+'_signed_out','1');accountMessage('ログアウトしました。');}
  openAccount();
 });
}
