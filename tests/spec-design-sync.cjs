const assert=require('node:assert/strict');
const {check,isProductChange,noImpactReason}=require('../scripts/check-spec-design-sync.cjs');

const spec='docs/CURRENT-SPEC.md',design='docs/EXPERIENCE-DESIGN.md';
assert.equal(isProductChange('assets/observation.css'),true);
assert.equal(isProductChange('assets/observation/photo.webp'),true);
assert.equal(isProductChange('firebase/firestore.rules'),true);
assert.equal(isProductChange('tests/observation.cjs'),false);
assert.deepEqual(check(['docs/INDEX.md','tests/smoke.mjs']),{product:[],errors:[]});
assert.equal(check(['index.html',spec,design]).errors.length,0);
assert.equal(check(['assets/observation.js',spec]).errors.length,1);
assert.equal(check(['assets/observation.js'],'' ).errors.length,2);
const body='仕様書: 影響なし — CSSだけの整理でゲームルールと保存データは同じ\n設計書: 影響なし — 表示位置を変えず未使用のCSS定義だけを除去';
assert.equal(check(['assets/focus-ui.css'],body).errors.length,0);
assert.equal(check(['assets/focus-ui.css'],'- '+body.replace('\n','\n- ')).errors.length,0);
assert.equal(check(['assets/focus-ui.css',spec],body).errors.length,0);
assert.equal(check(['assets/focus-ui.css'],'仕様書: 影響なし — 理由を記入\n設計書: 影響なし — 変更なし').errors.length,2);
assert.equal(noImpactReason('仕様書: 未記入','仕様書'),null);
console.log('Spec/design sync: product scope, required documents, no-impact reasons and placeholders passed');
