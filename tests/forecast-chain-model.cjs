const assert=require('node:assert/strict'),Chain=require('../assets/forecast-chain-model.js');
const owned=[{id:'u1',status:'compared',mode:'cctv',rarity:0},
 {id:'u6',status:'compared',mode:'cctv',rarity:2},
 {id:'u9',status:'pending',mode:'cctv',rarity:1},
 {id:'u11',status:'compared',mode:'photo',rarity:0}];
assert.deepEqual(Chain.links('u9',owned),[],'an unconfirmed future report cannot expose anyone else');
assert.deepEqual(Chain.links('u2',owned),[],'an unacquired report is hidden');
const links=Chain.links('u1',owned);
assert.deepEqual(links.map(x=>x.id),['u6']);
assert(links[0].note.includes('区分は一致しない'));
assert.equal(Chain.links('u11',owned).length,0,'unrelated sources must not link');
assert.equal(Chain.links('__proto__',owned).length,0);
assert.deepEqual(Chain.links('u1',[...owned,{id:'u7',status:'compared',mode:'cctv',rarity:1}]).map(x=>x.id),['u6','u7']);
const matching=Chain.links('u1',[...owned,{id:'u7',status:'compared',mode:'cctv',rarity:0}]);
assert(matching[1].note.includes('同じ観測区分'));
assert.deepEqual(Chain.links('u1',owned),links,'read-only chain model');
const triple=[...owned,{id:'u7',status:'compared',mode:'cctv',rarity:1,observed:'2026/10/12'}];
assert.equal(Chain.pattern('u1',owned),null,'two collected reports cannot imply a third');
assert.equal(Chain.pattern('u9',triple),null,'a pending report cannot appear as a confirmed archive');
assert.equal(Chain.pattern('u11',triple),null,'other media does not count as a third evidence file');
assert.equal(Chain.pattern('u1',[...owned,{id:'u6',status:'compared',mode:'cctv',rarity:3}]),null,'duplicate IDs cannot unlock archive');
const mixed=Chain.pattern('u1',triple);
assert(mixed&&mixed.title.includes('受領印')&&mixed.conclusion.includes('食い違う'));
assert.deepEqual(mixed.entries.map(x=>x.id),['u1','u6','u7']);
assert.deepEqual(mixed.entries.map(x=>x.type),['平常','SR','R']);
assert.deepEqual(Chain.pattern('u1',triple),mixed,'reading must not change evidence');
const uniform=Chain.pattern('u1',[
 {id:'u1',mode:'cctv',status:'compared',rarity:2},
 {id:'u6',mode:'cctv',status:'compared',rarity:2},
 {id:'u9',mode:'cctv',status:'compared',rarity:2}
]);
assert(uniform.conclusion.includes('同じ区分'));
assert.equal(Chain.pattern('u1',triple.filter(x=>x.id!=='u7')),null,'remove acquired file => archive disappears');
assert.equal(Chain.pattern('__proto__',triple),null);
console.log('Future report chain only exposes genuinely acquired, verified same-source cases');
