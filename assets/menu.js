/* Operator notices are release-managed; personal game mail is saved with the player. */
const GAME_NOTICES=[
 {id:'rumor-patrol-1',date:'2026.10.10',title:'観測先を巡り、噂を追う',body:'4地点を最初から巡回できるようになりました。同じ地点を続けず、追跡中の噂と未観測の記録を優先します。平常が続いたときも課内から照合の手がかりが届きます。育成は小刻みな段階に変更。以前の育成効果を引き継ぎ、観測先の解放費は一度だけ返還します。'},
 {id:'seepage-growth-1',date:'2026.10.10',title:'異常感度の育成と、画面外への干渉',body:'観測の異変率は初期5%。調査室の異常感度を育てると0.5ポイントずつ、最大12%まで上がります。異変の一部は画面の縁や課員にも干渉します。回線を切る、課内で少し休むと収まります。設定の「揺れ・画面演出を抑える」で追加演出を停止できます。記録とptは失われません。'},
 {id:'anomaly-pressure-1',date:'2026.10.09',title:'異変の対処と休息を追加しました',body:'異変は映像内の違和感がある付近を繰り返しタップして対処します。通常巡回では除去できません。観測や真相追求を続けると干渉が広がります。手を止める、モニタを閉じる、課内で話すことで落ち着きます。不在中の悪化や資料・ptの喪失はありません。観測ボタンは廃止し、映像へ直接触れる方式です。観測設定は装備の育成後に表示されます。自動対処と広告回復は未開放です。'},
 {id:'observation-patrol-1',date:'2026.10.09',title:'観測手順と操作配置を更新しました',body:'映像を繰り返しタップすると次の地点へ進み、平常時も記録報酬を受け取れます。映像に干渉がある場合は追加操作で抑えてください。自動巡回・鎮静は解放条件の調整中につき非表示・停止しています。購入済みの育成データは保持されます。設定やメニューは下部へ移動し、真相印は本文と重ならない位置に調整しました。'},
 {id:'observation-research-1',date:'2026.10.09',title:'重複記録を照合できるようになりました',body:'「ファイル → 観測」で同じ地点の重複48件を照合すると、未発見の記録を1件復元できます。発見済みの画像や記録件数は残ります。全4種を揃えた達成報酬や、発見済み画像の比較も利用できます。'},
 {id:'observation-2',date:'2026.10.09',title:'観測と記録を更新しました',body:'観測映像を大きく表示し、1つの装備で記録を待つ仕組みに更新しました。記録は3時間保持され、調査室で最大24時間まで延長できます。発見した映像は「ファイル → 観測」から見返せます。'},
 {id:'menu-1',date:'2026.10.09',title:'お知らせ・受信ボックスを追加しました',body:'運営からの更新情報はこのお知らせに掲載します。ゲーム内メールと添付報酬は受信ボックスへ届きます。新着はメニューの小さな印で確認できます。'}
];
const GAME_MAIL=[
 {id:'welcome-1',from:'第六文書課・総務',title:'観測装備の支給について',body:'観測担当者へ。装備の調整費を支給します。記録の中に、設置時にはなかったものが含まれていても、装置を直接確認しないでください。',reward:50,when:()=>!isLite()},
 {id:'records-5',from:'記録保管係',title:'受領数が一致しません',body:'あなたから届いた5件の観測記録を受領しました。保管棚には6件あります。追加分の撮影者欄には、あなたの名前が記入されています。',reward:0,when:()=>!isLite()&&(S.observation?.collected||0)>=5},
 {id:'rare-first',from:'解析班',title:'映像の外側',body:'希少記録の照合が完了しました。被写体はこちらを見ていません。カメラの後ろにいた何かを見ています。次の記録は、周辺も確認してください。',reward:0,when:()=>!isLite()&&Object.entries(S.observation?.collection||{}).some(([k,n])=>n>0&&/:[23]$/.test(k))}
];
// An imported or stale save may contain a report without an acquired case.
// Only actually owned evidence and the correct medium may reveal its mail.
function earnedForecastMail(id){
 const report=ForecastFollowup.inspect(S.forecastFollowups,id);
 return LegendModel.count(S.levels,id)===3&&report?.status==='compared'&&
  report.mode===LegendModel.CASES[id]?.mode;
}
// The notice appears only after the player both requested and later witnessed a record.
for(const id of LegendModel.ids)GAME_MAIL.push({
 id:'forecast-'+id,from:'第六文書課・事後照合係',title:'翌日報告の訂正欄',caseId:id,
 body:'翌日付けの調査報告と後日回収した観測記録の照合が終わりました。報告書の結論は、訂正されていません。',
 reward:0,when:()=>!isLite()&&earnedForecastMail(id)
});
// A second message requires a genuine re-observation of a compared, acquired
// forecast. It never awards points or reveals any other unrecovered case.
function earnedWitnessRecheckId(){
 return WitnessRegistry.firstEarnedRecheck(witnessRegistryRecords());
}
GAME_MAIL.push({id:'witness-recheck-followup',from:'第六文書課・人事登録室',
 title:'訂正されない再観測記録',witnessRecheck:true,
 body:'同じ事件の後続記録に、初回の受領印とは異なる情報が残りました。登録のない立会人の人事台帳で、回収した原本だけを照合してください。',
 reward:0,when:()=>!isLite()&&!!earnedWitnessRecheckId()
});
// One in-world personnel message, available only after a real acquired contradiction.
GAME_MAIL.push({id:'unregistered-personnel',from:'第六文書課・人事登録室',title:'在籍照会の結果',
 body:'調査記録の立会欄に署名があります。人事台帳では、対応する職員を確認できません。原本をそのまま保管してください。',
 reward:0,witnessRegistry:true,when:()=>!isLite()&&LegendModel.ids.some(id=>LegendModel.count(S.levels,id)===3&&legendLayerStatus(id)?.compared)
});
// Another notification comes only after at least two genuinely compared cases
// and the clearance needed to read conflicting versions of the same personnel file.
GAME_MAIL.push({id:'personnel-ledger-versions',from:'第六文書課・人事登録室',
 title:'人事台帳の版が一致しません',
 body:'同じ立会者に二種類の人員区分が割り当てられています。どちらも有効な台帳です。原本の順序は訂正しないでください。',
 reward:0,witnessRegistry:true,
 when:()=>!isLite()&&rankIdx()>=10&&LegendModel.ids.filter(id=>
  LegendModel.count(S.levels,id)===3&&legendLayerStatus(id)?.compared).length>=2
});
// A personnel file produces one quietly delivered notice only after explicit comparison.
for(const c of PersonnelDiscrepancies.CASES)GAME_MAIL.push({
 id:'personnel-'+c.id,from:'第六文書課・人事台帳',title:'照合対象の登録について',personnelCaseId:c.id,
 body:'照合された「'+c.title+'」について、記録者の氏名欄が空白です。追加の署名はしないでください。',
 reward:0,when:()=>!isLite()&&S.personnelEvidence?.confirmed?.[c.id]===true
});
// Case-specific anonymous mail is delivered once through the existing saved inbox.
for(const id of LegendModel.ids)GAME_MAIL.push({
 id:'uncanny-'+id,from:'差出人不明',title:'空欄の差出人',
 body:'資料に残された余白を調べてください。受領印の筆跡は、あなたの記録に似ています。',
 reward:0,when:()=>!isLite()&&!!UncannyArchive.events(id,LegendModel.count(S.levels,id),LegendLayers.status(LegendLayers.normalize(S.legendLayers,S.levels,LegendModel.CASES),id,S.levels,LegendModel.CASES,observationState().collection,S.incursion?.discovered,incursionProfile,LegendModel.state(S.legends,S.levels).testified),Object.hasOwn(LegendModel.state(S.legends,S.levels).conclusions,id))?.letter
});
// The sender becomes unregistered once all three colleagues deny the post exists.
GAME_MAIL.push({id:SUPERIOR_MAIL,title:'再照合の件',reward:0,
 get from(){return investigationSuperiorDenied(observationState().investigation)?'差出人：該当する職員なし':'第六文書課 課長';},
 get body(){return '再照合の結果は受け取りました。課員にはもう伝えなくて結構です。あなたの報告は、私が直接読みます。'+(investigationSuperiorDenied(observationState().investigation)?'<br><br>送信記録：この連絡は、あなたの端末から送信されています。':'');},
 when:()=>!isLite()&&investigationSuperiorEarned(observationState().investigation)
});
function menuState(){
 if(!S.communications||typeof S.communications!=='object')S.communications={};
 const c=S.communications;if(!Array.isArray(c.readNotices))c.readNotices=[];
 if(!c.mail||typeof c.mail!=='object')c.mail={};return c;
}
// Every current release notice describes agent-only observation or inbox features.
// Do not present them as unread tasks before the player joins the department.
// A future civilian notice must opt in explicitly with audience:'civilian'.
function visibleGameNotices(){return isLite()?GAME_NOTICES.filter(n=>n.audience==='civilian'):GAME_NOTICES;}
// Current mail is agent-only; future civilian mail must opt in explicitly.
function visibleGameMail(){return isLite()?GAME_MAIL.filter(m=>m.audience==='civilian'):GAME_MAIL;}
function renderMenuBadge(){
 const c=menuState();let delivered=false;
 for(const m of GAME_MAIL)if(!c.mail[m.id]&&m.when()){c.mail[m.id]={receivedAt:Date.now(),read:false,claimed:false};delivered=true;}
 if(delivered)markDirty();
 const news=visibleGameNotices().filter(n=>!c.readNotices.includes(n.id)).length;
 const mail=visibleGameMail().filter(m=>c.mail[m.id]&&(!c.mail[m.id].read||(m.reward&&!c.mail[m.id].claimed))).length;
 // Keep notices in the optional menu without distracting from the first letters.
 const quietIntro=!!introActive();
 document.getElementById('menu-dot').hidden=quietIntro||!(news+mail);
 const pending=[];
 if(news)pending.push(`お知らせ未読${news}件`);
 if(mail)pending.push(`受信ボックスの未読または未受取${mail}件`);
 document.getElementById('game-menu').setAttribute('aria-label',quietIntro?'メニュー':`メニュー${pending.length?'、'+pending.join('、'):''}`);
 return {news,mail};
}
let menuReturn=null,menuPageBack='return';
let menuFocusOrigins={};
function openMenuPage(title,html){
 const current=document.querySelector('.view:not([hidden])');
 const opener=document.activeElement;
 if(current?.dataset.view!=='menu')menuFocusOrigins={};
 const origin=current?.dataset.view==='menu'&&!opener?.classList.contains('menu-back')?
  ['data-menu','data-notice','data-mail'].find(attr=>opener?.hasAttribute(attr)):null;
 const originSelector=origin?`[${origin}="${CSS.escape(opener.getAttribute(origin))}"]`:null;
 if(current?.dataset.view!=='menu')menuReturn={view:current?.dataset.view||'home',scroll:scrollY,home:homeTab,tab:current?.querySelector('[data-stab][aria-pressed="true"]')?.dataset.stab,focus:document.activeElement};
 hideSheet();go('menu');
 const content=document.getElementById('menu-page-content'),heading=document.querySelector('.menu-page-heading');
 content.innerHTML=html;const back=content.querySelector('.menu-back');
 heading.replaceChildren();const backButton=back||Object.assign(document.createElement('button'),{className:'menu-back',textContent:'‹ ゲームへ戻る'});
 if(!back)backButton.dataset.menu='return';menuPageBack=backButton.dataset.menu;heading.append(backButton);
 if(originSelector&&menuPageBack!=='return')menuFocusOrigins[menuPageBack]=originSelector;
 const h=document.createElement('h1');h.textContent=title;h.tabIndex=-1;heading.append(h);h.focus({preventScroll:true});
}
function returnToMenuPage(action,open){
 const selector=menuFocusOrigins[action];
 open();
 const target=selector&&document.getElementById('menu-page-content').querySelector(selector);
 if(target&&!target.disabled)target.focus();
}
function returnFromMenu(){
 const r=menuReturn||{view:'home',scroll:0};go(r.view);if(r.view==='home')setHomeTab(r.home||'desk');if(r.tab)setSectionTab(r.tab);scrollTo(0,r.scroll);menuReturn=null;
 if(r.focus?.isConnected&&!r.focus.disabled)r.focus.focus({preventScroll:true});
}
function openGameMenu(){
 const n=renderMenuBadge();
 const showInbox=!isLite()||visibleGameMail().some(m=>menuState().mail[m.id]);
 openMenuPage('メニュー',`<div class="game-menu-list">${!isLite()?'<button data-trail="guide"><span>調査の進め方</span><small>›</small></button>':''}${introActive()?'<button data-intro="skip"><span>導入を飛ばす</span><small>›</small></button>':''}${!isLite()?`<button data-menu="news" aria-label="運営からのお知らせ${n.news?'、未読'+n.news+'件':''}"><span>運営からのお知らせ</span><small aria-hidden="true">${n.news?'未読 '+n.news+'件':'›'}</small></button>`:''}${showInbox?`<button data-menu="inbox" aria-label="受信ボックス${n.mail?'、未読または未受取'+n.mail+'件':''}"><span>受信ボックス</span><small aria-hidden="true">${n.mail?'要確認 '+n.mail+'件':'›'}</small></button>`:''}<button data-menu="catalog"><span>図鑑・収集記録</span><small>›</small></button>${!isLite()?'<button data-menu="investigations"><span>都市伝説の調査</span><small>›</small></button>':''}<button data-menu="account"><span>ログイン・アカウント</span><small>›</small></button><button data-menu="settings"><span>設定</span><small>›</small></button></div>`);
}
function menuBack(target='home'){return `<button class="menu-back" data-menu="${target}">‹ ${target==='home'?'メニュー':target==='news'?'お知らせ一覧':'受信ボックス'}</button>`;}
function openGameNews(message=''){
 const c=menuState(),notices=visibleGameNotices(),unread=notices.filter(n=>!c.readNotices.includes(n.id));
 const status=message?`<p class="menu-news-status" role="status">${message}</p>`:'';
 const action=unread.length?`<button class="menu-news-read-all" data-notices-read-all>未読${unread.length}件を既読にする</button>`:'';
 openMenuPage('運営からのお知らせ',menuBack()+(status||action?`<div class="menu-news-toolbar">${status}${action}</div>`:'')+`<div class="game-message-list">${notices.map(n=>`<button data-notice="${n.id}"><small>${n.date}${c.readNotices.includes(n.id)?'':' · 未読'}</small><b>${n.title}</b></button>`).join('')}</div>`);
}
function mailReceivedTime(entry){
 const raw=entry?.receivedAt,time=typeof raw==='number'||typeof raw==='string'?Number(raw):0;
 return time>0&&Number.isFinite(new Date(time).getTime())?time:0;
}
function openGameInbox(){
 const c=menuState();
 // Keep the existing definition order for same-batch deliveries and old undated mail.
 const mail=visibleGameMail().filter(m=>c.mail[m.id]).reverse().sort((a,b)=>mailReceivedTime(c.mail[b.id])-mailReceivedTime(c.mail[a.id]));
 openMenuPage('受信ボックス',menuBack()+`<p class="menu-muted">ゲーム内メール</p><div class="game-message-list">${mail.map(m=>`<button data-mail="${m.id}"><small>${m.from}${!c.mail[m.id].read?' · 未読':''}${m.reward&&!c.mail[m.id].claimed?' · 添付あり':''}</small><b>${m.title}</b></button>`).join('')||'<p class="menu-empty">届いたメールはありません。</p>'}</div>`);
}
function openGameMail(id){
 const m=visibleGameMail().find(m=>m.id===id),c=menuState();if(!m||!c.mail[id])return;
 c.mail[id].read=true;markDirty();renderMenuBadge();
 const receivedAt=mailReceivedTime(c.mail[id]),d=receivedAt?new Date(receivedAt).toLocaleDateString('ja-JP'):'受信日時不明';
 // A saved letter alone is not proof that its classified dossier is still
 // available. Project the destination from confirmed, rank-gated evidence.
 const personnel=m.personnelCaseId?PersonnelDiscrepancies.detail(S.personnelEvidence,rankIdx(),m.personnelCaseId):null;
 const forecastLink=m.caseId&&earnedForecastMail(m.caseId);
 const recheckLink=m.witnessRecheck?earnedWitnessRecheckId():null;
 const personnelLink=personnel?.confirmed?'<button class="btn-line" data-personnel-open="'+escapeHTML(personnel.id)+'">確定済みの人事照合原本を読む</button>':'';
 openMenuPage('受信メール',menuBack('inbox')+`<article class="game-message"><small>${m.from} · ${d}</small><h2>${m.title}</h2><p>${m.body}</p>${forecastLink?`<button class="btn-line" data-legend="case" data-id="${m.caseId}">調査報告書を確認する</button>`:``}${m.witnessRegistry?`<button class="btn-line" data-witness-registry>立会人の人物記録を確認する</button>`:``}${recheckLink?`<button class="btn-line" data-witness-case="${escapeHTML(recheckLink)}">再観測の立会記録を照合する</button>`:``}${personnelLink}${m.reward?`<button class="btn-paper" data-mail-claim="${id}" ${c.mail[id].claimed?'disabled':''}>${c.mail[id].claimed?'受取済み':m.reward+'pt を受け取る'}</button>`:''}</article>`);
}
function openMenuSettings(){
 openMenuPage('設定',menuBack()+`<div class="game-message"><p id="menu-sync"></p><label class="watch-quiet-setting"><input type="checkbox" data-watch-quiet ${observationState().quiet?'checked':''}> 揺れ・画面演出を抑える</label>${!isLite()?`${observationState().pending?.rarity>0?'<button class="btn-line" data-menu="target">場所を選んで異変に対処</button>':''}${watchSettingsUnlocked()?'<button class="btn-line" data-menu="observation">観測設定</button>':''}`:''}<button class="btn-line" data-intro="archive">最初の3通を読み返す</button>${localStorage.getItem(KEY+'_conflict_backup')?'<button class="btn-line" data-cloud-choice="backup">退避した記録をダウンロード</button>':''}<button class="btn-paper" data-menu="account">ログイン・アカウント管理</button></div>`);
 document.getElementById('menu-sync').textContent=document.getElementById('sync').textContent;
}
document.getElementById('game-menu').addEventListener('click',e=>{e.currentTarget.focus({preventScroll:true});openGameMenu();});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-menu],[data-notice],[data-mail],[data-mail-claim],[data-notices-read-all]');if(!b||b.disabled)return;
 // WebKit does not focus pointer-clicked buttons; capture the actual navigation origin.
 b.focus({preventScroll:true});
 if(b.hasAttribute('data-notices-read-all')){
  const c=menuState(),unread=visibleGameNotices().filter(n=>!c.readNotices.includes(n.id));
  if(!unread.length)return;
  c.readNotices.push(...unread.map(n=>n.id));markDirty();renderMenuBadge();
  return openGameNews(`${unread.length}件のお知らせを既読にしました。`);
 }
 if(b.dataset.menu){const actions={return:returnFromMenu,home:openGameMenu,news:openGameNews,inbox:openGameInbox,settings:openMenuSettings,observation:observationSettings,target:observationTargetPicker,account:openAccount,catalog:()=>openEncyclopedia(),investigations:()=>{returnFromMenu();openLegendBoard();}};const open=actions[b.dataset.menu];if(!open)return;return b.classList.contains('menu-back')?returnToMenuPage(b.dataset.menu,open):open();}
 if(b.dataset.notice){const n=visibleGameNotices().find(n=>n.id===b.dataset.notice);if(!n)return;const c=menuState();if(!c.readNotices.includes(n.id))c.readNotices.push(n.id);markDirty();renderMenuBadge();return openMenuPage('運営からのお知らせ',menuBack('news')+`<article class="game-message"><small>${n.date} · 運営</small><h2>${n.title}</h2><p>${n.body}</p></article>`);}
 if(b.dataset.mail)return openGameMail(b.dataset.mail);
 const id=b.dataset.mailClaim,m=visibleGameMail().find(m=>m.id===id),entry=menuState().mail[id];
 if(!m||!entry||entry.claimed||!m.reward)return;
 entry.claimed=true;S.currency+=m.reward;markDirty();render();openGameMail(id);
});

document.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||document.querySelector('[data-view="menu"]').hidden||!document.getElementById('sheet-bg').hidden)return;
 const actions={return:returnFromMenu,home:openGameMenu,news:openGameNews,inbox:openGameInbox};const open=actions[menuPageBack];if(open)returnToMenuPage(menuPageBack,open);
});
