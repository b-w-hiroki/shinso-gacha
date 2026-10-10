/* A small diegetic layer; never alters inventory or Firebase records. */
function uncannyState(){S.uncannyArchive=UncannyArchive.state(S.uncannyArchive,S.levels);return S.uncannyArchive;}
function uncannyHTML(id){
 const lv=LegendModel.count(S.levels,id),layer=legendLayerStatus(id),events=UncannyArchive.events(id,lv,layer,Object.hasOwn(legendState().conclusions,id));
 if(!events)return '';
 const s=uncannyState(),pieces=[];
 if(events.missing)pieces.push('<p>保管棚の番号がひとつ飛んでいる。どの記録に対応するのか分からない。</p><button class="btn-line" data-uncanny="noticed" data-id="'+id+'" '+(s.noticed[id]?'disabled':'')+'>'+(s.noticed[id]?'欠番を控えた':'欠番を控える')+'</button>');
 if(events.read)pieces.push('<p>この資料の閲覧印は、あなたが開く前の日付になっている。</p><button class="btn-line" data-uncanny="reads" data-id="'+id+'" '+(s.reads[id]?'disabled':'')+'>'+(s.reads[id]?'閲覧印を照合済み':'閲覧印を照合する')+'</button>');
 if(events.letter)pieces.push('<details><summary>差出人のない伝言</summary><p>原本に残った余白を調べてください。これを送った者の記録はありません。</p><button class="btn-line" data-uncanny="letters" data-id="'+id+'" '+(s.letters[id]?'disabled':'')+'>'+(s.letters[id]?'受領記録あり':'伝言を保管する')+'</button></details>');
 if(events.vanish)pieces.push('<p>一枚の記録だけ索引から消されている。ただし原本は保管され、閲覧できます。</p><button class="btn-line" data-uncanny="restored" data-id="'+id+'" '+(s.restored[id]?'disabled':'')+'>'+(s.restored[id]?'索引を復元済み':'索引を復元する')+'</button>');
 if(events.reopened)pieces.push('<p>完了印の下に新しい訂正指示が見つかった。以前の結論は消されていない。</p><button class="btn-line" data-uncanny="reopened" data-id="'+id+'" '+(s.reopened[id]?'disabled':'')+'>'+(s.reopened[id]?'再調査を記録済み':'再調査の痕跡を保管する')+'</button>');
 return pieces.length?'<section class="legend-investigation uncanny-archive"><h3>保管記録の異常</h3>'+pieces.join('')+'</section>':'';
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-uncanny]');if(!b||isLite())return;
 const id=b.dataset.id,key=b.dataset.uncanny,lv=LegendModel.count(S.levels,id),v=UncannyArchive.events(id,lv,legendLayerStatus(id),Object.hasOwn(legendState().conclusions,id));
 const allow={noticed:v?.missing,reads:v?.read,letters:v?.letter,restored:v?.vanish,reopened:v?.reopened};
 if(UncannyArchive.record(uncannyState(),id,key,allow[key])){markDirty();save();openLegendCase(id);}
});
