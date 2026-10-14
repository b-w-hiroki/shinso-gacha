const assert=require('node:assert/strict'),M=require('../assets/forecast-archive-model'),Legend=require('../assets/legend-model');const cases=Legend.CASES;
assert.equal(M.inspect('u1',{u1:0},cases,null,{}),null);
assert.equal(M.inspect('u1',{u1:2},cases,null,{}),null);
assert.equal(M.inspect('u13',{u13:3},cases,null,{}),null);
for(const id of Legend.ids){const a=M.inspect(id,{[id]:3},cases,null,{});assert(a&&a.forecast);assert.equal(a.staff,null);const b=M.inspect(id,{[id]:3},cases,{mode:cases[id].mode,rarity:1},{noticed:true,compared:false});assert(b.comparison.includes('一致しない'));assert.equal(b.staff,null);const c=M.inspect(id,{[id]:3},cases,{incident:2},{noticed:true,compared:true});assert(c.staff?.label==='登録のない立会人');assert.deepEqual(c,M.inspect(id,{[id]:3},cases,{incident:2},{noticed:true,compared:true}));}
// Missing/invalid saved levels must not disclose the dossier. Before this
// change, Number(undefined)<3 was false and accidentally passed the gate.
for(const levels of [undefined,{}, {u1:undefined},{u1:NaN},{u1:Infinity},{u1:'3'},{u1:3.5},{u1:true},{u1:2},{u1:-1}]){
 assert.equal(M.inspect('u1',levels,cases,{mode:'cctv'}, {noticed:true,compared:true}),null);
}
assert.equal(M.inspect('__proto__',{'__proto__':3},cases,null,{}),null);
assert.equal(M.inspect('u1',{u1:3},null,null,{}),null);
const archive=Legend.ids.map(id=>M.inspect(id,{[id]:3},cases,{mode:cases[id].mode},{noticed:true,compared:true}));
assert.equal(new Set(archive.map(x=>x.forecast)).size,12,'all 12 cases need distinct next-day reports');
assert.equal(new Set(archive.map(x=>x.comparison)).size,12,'each comparison belongs to its own evidence');
assert.equal(new Set(archive.map(x=>x.staff.quote)).size,12,'witness statements are case-specific');
assert(archive.every(row=>row.warning.includes('断定できない')),'forecast never predetermines a real encounter');
assert.equal(M.inspect('u1',{u1:3},cases,null,{noticed:true,compared:true}).staff,null,
 'falsified comparison flag cannot expose staff without the actual observation');
assert.equal(M.inspect('u1',{u1:3},cases,{mode:'cctv'}, {noticed:false,compared:true}).staff,null,
 'noticed evidence is required to disclose a classified witness');
console.log('Forecast and unregistered witness unlock secrecy, twelve distinct reports, deterministic records passed');