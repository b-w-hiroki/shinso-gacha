/* Operator notices are release-managed; personal game mail is saved with the player. */
const GAME_NOTICES=[
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
function menuState(){
 if(!S.communications||typeof S.communications!=='object')S.communications={};
 const c=S.communications;if(!Array.isArray(c.readNotices))c.readNotices=[];
 if(!c.mail||typeof c.mail!=='object')c.mail={};return c;
}
function renderMenuBadge(){
 const c=menuState();let delivered=false;
 for(const m of GAME_MAIL)if(!c.mail[m.id]&&m.when()){c.mail[m.id]={receivedAt:Date.now(),read:false,claimed:false};delivered=true;}
 if(delivered)markDirty();
 const news=GAME_NOTICES.filter(n=>!c.readNotices.includes(n.id)).length;
 const mail=GAME_MAIL.filter(m=>c.mail[m.id]&&(!c.mail[m.id].read||(m.reward&&!c.mail[m.id].claimed))).length;
 document.getElementById('menu-dot').hidden=!(news+mail);
 document.getElementById('game-menu').setAttribute('aria-label',`メニュー${news+mail?'、未読または未受取あり':''}`);
 return {news,mail};
}
function openGameMenu(){
 const n=renderMenuBadge();
 sheet('メニュー',`<div class="game-menu-list">${!isLite()?'<button data-trail="guide"><span>調査の進め方</span><small>›</small></button>':''}<button data-menu="news"><span>運営からのお知らせ</span><small>${n.news?'● '+n.news:'›'}</small></button><button data-menu="inbox"><span>受信ボックス</span><small>${n.mail?'● '+n.mail:'›'}</small></button><button data-menu="settings"><span>設定・記録の引き継ぎ</span><small>›</small></button></div>`);
}
function menuBack(target='home'){return `<button class="menu-back" data-menu="${target}">‹ ${target==='home'?'メニュー':target==='news'?'お知らせ一覧':'受信ボックス'}</button>`;}
function openGameNews(){const c=menuState();sheet('運営からのお知らせ',menuBack()+`<div class="game-message-list">${GAME_NOTICES.map(n=>`<button data-notice="${n.id}"><small>${n.date}${c.readNotices.includes(n.id)?'':' · 未読'}</small><b>${n.title}</b></button>`).join('')}</div>`);}
function openGameInbox(){
 const c=menuState(),mail=GAME_MAIL.filter(m=>c.mail[m.id]).reverse();
 sheet('受信ボックス',menuBack()+`<p class="menu-muted">ゲーム内メール</p><div class="game-message-list">${mail.map(m=>`<button data-mail="${m.id}"><small>${m.from}${!c.mail[m.id].read?' · 未読':''}${m.reward&&!c.mail[m.id].claimed?' · 添付あり':''}</small><b>${m.title}</b></button>`).join('')||'<p class="menu-empty">届いたメールはありません。</p>'}</div>`);
}
function openGameMail(id){
 const m=GAME_MAIL.find(m=>m.id===id),c=menuState();if(!m||!c.mail[id])return;
 c.mail[id].read=true;markDirty();renderMenuBadge();
 const d=new Date(c.mail[id].receivedAt).toLocaleDateString('ja-JP');
 sheet('受信メール',menuBack('inbox')+`<article class="game-message"><small>${m.from} · ${d}</small><h2>${m.title}</h2><p>${m.body}</p>${m.reward?`<button class="btn-paper" data-mail-claim="${id}" ${c.mail[id].claimed?'disabled':''}>${c.mail[id].claimed?'受取済み':m.reward+'pt を受け取る'}</button>`:''}</article>`);
}
function openMenuSettings(){
 sheet('設定',menuBack()+`<div class="game-message"><p id="menu-sync"></p>${!isLite()?`<label class="watch-quiet-setting"><input type="checkbox" data-watch-quiet ${observationState().quiet?'checked':''}> 揺れ・画面演出を抑える</label>${observationState().pending?.rarity>0?'<button class="btn-line" data-menu="target">場所を選んで異変に対処</button>':''}${watchSettingsUnlocked()?'<button class="btn-line" data-menu="observation">観測設定</button>':''}`:''}<button class="btn-line" data-intro="archive">最初の3通を読み返す</button>${document.getElementById('glink').hidden?'':'<button class="btn-paper" data-menu="account">Googleで記録を引き継ぐ</button>'}</div>`);
 document.getElementById('menu-sync').textContent=document.getElementById('sync').textContent;
}
document.getElementById('game-menu').addEventListener('click',openGameMenu);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-menu],[data-notice],[data-mail],[data-mail-claim]');if(!b||b.disabled)return;
 if(b.dataset.menu){const actions={home:openGameMenu,news:openGameNews,inbox:openGameInbox,settings:openMenuSettings,observation:observationSettings,target:observationTargetPicker,account:()=>linkGoogle()};return actions[b.dataset.menu]?.();}
 if(b.dataset.notice){const n=GAME_NOTICES.find(n=>n.id===b.dataset.notice);if(!n)return;const c=menuState();if(!c.readNotices.includes(n.id))c.readNotices.push(n.id);markDirty();renderMenuBadge();return sheet('運営からのお知らせ',menuBack('news')+`<article class="game-message"><small>${n.date} · 運営</small><h2>${n.title}</h2><p>${n.body}</p></article>`);}
 if(b.dataset.mail)return openGameMail(b.dataset.mail);
 const id=b.dataset.mailClaim,m=GAME_MAIL.find(m=>m.id===id),entry=menuState().mail[id];
 if(!m||!entry||entry.claimed||!m.reward)return;
 entry.claimed=true;S.currency+=m.reward;markDirty();render();openGameMail(id);
});
