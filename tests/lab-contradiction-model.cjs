const assert=require('node:assert/strict'),M=require('../assets/lab-contradiction-model');
for(const input of [null,undefined,{},[],{collected:-1},{collected:2.99},{collected:'bad'}])assert.equal(M.project(input),null);
const expected=[
 ['内寸不一致','東壁の計測値は6.2m、西壁側から測ると7.0m。同じ柱間を記録している。'],
 ['重複区画','観測盤の背面に、調査室と同じ管理番号の部屋が一室分重なっている。'],
 ['退出先不一致','北扉の退出先は調査室。扉を通った記録はあるが、廊下の通過記録はない。']
];
for(const [collected,count] of [[3,1],[9,1],[10,2],[19,2],[20,3],[99,3]]){
 const input={collected,nested:{keep:true}},before=JSON.stringify(input),first=M.project(input),second=M.project(input);
 assert.equal(first.rows.length,count);assert.deepEqual(first,second);assert.equal(JSON.stringify(input),before);
 assert.deepEqual(first.rows.map(row=>[row.title,row.body]),expected.slice(0,count));
 expected.slice(count).forEach(([title,body])=>{assert(!JSON.stringify(first).includes(title));assert(!JSON.stringify(first).includes(body));});
}
assert.equal(Object.isFrozen(M.STAGES),true);assert.equal(Object.isFrozen(M.STAGES[0]),true);
console.log('Lab contradictions unlock at 3/10/20, hide future copy, stay deterministic and do not mutate input');
