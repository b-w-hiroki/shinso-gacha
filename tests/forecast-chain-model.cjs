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
console.log('Future report chain only exposes genuinely acquired, verified same-source cases');
