/* Fictional follow-up dossiers; original file IDs/rarities and reward rolls are unchanged. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LegendModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const CASES={
 u1:{mode:'cctv',member:'senior',families:['space','time'],fragments:[['匿名投稿','同じ老人と三度すれ違った。三度目だけ、老人は私と同じ顔だった。'],['監視写真','通路の出口番号は違うが、壁の傷は三枚とも一致する。'],['巡回票','三回分の巡回が、同じ一分間に記録されている。']],original:'署名欄はあなたの筆跡。巡回予定日は明日になっている。',witness:'通路ではなく、戻ったと思った瞬間を調べろ。出口の番号は証拠にならない。',seep:'出口：この画面のひとつ前',odd:'三輪が、あなたの言葉より先に同じ返事をする。「この話は三度目だ」'},
 u2:{mode:'dash',member:'equipment',families:['space','time'],fragments:[['匿名投稿','終電を降りた人が、路線図にない駅名を送ってきた。'],['乗車記録','改札の出場履歴だけがあり、対応する入場履歴がない。'],['駅の写真','駅名標の裏に、撮影者の帰宅先と同じ番地が書かれている。']],original:'未運行の列車から、あなた宛ての遺失物通知が届いている。',witness:'位置情報は線路上ではない。この課の座標から送られている。',seep:'次の停車駅：第六文書課',odd:'榊が車内放送と同じ調子で言う。「まもなく、あなたの降りる場所です」'},
 u3:{mode:'photo',member:'records',families:['memory','presence'],fragments:[['匿名投稿','片付けた人形が、翌朝には机の反対側を向いていた。'],['室内写真','撮影者は一人。机の下には二人分の影がある。'],['回収票','人形は回収済み。回収者の名前だけが、人形の呼び名に変わっている。']],original:'空の箱から、あなたの声を記録した音声の書き起こしが出てきた。',witness:'回収したのは人形ではなく、呼び名のほうかもしれません。',seep:'参加者：あなた、もう一人',odd:'白瀬が空席に報告書を差し出す。「隠れている方の署名も必要です」'},
 u4:{mode:'vision',member:'senior',families:['body'],fragments:[['聞き取り','通学路で声をかけられた。顔ではなく、返事を覚えているという。'],['目撃写真','別々の場所で撮られた人物の口元だけが、同じ形にぶれている。'],['照合記録','撮影時刻は同じ。三人は互いに面識がない。']],original:'あなたがまだ答えていない質問への返事が、記録に残っている。',witness:'顔の特徴は一致しない。質問の言い方だけが、全員同じだ。',seep:'返答は、すでに受領しています',odd:'三輪が笑ったまま話す。「今の返事で、合っていたか」'},
 u5:{mode:'photo',member:'equipment',families:['device','presence'],fragments:[['着信メモ','処分した人形の名前を名乗る声が、駅前からかけてきた。'],['通信記録','通話のたびに近づく住所。発信基地局の欄は空白のまま。'],['室内写真','電話線は抜けている。受話器の影だけが、背後へ伸びている。']],original:'次の着信の書き起こしは「もう読んでいるのね」で終わっている。',witness:'接続先を追うな。記録にある距離は、電話からではなく君から測られている。',seep:'内線：あなたの後ろ',odd:'榊が受話器を持たずに相槌を打つ。「今、後ろまで来たそうです」'},
 u6:{mode:'cctv',member:'records',families:['paper','space'],fragments:[['聞き取り','使われていない校舎から、三度だけ返事があった。'],['校舎図面','奥の個室は二つ。目撃証言はすべて三つ目を指している。'],['点検票','封鎖した扉の内側に、今朝の点検印が押されている。']],original:'あなたの職員番号で、閉鎖校舎への入構許可が申請されている。',witness:'図面を書き直した人は、扉を一つも消していないと言っています。',seep:'三つ目の窓口で、お待ちしています',odd:'白瀬が誰もいない扉へ三度うなずく。「はい、今お呼びします」'},
 u7:{mode:'vision',member:'senior',families:['body','presence'],fragments:[['匿名投稿','田の向こうの白いものを見た。形を説明しようとすると言葉が出ない。'],['遠景写真','周囲の稲は静止している。その輪郭だけが、複数の方向へぶれている。'],['聞き取り記録','目撃者の説明は一致しないが、全員が途中で同じ単語を消している。']],original:'黒塗りの原本に、あなたが今考えた説明と同じ文字数の跡がある。',witness:'正体を当てようとするな。説明が一致しないこと自体を残せ。',seep:'名称欄を、埋めないでください',odd:'三輪の肩だけが、椅子の背と違う方向へ傾いている。「説明しなくていい」'},
 u8:{mode:'vision',member:'equipment',families:['device'],fragments:[['画面の記録','閉じたはずの赤い窓が、別の端末にも残っていた。'],['通信ログ','窓が現れた時刻には、外部への通信は一件もない。'],['保存画像','赤い領域の端に、画面を見ている人の部屋が写り込んでいる。']],original:'削除済みの画像に、これから押すボタンの位置が記録されている。',witness:'表示装置を交換しても残る。どこから送られたか、という前提が違う。',seep:'この窓は、向こう側で開かれています',odd:'榊が消えた画面に向かって言う。「まだ閉じないでください。こちらが消えます」'},
 u9:{mode:'cctv',member:'senior',families:['body','memory'],fragments:[['目撃談','夜道で犬に道を尋ねられた。声だけは、知っている人だった。'],['防犯写真','四足の影の上に、人の顔のような輪郭がある。'],['音声記録','聞き取れた名前は目撃者自身。呼び声は録音開始前から続いている。']],original:'あなたの顔に似た線が、画像の未現像部分にだけ残っている。',witness:'顔が似ていたのか、声を聞いてから似て見えたのか。それを分けて書け。',seep:'呼ばれても、振り向かないこと',odd:'三輪の足元から声がする。本人は口を閉じたまま、首を横に振っている。'},
 u10:{mode:'dash',member:'records',families:['body','time'],fragments:[['匿名投稿','踏切の向こうから、地面を叩く音だけが近づいてきた。'],['路面写真','擦過痕が線路をまたいでいる。反対側に始点がない。'],['通報記録','同じ音の通報が、離れた二地点で同時に受理されている。']],original:'次の通報者の欄は、あなたの名前で埋まっている。',witness:'音の速さではありません。報告された距離だけが、短くなっています。',seep:'接近記録：距離、不明',odd:'白瀬が机の下の音に合わせて、同じ受領印を押し続けている。'},
 u11:{mode:'photo',member:'records',families:['presence','memory'],fragments:[['相談記録','友人に家の外へ連れ出された。理由は帰宅後まで教えてもらえなかった。'],['室内写真','寝台の下だけが、照明の向きに関係なく暗い。'],['入室記録','在室人数が一人多い。追加された人の入室履歴はない。']],original:'寝台の下から撮られた、あなたが資料を読む姿の写真。',witness:'見つけた人の証言がありません。見られていた人の証言だけです。',seep:'在室人数：一名超過',odd:'白瀬があなたの椅子の下へ挨拶する。「先にいらしていたんですね」'},
 u12:{mode:'dash',member:'senior',families:['time','memory'],fragments:[['夢の手記','同じ列車に乗る夢を見た。翌朝、停車駅の順序だけを覚えていた。'],['録音記録','眠っている間の部屋から、車内案内に似た声が録音されている。'],['時刻表','夢で聞いた駅名の横に、目撃者が起きる時刻が並んでいる。']],original:'次の駅名は、まだ誰にも話していないあなたの夢の中の言葉。',witness:'続きを見るために眠るな。起きてからの記録と、別々に保管しておけ。',seep:'次は、目が覚めたあとの駅です',odd:'三輪が目を閉じたまま言う。「まだ降りていないのか」'}
 };
 const affinities={u1:[2],u2:[2],u3:[1,2],u4:[3],u5:[3],u6:[3],u7:[2],u8:[2,3],u9:[2],u10:[3],u11:[2,3],u12:[1,2]};
 for(const [id,rarities] of Object.entries(affinities))CASES[id].rarities=rarities;
 const ids=Object.keys(CASES),has=id=>Object.hasOwn(CASES,id);
 const count=(levels,id)=>has(id)?Math.min(3,Math.max(0,Math.floor(Number(levels?.[id])||0))):0;
 function state(raw,levels){
  const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  s.active=has(s.active)&&count(levels,s.active)===3?s.active:null;
  for(const k of ['testified','conclusions']){const old=s[k];s[k]=Object.fromEntries(ids.filter(id=>count(levels,id)===3&&(k==='testified'?old?.[id]===true:[0,1].includes(old?.[id]))).map(id=>[id,old[id]]));}
  return s;
 }
 function start(s,levels,id){if(count(levels,id)!==3)return false;s.active=id;return true;}
 function related(id,kind,profile){return has(id)&&Number.isInteger(kind)&&kind>=0&&kind<100&&CASES[id].families.includes(profile(kind).family);}
 function evidence(id,collection,discovered,profile){
  if(!has(id))return null;const c=CASES[id];
  const observation=[1,2,3,0].find(r=>Number(collection?.[c.mode+':'+r])>0);
  if(observation!==undefined)return {mode:c.mode,rarity:observation};
  const incident=Object.keys(discovered||{}).map(Number).filter(k=>discovered[k]===true&&related(id,k,profile)).sort((a,b)=>a-b)[0];
  return incident===undefined?null:{incident};
 }
 function conclude(s,levels,id,choice,proof){if(count(levels,id)!==3||!s.testified[id]||!proof||![0,1].includes(choice)||Object.hasOwn(s.conclusions,id))return false;s.conclusions[id]=choice;return true;}
 return {CASES,ids,count,state,start,related,evidence,conclude};
});
