/* Acquired case evidence only. Reading never advances a live encounter. */
const INC_MILESTONES={10:3,25:8,50:15,100:30},INC_RESEARCH_COST=12;
function incursionCollectionActions(a){
 const count=Object.keys(a.discovered).filter(k=>INCURSIONS[k]).length;
 const milestone=Object.keys(INC_MILESTONES).map(Number).find(n=>count>=n&&!a.claimedMilestones.includes(n));
 const duplicate=a.duplicates-a.researchSpent;
 return `${milestone?`<button class="inc-primary" data-inc-milestone="${milestone}">${milestone}種の整理報酬を受取（対策資料＋${INC_MILESTONES[milestone]}）</button>`:''}${duplicate>0&&count<100?`<p>重複記録 ${duplicate}件。${INC_RESEARCH_COST}件で未収集の記録を1件照合できます。</p><button class="inc-primary" data-inc-research="offer" ${duplicate<INC_RESEARCH_COST?'disabled':''}>重複記録を照合する</button>`:''}`;
}
function claimIncursionMilestone(n){
 const a=incursionState(true),count=Object.keys(a.discovered).filter(k=>INCURSIONS[k]).length;
 if(!Object.hasOwn(INC_MILESTONES,n)||count<n||a.claimedMilestones.includes(n))return false;
 a.claimedMilestones.push(n);a.samples=Math.min(999999,a.samples+INC_MILESTONES[n]);markDirty();return true;
}
function reconstructIncursion(expectedSpent){
 const a=incursionState(true),missing=INCURSIONS.map((_,i)=>i).filter(i=>!a.discovered[i]);
 if(!missing.length||a.researchSpent!==expectedSpent||a.duplicates-a.researchSpent<INC_RESEARCH_COST)return null;
 const kind=missing[Math.floor(Math.random()*missing.length)];
 a.researchSpent+=INC_RESEARCH_COST;a.discovered[kind]=true;a.reconstructed=a.reconstructed||{};a.reconstructed[kind]=true;markDirty();return kind;
}
function incursionWitnessMember(kind){
 const family=incursionProfile(kind).family,id=['device','space'].includes(family)?'equipment':['body','presence'].includes(family)?'senior':'records';
 return {id,...WATCH_COLLEAGUES[id]};
}
const INC_TESTIMONY={
 time:['時計は交換していません。記録のほうが、先に直っていました。','その時刻に勤務した人はいません。押印だけは、本物です。','訂正前の時刻を覚えておいてください。誰にも読み上げずに。'],
 space:['図面を重ねると、その場所だけ余ります。壁の厚さでは説明できません。','閉じたのは入口だけです。出口から誰か来ても、返事はしないで。','設備は正常です。異常がある場所だけ、機材の番号がありません。'],
 body:['本人にはまだ聞くな。何が違うのか、こちらから教えることになる。','その姿で歩けるはずがない。それでも、足音だけは普通だった。','顔を覚えようとするな。次に会った人の顔と、混ざる。'],
 device:['電源を外しても、この区間だけ通信量が減りませんでした。','応答の宛先はこの課です。送信した記録は、こちらにはありません。','雑音ではありません。同じ間隔で、こちらの返事を待っています。'],
 paper:['原本は保管しました。写しの空白だけは、埋めないでください。','訂正印は私のものです。ただ、その日は出勤していません。','紙の繊維まで照合しました。同じ紙が二枚ある、としか言えません。'],
 memory:['その話は初めて聞きました。……今の言い方も、記録にありますか。','私の記憶とは違います。訂正はしません。両方を残してください。','あなたが来る前から、この欄にはあなたの名前がありました。'],
 presence:['見えなくなっただけかもしれない。ここまで連れてきてはいないよな。','あれが近づいていたのか、こちらが近づいていたのか。距離の記録がない。','廊下で同じものを見ても、確かめに戻らなくていい。']
};
function openIncursionWitness(kind){
 const a=incursionState(true);if(!Number.isInteger(kind)||!a.discovered[kind]||!INCURSIONS[kind])return;
 const member=incursionWitnessMember(kind),p=INCURSIONS[kind];
 if(!a.discussed[kind]){WatchModel.talk(observationState(),Date.now(),member.id);a.discussed[kind]=true;markDirty();}
 WatchModel.closeMonitor(observationState(),Date.now(),true);watchContacts()[member.id]=true;markDirty();renderWatchMind();
 openIncursionRecords(kind);
 const body=document.querySelector('#incursion-dialog .inc-record-body');
 body.innerHTML=`<header class="watch-speaker">${watchPortrait(member)}<div><small>${member.role}</small><h3>${member.name}</h3><p>${member.description}</p></div></header><p>あなた：「${p.short}」について</p><blockquote class="inc-witness-copy">${INC_TESTIMONY[incursionProfile(kind).family][kind%3]}</blockquote><p>原本は訂正せず、この証言と並べて保管します。</p>`;
 document.querySelector('#incursion-dialog .inc-record-nav').innerHTML=`<button class="inc-primary" data-inc="record" data-value="${kind}">記録に戻って照合する</button>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-inc-milestone],[data-inc-research],[data-inc-witness]');if(!b||b.disabled)return;
 if(b.dataset.incMilestone){claimIncursionMilestone(Number(b.dataset.incMilestone));openIncursionRecords();return;}
 if(b.dataset.incWitness!==undefined)return openIncursionWitness(Number(b.dataset.incWitness));
 const a=incursionState(true);
 if(b.dataset.incResearch==='offer'){
  openIncursionRecords();
  document.querySelector('#incursion-dialog .inc-record-body').innerHTML=`<p>重複記録${INC_RESEARCH_COST}件を使い、未収集の記録を1件照合します。希少度に関係なく未収集の中から均等に選び、既存の記録・pt・進行中の異変は変えません。</p><button class="inc-primary" data-inc-research="confirm" data-spent="${a.researchSpent}">照合する（重複${INC_RESEARCH_COST}件）</button><button class="inc-primary" data-inc="records">戻る</button>`;
 }else {const kind=reconstructIncursion(Number(b.dataset.spent));if(kind!==null)openIncursionRecords(kind);}
});
