/* One saved trail connects observation, evidence and a colleague's testimony. */
const INVESTIGATION_CASES={
 cctv:{member:'records',notes:['設置時の記録。公園には人影がない。','風速計は停止したまま。ブランコの位置だけが前の記録と違う。','人物に対応する入園記録はない。影だけが撮影範囲に入っている。','整列した跡は砂場の内側で途切れている。そこへ続く足跡はない。'],testimony:['この公園の使用届は、昨日から白紙です。','揺れていない、と書かれた点検票があります。点検時刻は、あなたの観測と同じです。','入園者はゼロで合っています。退園者だけ、一名記録されています。','並んだ数は報告書に書かないでください。前の報告より、一つ増えてしまうので。']},
 photo:{member:'senior',notes:['食器は三人分。撮影者の席は記録されていない。','箸の下に、支えるものは写っていない。食事の席は乱れていない。','追加の食器だけに使用した跡がある。誰が用意したかは不明。','窓の反射として処理された輪郭がある。反射の向きは室内と一致しない。'],testimony:['人数だけは覚えておけ。誰がいたかより、先に忘れる。','昔も箸が止まっていた。写真を片付けたあと、食器の音だけ聞こえた。','四人目を探す前に、自分が何人目なのか考えるな。席を離れていい。','あれを外から見ていると思うと、話が合わなくなる。今日は窓を閉めておこう。']},
 vision:{member:'equipment',notes:['接続元は商店街。映像を提供する人の氏名欄は空欄。','傘の輪郭に、機材の欠損では説明できない形がある。','接続先の人々の顔が、同じ方向へ向いている。操作者の位置は送信していない。','衣服は歩行中の形を保っている。着用者に相当する部分だけが見えない。'],testimony:['接続先は一台です。でも切断の返事は、毎回二つ来ます。','あの形、レンズの傷ではありません。電源を切ったモニタにも残るんです。','こちらの位置は送っていません。向こうが向きを合わせたとしか、記録できない。','通信量は減っていません。見えない部分の情報も、まだ届いています。']},
 dash:{member:'equipment',notes:['雨上がりの県道。対向車も歩行者も記録されていない。','道路とカーブミラーで、光源の時間帯が一致しない。','位置情報は進んでいるが、路面の特徴が以前の記録と一致する。','横断者に接近した記録がない。同じ距離のまま、複数のフレームに写る。'],testimony:['この車、保管庫にあるはずです。走行履歴だけ先に届きます。','ミラーの時刻が正しいのかもしれません。車内の時計は、確認しなくていい。','位置情報は戻っていません。同じ場所が、先回りしていることになります。','停車信号は送れます。でも、止まったという返事だけは来ないんです。']}
};
function investigationState(){
 const o=observationState();let s=o.investigation;if(!s||typeof s!=='object'||Array.isArray(s))s=o.investigation={};
 for(const k of ['read','discussed'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};
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
 const o=observationState(),next=Object.entries(WatchModel.MODES).find(([id])=>!o.unlocked.includes(id));
 if(next){const [id,m]=next;return `${m.label}の解放まで、観測記録あと${Math.max(0,m.need-o.collected)}件・${m.cost}pt（所持${Math.floor(S.currency)}pt）。`;}
 const missing=Object.keys(o.collection).filter(k=>!o.collection[k]).length;
 return missing?`未観測はあと${missing}種。重複記録は各地点48件で未発見の記録と照合できます。`:'全16種を保管済み。各地点の達成報酬と、同僚の証言を確かめられます。';
}
function investigationHome(){
 const o=observationState(),s=investigationState(),el=document.getElementById('obs-atmosphere');
 if(watchMessage||o.pending?.rarity||WatchModel.contamination(o)>0)return;
 const key=investigationLatest(true);
 if(key)el.innerHTML='<button class="investigation-link" data-trail="latest">届いた観測資料を読む ›</button>';
 else if(o.mind.closed)el.textContent='回線は切れています。下の「観測を再開」で戻れます。';
 else if(!o.collected)el.innerHTML='<button class="investigation-link" data-trail="guide">観測のほかに、何ができる？ ›</button>';
}
function investigationMemo(mode,rarity){
 const key=mode+':'+rarity,r=investigationRecord(key);if(!r)return '';
 const s=investigationState();s.read[key]=true;s.lastRead=key;markDirty();save();
 const member=WATCH_COLLEAGUES[r.data.member];
 return `<div class="investigation-memo"><p>${r.data.notes[rarity]}</p>${s.discussed[key]?'<p class="investigation-discrepancy">追記：証言と映像の説明が一致しない。原本は訂正されていない。</p>':''}<button class="watch-choice" data-trail="witness" data-key="${key}">${member.name}にこの記録を尋ねる</button><button class="btn-line" data-trail="album">観測資料の一覧へ</button></div>`;
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
function investigationTopic(id){
 const s=investigationState(),r=investigationRecord(s.lastRead);return r&&s.read[r.key]&&r.data.member===id?'<button class="watch-choice" data-trail="witness" data-key="'+r.key+'">この記録について</button>':'';
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
 if(action==='record'||action==='latest'){
  const key=action==='latest'?investigationLatest(true)||investigationLatest():b.dataset.key,r=investigationRecord(key);if(r)showWatchRecord(r.mode,r.rarity);return;
 }
 hideSheet();
 if(action==='album'){go('archive');setSectionTab('archive:observations');renderObservationAlbum();}
 else if(action==='files')go('archive');
 else if(['gacha','lab','home'].includes(action))go(action);
});
