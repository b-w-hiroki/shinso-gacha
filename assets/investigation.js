/* One saved trail connects observation, evidence and a colleague's testimony. */
const INVESTIGATION_CASES={
 cctv:{member:'records',notes:['設置時の記録。公園には人影がない。','風速計は停止したまま。ブランコの位置だけが前の記録と違う。','人物に対応する入園記録はない。影だけが撮影範囲に入っている。','整列した跡は砂場の内側で途切れている。そこへ続く足跡はない。'],testimony:['この公園の使用届は、昨日から白紙です。','揺れていない、と書かれた点検票があります。点検時刻は、あなたの観測と同じです。','入園者はゼロで合っています。退園者だけ、一名記録されています。','並んだ数は報告書に書かないでください。前の報告より、一つ増えてしまうので。']},
 photo:{member:'senior',notes:['食器は三人分。撮影者の席は記録されていない。','箸の下に、支えるものは写っていない。食事の席は乱れていない。','追加の食器だけに使用した跡がある。誰が用意したかは不明。','窓の反射として処理された輪郭がある。反射の向きは室内と一致しない。'],testimony:['人数だけは覚えておけ。誰がいたかより、先に忘れる。','昔も箸が止まっていた。写真を片付けたあと、食器の音だけ聞こえた。','四人目を探す前に、自分が何人目なのか考えるな。席を離れていい。','あれを外から見ていると思うと、話が合わなくなる。今日は窓を閉めておこう。']},
 vision:{member:'equipment',notes:['接続元は商店街。映像を提供する人の氏名欄は空欄。','傘の布に、こちらを見返す眼が三つある。持ち手は映っていない。','接続先の人々の顔が、同じ方向へ向いている。操作者の位置は送信していない。','衣服は歩行中の形を保っている。着用者に相当する部分だけが見えない。'],testimony:['接続先は一台です。でも切断の返事は、毎回二つ来ます。','あの形、レンズの傷ではありません。電源を切ったモニタにも残るんです。','こちらの位置は送っていません。向こうが向きを合わせたとしか、記録できない。','通信量は減っていません。見えない部分の情報も、まだ届いています。']},
 dash:{member:'equipment',notes:['雨上がりの県道。対向車も歩行者も記録されていない。','道路とカーブミラーで、光源の時間帯が一致しない。','位置情報は進んでいるが、路面の特徴が以前の記録と一致する。','横断者に接近した記録がない。同じ距離のまま、複数のフレームに写る。'],testimony:['この車、保管庫にあるはずです。走行履歴だけ先に届きます。','ミラーの時刻が正しいのかもしれません。車内の時計は、確認しなくていい。','位置情報は戻っていません。同じ場所が、先回りしていることになります。','停車信号は送れます。でも、止まったという返事だけは来ないんです。']}
};
// A second, acquired-only reading changes the meaning of the first testimony.
// Derived from existing evidence; no extra rewards, RNG, or save migration.
const INVESTIGATION_RECHECK={
 cctv:['入園者はゼロ。退園者だけが記録されている。なら、誰が門を開けたのか。','点検票の時刻は映像と一致する。停止していたのは、風速計ではなく時計かもしれない。','退園者の欄に人数はある。氏名欄は、最初から設けられていなかった。','整列した跡は四つ。次の点検では、砂場の数だけが報告されている。'],
 photo:['撮影者の席がない。撮影者が席を離れた記録もない。','食器の音がした時刻には、もう撮影は終わっている。','四人目の席ではなく、誰かが一人分を余分に数えた可能性が残る。','反射を消した修正版にも、窓の内側の輪郭だけが残っている。'],
 vision:['切断の返答は二つ。片方の送信元は、こちらの端末番号になっている。','電源を切った画面に残った輪郭は、次の接続でも同じ位置だった。','送信していない位置情報を、向こうの記録が先に持っている。','空白になった衣服の内側に、通信の欠損は記録されていない。'],
 dash:['走行履歴の最初の時刻は、保管庫への返却よりも古い。','ミラーの時刻と車内時計は違う。どちらも点検記録では正常だ。','道路は進んでいる。距離計だけが、同じ区間をもう一度数えている。','停車信号への返事は届いた。返事の送信時刻は、信号より前だった。']
};
// Third stage: the player takes the recheck back to the same colleague.
// Saved as investigation.confronted; read-only for points, recovery and RNG.
const INVESTIGATION_CONFRONT={
 cctv:['門の鍵は記録係が預かっています。昨日の受領欄に、私の印はありません。……あなたの印があります。','点検票の時刻を直しておきます。いえ、直す前の時刻を、あなたが先に書いていました。','氏名欄がないのは、書く必要がないからです。退園した人は、まだ課に戻っていないので。','四つと書いたのは私ではありません。でもその報告書の筆跡は、あなたのものでもありませんでした。'],
 photo:['撮影者は席を立っていない。だから写真に写らない。……今もその席にいる、とは言っていない。','音を聞いたのは俺だけじゃない。あんたも隣で聞いていた。覚えていないなら、そのほうがいい。','余分に数えたのは俺だろう。あの夜から、帰り道で一人分多く数えてしまう。','窓は閉めると言っただろう。閉めたあとで、内側から叩く音がした。修正版は、その後の写真だ。'],
 vision:['端末番号は合っています。あなたの席の端末は、着任より前から接続されていました。','同じ位置なのは、向こうが動いていないからです。動いているのは、こちらのモニタのほうです。','位置の送信は止めました。止めたのは今日です。向こうの記録は、三日前から届いています。','欠損がないなら、中身も届いています。受信した容量は、ちょうど人ひとり分でした。'],
 dash:['返却の受領者欄を確認しました。白瀬さんの名前です。その日、白瀬さんは休みでした。','どちらの時計も正しいなら、車は二台あります。保管庫には、一台分の鍵しかありません。','同じ区間を二度走った車は、二度戻ってきます。昨夜、駐車場に同じ車が並んでいました。','返事の本文も読みました。「停車した」ではなく「乗車した」です。誰が、とは書いてありません。']
};
// Fear escalates per colleague with the number of confrontations already heard.
const INVESTIGATION_CONFRONT_CUES=['少し間があってから、声がする。','声は向かいの席ではなく、背後の書架から聞こえた気がする。','返事は、あなたが言い終える前に始まっていた。'];
function investigationRecheckLine(key,read,discussed){
 if(!read?.[key]||!discussed?.[key])return null;
 if(typeof key!=='string'||! /^(cctv|photo|vision|dash):[0-3]$/.test(key))return null;
 const [mode,r]=key.split(':');return INVESTIGATION_RECHECK[mode][Number(r)];
}
function investigationConfrontLine(key,read,discussed,confronted){
 if(!investigationRecheckLine(key,read,discussed)||confronted?.[key]!==true)return null;
 const [mode,r]=key.split(':');return INVESTIGATION_CONFRONT[mode][Number(r)];
}
function investigationConfrontCue(member,confronted){
 const n=Object.keys(confronted||{}).filter(k=>confronted[k]===true&&/^(cctv|photo|vision|dash):[0-3]$/.test(k)&&INVESTIGATION_CASES[k.split(':')[0]].member===member).length;
 return INVESTIGATION_CONFRONT_CUES[Math.min(n,INVESTIGATION_CONFRONT_CUES.length-1)];
}
// Saved testimony history for one colleague: only acquired, read and discussed records.
function investigationTestimonyLog(member,o,s){
 const out=[];
 for(const [mode,c] of Object.entries(INVESTIGATION_CASES)){
  if(c.member!==member)continue;
  for(let r=0;r<4;r++){
   const key=mode+':'+r;
   if(!o?.collection?.[key]||!s?.read?.[key]||!s?.discussed?.[key])continue;
   out.push({key,mode,rarity:r,testimony:c.testimony[r],confront:investigationConfrontLine(key,s.read,s.discussed,s.confronted)});
  }
 }
 return out;
}
// A superior who does not exist: earned by three confrontations, denied by all three colleagues.
// Read-only for points/RNG; saved as investigation.superior[member]===true.
const SUPERIOR_MAIL='superior-memo';
const SUPERIOR_LINES={
 records:'この課に課長職はありません。決裁欄はいつも空いています。……あなたの欄の、ひとつ上だけ。',
 equipment:'課長席の内線は、設置したことがありません。でもその番号から、毎晩一回だけ着信があります。',
 senior:'課長、か。昔そう呼ばれていた人がいた気がする。思い出そうとすると、その人の席に俺が座っている。'
};
function investigationSuperiorEarned(s){
 return Object.keys(s?.confronted||{}).filter(k=>s.confronted[k]===true&&/^(cctv|photo|vision|dash):[0-3]$/.test(k)).length>=3;
}
function investigationSuperiorDenied(s){
 return investigationSuperiorEarned(s)&&Object.keys(SUPERIOR_LINES).every(id=>s?.superior?.[id]===true);
}
function investigationSuperiorTopic(id,s,mailRead){
 return Object.hasOwn(SUPERIOR_LINES,id)&&mailRead===true&&investigationSuperiorEarned(s)&&s?.superior?.[id]!==true
  ?'<button class="watch-choice" data-watch-talk="'+id+'" data-topic="superior">課長からの連絡について聞く</button>':'';
}
function investigationSuperior(id){
 const s=investigationState(),mail=S.communications?.mail?.[SUPERIOR_MAIL];
 if(!Object.hasOwn(SUPERIOR_LINES,id)||mail?.read!==true||!investigationSuperiorEarned(s))return null;
 if(!s.superior||typeof s.superior!=='object'||Array.isArray(s.superior))s.superior={};
 if(s.superior[id]!==true){s.superior[id]=true;markDirty();save();}
 return SUPERIOR_LINES[id];
}
function investigationState(){
 const o=observationState();let s=o.investigation;if(!s||typeof s!=='object'||Array.isArray(s))s=o.investigation={};
 for(const k of ['read','discussed','confronted'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};
 return s;
}
function investigationRecord(key){
 if(typeof key!=='string'||! /^(cctv|photo|vision|dash):[0-3]$/.test(key))return null;
 const [mode,r]=key.split(':'),rarity=Number(r);if(!observationState().collection[key])return null;
 return {key,mode,rarity,data:INVESTIGATION_CASES[mode]};
}
function investigationLatest(unread=false){
 const o=observationState(),s=investigationState();
 return [...o.history].reverse().map(r=>`${r.mode}:${r.rarity}`).find(k=>investigationRecord(k)&&(!unread||!s.read[k]))||Object.keys(o.collection).find(k=>o.collection[k]&&(!unread||!s.read[k]))||null;
}
function investigationGoal(){
 const o=observationState();
 const missing=Object.keys(o.collection).filter(k=>!o.collection[k]).length;
 return missing?`未観測はあと${missing}種。重複記録は各地点48件で未発見の記録と照合できます。`:'全16種を保管済み。各地点の達成報酬と、同僚の証言を確かめられます。';
}
function investigationLatestRecheck(o,s){
 // Read-only discovery: never expose uncollected evidence or award points.
 return [...(Array.isArray(o.history)?o.history:[])].reverse()
  .map(r=>r.mode+':'+r.rarity)
  .find(key=>o.collection?.[key]&&s.confronted?.[key]!==true&&investigationRecheckLine(key,s.read,s.discussed))
  ||Object.keys(o.collection||{}).find(key=>o.collection[key]&&s.confronted?.[key]!==true&&investigationRecheckLine(key,s.read,s.discussed))
  ||null;
}
function investigationHome(){
 const o=observationState(),s=investigationState(),el=document.getElementById('obs-atmosphere');
 if(watchMessage||o.pending?.rarity||WatchModel.contamination(o)>0)return;
 if(!o.mind.closed&&watchLeadCopy(o))return;
 const key=investigationLatest(true);
 if(key)el.innerHTML='<button class="investigation-link" data-trail="latest">届いた観測資料を読む ›</button>';
 else if(investigationLatestRecheck(o,s))el.innerHTML='<button class="investigation-link" data-trail="recheck">証言と資料を再照合する ›</button>';
 else if(o.mind.closed)el.textContent='回線は切れています。下の「観測を再開」で戻れます。';
 else if(!o.collected)el.innerHTML='<button class="investigation-link" data-trail="guide">観測のほかに、何ができる？ ›</button>';
}
function investigationMemo(mode,rarity){
 const key=mode+':'+rarity,r=investigationRecord(key);if(!r)return '';
 const s=investigationState();s.read[key]=true;s.lastRead=key;markDirty();save();
 const member=WATCH_COLLEAGUES[r.data.member],recheck=investigationRecheckLine(key,s.read,s.discussed),confront=investigationConfrontLine(key,s.read,s.discussed,s.confronted);
 const third=confront?'<p class="investigation-confrontation">照会記録（'+member.name+'）：'+confront+'</p>':recheck?'<button class="watch-choice" data-trail="confront" data-key="'+key+'">再照合の結果を'+member.name+'に伝える</button>':'';
 return `<div class="investigation-memo"><p>${r.data.notes[rarity]}</p>${recheck?'<p class="investigation-discrepancy">再照合：'+recheck+'</p>':''}${third}<button class="${recheck?'btn-line':'watch-choice'}" data-trail="witness" data-key="${key}">${member.name}にこの記録を尋ねる</button><button class="btn-line" data-trail="album">観測資料の一覧へ</button>${typeof legendObservationLinks==='function'?legendObservationLinks(mode):''}</div>`;
}
function investigationWitness(key){
 const r=investigationRecord(key),s=investigationState();if(!r||!s.read[key])return;
 WatchModel.closeMonitor(observationState(),Date.now(),true);s.lastRead=key;
 observationConversation(r.data.member,'record');
}
function investigationTestimony(id){
 const s=investigationState(),r=investigationRecord(s.lastRead);if(!r||!s.read[r.key]||r.data.member!==id)return null;
 if(!s.discussed[r.key]){WatchModel.talk(observationState(),Date.now(),id);s.discussed[r.key]=true;markDirty();save();renderWatchMind();}
 return r.data.testimony[r.rarity];
}
function investigationConfront(key){
 const r=investigationRecord(key),s=investigationState();if(!r||!investigationRecheckLine(key,s.read,s.discussed))return;
 WatchModel.closeMonitor(observationState(),Date.now(),true);s.lastRead=key;
 observationConversation(r.data.member,'confront');
}
// Returns {line,cue}; saving the confrontation never awards points or recovery.
function investigationConfrontation(id){
 const s=investigationState(),r=investigationRecord(s.lastRead);
 if(!r||r.data.member!==id||!investigationRecheckLine(r.key,s.read,s.discussed))return null;
 const done=s.confronted[r.key]===true,cue=done?null:investigationConfrontCue(id,s.confronted);
 if(!done){s.confronted[r.key]=true;markDirty();save();}
 return {line:INVESTIGATION_CONFRONT[r.mode][r.rarity],cue};
}
function investigationTopic(id){
 const s=investigationState(),r=investigationRecord(s.lastRead),boss=investigationSuperiorTopic(id,s,S.communications?.mail?.[SUPERIOR_MAIL]?.read);return boss+(r&&s.read[r.key]&&r.data.member===id?'<button class="watch-choice" data-trail="witness" data-key="'+r.key+'">「'+OBSERVATIONS[r.mode].records[r.rarity]+'」について聞く</button>':'');
}
function investigationReturn(id){
 const s=investigationState(),r=investigationRecord(s.lastRead);return r&&s.read[r.key]&&r.data.member===id?'<button class="btn-line investigation-return" data-trail="record" data-key="'+r.key+'">記録へ戻って照合する</button>':'';
}
function openInvestigationGuide(){
 const o=observationState(),key=investigationLatest(true);
 openMenuPage('調査の進め方',menuBack()+`<div class="investigation-guide"><p>観測や異変の対処で得たptを、封筒の調査と装備の強化に使う。集めた資料を読むと、次に確かめたいことが残る。</p><div class="game-menu-list">${key?'<button data-trail="latest">未読の観測資料を読む <small>›</small></button>':''}<button data-trail="gacha">封筒を調査する <small>新しい資料・黒塗りの続き</small></button><button data-trail="files">資料を読む <small>真相と証言を照合</small></button><button data-trail="lab">装備を育てる <small>観測範囲・保持時間を広げる</small></button><button data-trail="home">観測へ戻る <small>記録を集める</small></button></div><p class="investigation-goal">${investigationGoal()}</p><details><summary>異変が見つからない・休みたい</summary><p>普段は映像に繰り返し触れて巡回する。異変があるときは違和感の付近に繰り返し触れる。「輪郭が揺らいだ」が有効な接触の印。回数を示すゲージはありません。</p>${o.pending?.rarity&&!o.mind.closed?'<button class="watch-choice" data-trail="target">場所を選んで対処する</button>':''}<p>回線を切るか、課内で話すと休める。再開は自分で選べます。離れている間は侵食が悪化せず、獲得したptと資料は失われません。</p></details></div>`);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-trail]');if(!b||isLite())return;
 const action=b.dataset.trail;
 if(action==='guide')return openInvestigationGuide();
 if(action==='target')return observationTargetPicker();
 if(action==='witness')return investigationWitness(b.dataset.key);
 if(action==='confront')return investigationConfront(b.dataset.key);
 if(action==='record'||action==='latest'||action==='recheck'){
  const key=action==='latest'?investigationLatest(true)||investigationLatest()
   :action==='recheck'?investigationLatestRecheck(observationState(),investigationState())
   :b.dataset.key;
  const r=investigationRecord(key);if(r)showWatchRecord(r.mode,r.rarity);return;
 }
 hideSheet();
 if(action==='album'){go('archive');setSectionTab('archive:observations');renderObservationAlbum();}
 else if(action==='files')go('archive');
 else if(['gacha','lab','home'].includes(action))go(action);
});
