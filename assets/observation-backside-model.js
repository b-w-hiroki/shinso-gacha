/* Acquired-only reverse annotations of actual observation photographs.
 * Reading cannot generate a discovery or alter chance, state or saved records. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchBackside=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const observations={
  cctv:[
   {code:'A-11',title:'足跡の検査紙',note:'通路の清掃記録は「乾燥」と記す。足跡の内側だけ、写真と同じ照明が二度反射している。',comparison:'平常写真の床面には水滴がない。痕跡が増えたのは撮影後ではなく、二枚を並べたときだけ。'},
   {code:'A-12',title:'退出の立会票',note:'出口を通過した者の人数は増えていない。受領票の最後に、誰も記入していない確認印だけがある。',comparison:'平常写真でも出口の扉は同じ位置にある。立会印のほうが、出口を先に通過している。'},
   {code:'A-13',title:'階段数の照合',note:'昇降口の構造図では階段は一列。影に隠れた二列目の踊り場だけ、図面と縮尺が合わない。',comparison:'通常原本と同じ手すりを数えると、影の階段だけ下から続いている。'}
  ],
  photo:[
   {code:'B-21',title:'座席数の確認票',note:'点呼簿では机の数を訂正していない。椅子の下には、出席前に置かれた足跡が一組残る。',comparison:'平常写真と机の木目は一致する。椅子の向きだけが、誰かを迎えるように変わっている。'},
   {code:'B-22',title:'未記載の肖像',note:'黒板に人物の名前はない。光が届かないはずの壁に、写真を撮った者とは別の立像が残る。',comparison:'平常原本にも黒板の傷はある。しかし立像の周囲だけ、傷が通り抜けている。'},
   {code:'B-23',title:'出席番号の欠番',note:'欠番と記された席に新しい番号が付く。校内の配布物には、最初からその番号が印字されていた。',comparison:'通常の室内写真には番号がない。増えた番号は写真の裏にある管理印と一致している。'}
  ],
  vision:[
   {code:'C-31',title:'遮断前の立会者',note:'踏切の遮断記録は一名。通過前の写真に、渡り終えた者の影だけが残っている。',comparison:'平常時の線路脇に同じ影は見つからない。撮影者は移動していない。'},
   {code:'C-32',title:'横断人数の二重計上',note:'通過人数が記録上では一致するのに、写真で数えると一名余る。余分な影には足元がない。',comparison:'通常原本の遮断機と標識は同じまま。人数だけが検査のたびに合わなくなる。'},
   {code:'C-33',title:'撮影者の背後',note:'カメラの正面には誰もいない。両端に映る影は、それぞれ反対方向から撮影者を見ている。',comparison:'平常原本の画角は一致する。両端の影は、撮影の中心を指している。'}
  ],
  dash:[
   {code:'D-41',title:'路肩の反射物',note:'路肩の反射材は設置記録にない。夜間走行のたび、道路標識より先にこちらへ向きを変える。',comparison:'平常映像にも同じ舗装の傷がある。反射物だけが道路の外へはみ出している。'},
   {code:'D-42',title:'背後車両の光',note:'後方からの二灯が記録にある。該当時刻の車両計数は零、追い越しの記録も存在しない。',comparison:'平常走行でも車道の幅は同じ。後ろの灯りが先行車の影を落としている。'},
   {code:'D-43',title:'対向線の未受理記録',note:'対向車線に人影が残る。報告した運転者の走行経路には、その時間の対向車線が存在しない。',comparison:'通常の路面と白線は一致。人影の下だけ、濡れた舗装の光を返さない。'}
  ]
 };
 const safe=x=>Number.isSafeInteger(x)&&x>0;
 function inspect(sceneId,rarity,rarities){
  const mode=typeof sceneId==='string'&&sceneId.startsWith('alt:')?sceneId.slice(4):'';
  if(!Object.hasOwn(observations,mode)||![1,2,3].includes(rarity)||
   !rarities||typeof rarities!=='object'||Array.isArray(rarities)||!safe(rarities[rarity]))return null;
  const info=observations[mode][rarity-1],hasNormal=safe(rarities[0]);
  return {id:sceneId+':'+rarity,code:info.code,title:info.title,note:info.note,
   comparison:hasNormal?info.comparison:null,verifiedWithNormal:hasNormal};
 }
 return {inspect};
});