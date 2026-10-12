/* Reverse annotations of evidence the player truly acquired. No new reward,
 * draw, save key, hidden collection count, or fabricated unobserved incident. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PhotoVerso=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const NOTES={
  cctv:[
   {title:'地下通路の原本受領票',stamp:'通常・原本',lead:'監視装置の設置時刻と点検印はある。立会者の人数だけが記されていない。',trace:'通路の床は清掃済みと登録されている。'},
   {title:'足跡の検査紙',stamp:'追加確認',lead:'通路の清掃記録は「乾燥」と記す。足跡の内側だけ、照明が二度反射している。',trace:'新しい靴の型番は一つも登録されていない。',comparison:'平常写真の床面には水滴がない。痕跡は二枚を並べたときだけ増えている。'},
   {title:'退出の立会票',stamp:'照合保留',lead:'出口を通過した者の人数は増えていない。誰も記入していない確認印が残る。',trace:'印影の登録先は空欄になっている。',comparison:'平常写真でも扉の位置は同じ。受領印だけが、退出時刻を先取りしている。'},
   {title:'階段数の照合',stamp:'原本差異',lead:'階段は構造図では一列。影の二列目の踊り場だけ、図面と縮尺が合わない。',trace:'補筆者の所属は未記録。',comparison:'通常原本と同じ手すりを数えると、影の階段だけ下から続いている。'}
  ],
  photo:[
   {title:'原本の受領票',stamp:'原本・平常',lead:'撮影者欄は未記入。教室の施錠時刻だけが残っている。',trace:'この頁だけには訂正印がない。'},
   {title:'座席配置の修正票',stamp:'追加確認',lead:'席の位置に細い朱線がある。備品番号の欄には、位置を移した理由が書かれていない。',trace:'配置図と回収した写真を見比べても、訂正した席が特定できない。',comparison:'平常写真と机の木目は一致する。椅子の向きだけが誰かを迎えるように変わっている。'},
   {title:'在室者欄の照会',stamp:'照合保留',lead:'黒板側に立つ人物の欄だけが空欄になっている。人数の合計は元のまま。',trace:'目撃者は一人増えたとは答えていない。記録の人数だけが合わない。',comparison:'平常原本にも黒板の傷はある。しかし立像の周囲だけ、傷が通り抜けている。'},
   {title:'出席番号の追補',stamp:'原本差異',lead:'出席番号の重複を示す付箋がある。削除された番号の記録は残っていない。',trace:'変更前の台帳より、後で撮影された写真のほうが古い形式になっている。',comparison:'通常の室内写真には番号がない。増えた番号は裏面の管理印と一致している。'}
  ],
  vision:[
   {title:'踏切前の原本受領票',stamp:'通常・原本',lead:'遮断機の動作履歴と撮影地点は一致する。撮影した者の立ち位置だけが欠けている。',trace:'受領者欄には、まだ署名がない。'},
   {title:'遮断前の立会者',stamp:'追加確認',lead:'踏切の遮断記録は一名。通過前の写真に、渡り終えた者の影だけが残る。',trace:'通行方向を示す矢印は元のまま。',comparison:'平常時の線路脇に同じ影は見つからない。撮影者は移動していない。'},
   {title:'横断人数の二重計上',stamp:'照合保留',lead:'通過人数は記録上では一致するのに、写真で数えると一名余る。余分な影には足元がない。',trace:'再集計を依頼した者の名前も空白。',comparison:'通常原本の遮断機と標識は同じ。人数だけが検査のたびに合わなくなる。'},
   {title:'撮影者の背後',stamp:'原本差異',lead:'カメラ正面には誰もいない。両端に映る影は、それぞれ反対方向から撮影者を見ている。',trace:'撮影側の安全確認欄には記録がない。',comparison:'平常原本の画角は一致する。両端の影は、撮影の中心を指している。'}
  ],
  dash:[
   {title:'夜間走行の原本受領票',stamp:'通常・原本',lead:'走行経路と速度の記録は一致。車両が通らなかったはずの時刻に受領印がある。',trace:'前照灯の状態は正常と記録されている。'},
   {title:'路肩の反射物',stamp:'追加確認',lead:'路肩の反射材は設置記録にない。夜間走行のたび、道路標識より先にこちらへ向きを変える。',trace:'道路管理者の連絡先は空欄。',comparison:'平常映像にも同じ舗装の傷がある。反射物だけが道路の外にはみ出している。'},
   {title:'背後車両の光',stamp:'照合保留',lead:'後方からの二灯が記録にある。該当時刻の車両計数は零、追越しの記録もない。',trace:'対向車両の欄に訂正はない。',comparison:'平常走行でも車道幅は同じ。後ろの灯りが先行車の影を落としている。'},
   {title:'対向線の未受理記録',stamp:'原本差異',lead:'対向車線に人影が残る。走行経路には、その時刻の対向車線が存在しない。',trace:'担当者は原本を二度受理している。',comparison:'通常の白線は一致する。人影の下だけ濡れた舗装の光を返さない。'}
  ]
 };
 const validCount=n=>Number.isSafeInteger(n)&&n>0;
 function inspect(mode,rarity,entry){
  if(!Object.hasOwn(NOTES,mode)||![0,1,2,3].includes(rarity)||
   !entry||typeof entry!=='object'||Array.isArray(entry)||
   !entry.rarities||typeof entry.rarities!=='object'||Array.isArray(entry.rarities)||
   !validCount(entry.rarities[rarity]))return null;
  const ownedNormal=validCount(entry.rarities[0]),note=NOTES[mode][rarity];
  return {mode,rarity,title:note.title,stamp:note.stamp,lead:note.lead,trace:note.trace,
   comparison:rarity>0&&ownedNormal?note.comparison||null:null,normalOwned:ownedNormal};
 }
 return {inspect};
});