const assert=require('node:assert/strict');
const Registry=require('../assets/witness-registry-model');
const Legend=require('../assets/legend-model');
const cases=Legend.CASES;
assert.equal(Registry.inspect('u1',{u1:0},cases,true,null),null);
assert.equal(Registry.inspect('u1',{u1:2},cases,true,null),null);
assert.equal(Registry.inspect('u1',{u1:3},cases,false,null),null);
assert.equal(Registry.inspect('__proto__',{'__proto__':3},cases,true,null),null);
assert.equal(Registry.inspect('u13',{u13:3},cases,true,null),null);
const first=Registry.inspect('u1',{u1:3},cases,true,{status:'pending'});
assert(first&&first.record&&first.testimony&&first.statement);
assert.equal(first.extra,null);
const baseline=Registry.list({u1:3,u2:3},cases,{u1:true,u2:false},{});
assert.equal(baseline.length,1);
assert.equal(baseline[0].id,'u1');
const future=Registry.inspect('u1',{u1:3},cases,true,{status:'compared',mode:'cctv',rarity:0});
assert(future.extra.includes('平常'));
const anomaly=Registry.inspect('u1',{u1:3},cases,true,{status:'compared',mode:'cctv',rarity:2});
assert(anomaly.extra.includes('異変'));

const realTrail={status:'compared',mode:'cctv',rarity:0,rechecks:[
 {observed:'2026/10/13',rarity:2,copy:'untrusted'},
 {observed:'2026/10/14',rarity:0,copy:'untrusted'}
]};
const followed=Registry.inspect('u1',{u1:3},cases,true,realTrail);
assert.equal(followed.trail.length,2,'only acquired re-observations appear');
assert(followed.trail[0].note.includes('異なる区分'),'changed anomaly leaves a contradiction');
assert(followed.trail[1].note.includes('同じ区分'),'same rarity still keeps the receipt');
assert.equal(followed.trail[0].note.includes('untrusted'),false,'untrusted descriptions are never echoed');
assert.equal(Registry.inspect('u1',{u1:2},cases,true,realTrail),null,'unowned report hides rechecks');
assert.equal(Registry.inspect('u1',{u1:3},cases,false,realTrail),null,'uncompared report hides rechecks');
assert.deepEqual(Registry.inspect('u1',{u1:3},cases,true,{...realTrail,mode:'dash'}).trail,[],
 'wrong observation medium must not open another case');
assert.deepEqual(Registry.inspect('u1',{u1:3},cases,true,{...realTrail,status:'pending'}).trail,[],
 'forecast without later observation cannot expose follow-ups');
const malicious={...realTrail,rechecks:[
 {observed:'<img src=x>',rarity:3},{observed:'2026/10/15',rarity:NaN},
 ...Array.from({length:6},(_,n)=>({observed:'2026/10/'+(15+n),rarity:1}))]};
assert.equal(Registry.inspect('u1',{u1:3},cases,true,malicious).trail.length,3,
 'malformed observations rejected and trail capped');
assert.deepEqual(realTrail.rechecks.map(r=>r.copy),['untrusted','untrusted'],
 'reading never mutates saved evidence');
assert.notEqual(Registry.inspect('u2',{u2:3},cases,true,null).record,first.record);
assert.equal(Registry.list({},cases,{u1:true},{'u1':{status:'compared'}}).length,0);
const levels=Object.fromEntries(Legend.ids.map(id=>[id,3]));
const compared=Object.fromEntries(Legend.ids.map(id=>[id,true]));
const all=Registry.list(levels,cases,compared,{});
assert.equal(all.length,12);
assert.equal(new Set(all.map(x=>x.record)).size,12,'unique acquired evidence');
assert.deepEqual(Registry.list(levels,cases,compared,{}),all,'read-only projection');
// The personnel dossier reveals only actually acquired evidence at each clearance level.
assert.deepEqual(Registry.revisions(19,[], 'u1'),[],'unknown witness is always absent');
assert.deepEqual(Registry.revisions(19,baseline,'u2'),[],'unowned case never exposes a revision');
assert.deepEqual(Registry.revisions(19,baseline,'u1'),[],'one owned case cannot fabricate cross-document anomalies');
assert.deepEqual(Registry.revisions(5,all,'u1'),[],'below rank threshold stays redacted');
const tier2=Registry.revisions(6,all,'u1');assert.deepEqual(tier2.map(x=>x.tier),[2]);
const tier3=Registry.revisions(10,all,'u1');assert.deepEqual(tier3.map(x=>x.tier),[2,3]);
const tier4=Registry.revisions(14,all,'u1');assert.deepEqual(tier4.map(x=>x.tier),[2,3,4]);
const deepest=Registry.list(levels,cases,compared,{u1:{status:'compared',mode:'cctv',rarity:1}});
const tier5=Registry.revisions(17,deepest,'u1');
assert.deepEqual(tier5.map(x=>x.tier),[2,3,4,5],'deepest evidence requires a real owned later observation');
assert.deepEqual(Registry.revisions(17,deepest,'u2').map(x=>x.tier),[2,3,4],'unobserved case cannot borrow a later observation');
assert.deepEqual(Registry.revisions(17,deepest,'u1'),tier5,'reading does not mutate evidence');

// Contradictory paperwork requires multiple recovered witness files and clearance.
const two=all.slice(0,2),three=all.slice(0,3);
assert.deepEqual(Registry.editions(19,[], 'u1'),[],'no filed evidence, no personnel editions');
assert.deepEqual(Registry.editions(19,two,'u9'),[],'unknown case cannot expose another file');
assert.deepEqual(Registry.editions(9,two,'u1'),[],'below the rank threshold stays redacted');
assert.deepEqual(Registry.editions(10,two,'u1').map(x=>x.value),['登録なし','課内職員']);
assert.equal(Registry.editions(14,two,'u1').length,2,'third version needs three acquired files');
assert.equal(Registry.editions(14,three,'u1').length,3);
assert.equal(Registry.editions(17,three,'u1').length,3,'future version needs actual after-observation');
const acquiredFuture=[{...three[0],extra:'観測記録に立会印の矛盾があった。'},...three.slice(1)];
assert.equal(Registry.editions(17,acquiredFuture,'u1').length,4);
assert.equal(Registry.editions(17,acquiredFuture,'u2').length,3,'only current acquired case may unlock future edition');
const original=JSON.stringify(acquiredFuture);
assert.deepEqual(Registry.editions(17,acquiredFuture,'u1'),Registry.editions(17,acquiredFuture,'u1'),'read-only ledger');
assert.equal(JSON.stringify(acquiredFuture),original,'inspect must not mutate owned evidence');
// No premature cross-archive conclusions and no extra save or rewards.
const evidence=[{id:'extra-seat',title:'余分な席',confirmed:true},{id:'observer',title:'観測対象',confirmed:false}];
assert.deepEqual(Registry.personnelEchoes([], 'u1', evidence),[],'unseen witness cannot reveal personnel details');
assert.deepEqual(Registry.personnelEchoes(all,'u13',evidence),[],'unknown witness remains hidden');
assert.deepEqual(Registry.personnelEchoes(all,'u1',[{id:'extra-seat',confirmed:false}]),[]);
assert.deepEqual(Registry.personnelEchoes(all,'u1',[{id:'observer',title:'対象',confirmed:true},{id:'extra-seat',title:'席',confirmed:true}]).map(x=>x.id),['observer','extra-seat']);
assert.deepEqual(Registry.personnelEchoes(all,'u1',[...evidence,evidence[0]]).map(x=>x.id),['extra-seat'],'duplicates must not render');
assert.deepEqual(Registry.personnelEchoes(all,'u1',[{id:'__proto__',confirmed:true}]),[]);
assert.equal(JSON.stringify(acquiredFuture),original,'cross-archive reads are pure');
console.log('Unregistered witness registry: acquired-only, distinct records, future tie-in and no mutations passed');
