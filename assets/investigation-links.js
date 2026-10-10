/* Acquired-only research connections; never mutates originals or awards points. */
function linkedInquiryState(){S.linkedInquiry=InvestigationLinks.normalize(S.linkedInquiry,S.levels,LegendModel.CASES);return S.linkedInquiry;}
function investigationLinksHTML(id){
 if(LegendModel.count(S.levels,id)<3)return '';
 const s=linkedInquiryState(),levels=S.levels,cases=LegendModel.CASES,related=InvestigationLinks.links(id,levels,cases),layer=legendLayerStatus(id);
 const report=InvestigationLinks.report(id,levels,cases,legendState().conclusions,s,layer);
 const reportHtml='<details class="investigation-report"><summary>この事件の調査報告書</summary><p>断片：3件 ／ 原本の再鑑定：'+(report.reappraised?'済':'未実施')+'</p><p>真相候補：'+(report.hypothesis===null?'未記録':report.hypothesis===0?'記録の改ざん':'現地の侵食')+'</p><p>矛盾：'+(report.contradiction?'記録あり':'未記録')+' ／ 怪異連鎖：'+(report.chain?'記録あり':'未記録')+'</p><p>合同調査：'+report.related.length+'件</p></details>';
 const reappraisal=layer?.noticed?'<button class="btn-line" data-inquiry="reappraise" data-id="'+id+'" '+(s.reappraised[id]?'disabled':'')+'>'+(s.reappraised[id]?'再鑑定済み':'原本を再鑑定する')+'</button>':'<p>原本の差異を記録すると再鑑定できます。</p>';
 const joint=related.length?'<details><summary>関連する入手済み事件</summary>'+related.map(other=>{const key=InvestigationLinks.pair(id,other);return '<button class="btn-line" data-inquiry="joint" data-id="'+id+'" data-other="'+other+'" '+(s.joint[key]?'disabled':'')+'>'+(s.joint[key]?'合同調査済み：':'合同調査する：')+escapeHTML(legendTitle(other))+'</button>';}).join('')+'</details>':'<p>照合できる別の事件は、まだ記録されていません。</p>';
 return '<section class="legend-investigation investigation-links"><h3>再鑑定・合同調査</h3>'+reappraisal+joint+reportHtml+'</section>';
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-inquiry]');if(!b||isLite())return;
 const id=b.dataset.id,other=b.dataset.other,action=b.dataset.inquiry,s=linkedInquiryState();
 const changed=action==='reappraise'?InvestigationLinks.reappraise(s,id,S.levels,LegendModel.CASES,legendLayerStatus(id)?.noticed):action==='joint'?InvestigationLinks.combine(s,id,other,S.levels,LegendModel.CASES):false;
 if(changed){markDirty();save();openLegendCase(id);}
});
