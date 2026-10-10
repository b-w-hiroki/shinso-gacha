const assert=require('node:assert/strict'),M=require('../assets/forecast-archive-model'),Legend=require('../assets/legend-model');const cases=Legend.CASES;
assert.equal(M.inspect('u1',{u1:0},cases,null,{}),null);
assert.equal(M.inspect('u1',{u1:2},cases,null,{}),null);
assert.equal(M.inspect('u13',{u13:3},cases,null,{}),null);
for(const id of Legend.ids){const a=M.inspect(id,{[id]:3},cases,null,{});assert(a&&a.forecast);assert.equal(a.staff,null);const b=M.inspect(id,{[id]:3},cases,{mode:cases[id].mode,rarity:1},{noticed:true,compared:false});assert(b.comparison.includes('一致しない'));assert.equal(b.staff,null);const c=M.inspect(id,{[id]:3},cases,{incident:2},{noticed:true,compared:true});assert(c.staff?.label==='登録のない立会人');assert.deepEqual(c,M.inspect(id,{[id]:3},cases,{incident:2},{noticed:true,compared:true}));}
console.log('Forecast and unregistered witness unlock secrecy, deterministic records passed');