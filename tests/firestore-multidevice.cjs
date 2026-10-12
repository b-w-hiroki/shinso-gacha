/* Two independent signed-in clients, same UID, against the real Firestore rules
 * emulator and the production CloudSave transaction adapter. No production data. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {initializeTestEnvironment,assertFails,assertSucceeds}=require('@firebase/rules-unit-testing');
const {doc,getDoc,setDoc,deleteDoc,runTransaction}=require('firebase/firestore');
const CloudSave=require('../assets/cloud-save.js');

(async()=>{
 const env=await initializeTestEnvironment({
  projectId:'demo-shinso-security',
  firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firebase/firestore.rules','utf8')}
 });
 try{
  // Separate Firebase client instances simulate two tabs/phones using the same Auth UID.
  const deviceA=env.authenticatedContext('two-device-user').firestore();
  const deviceB=env.authenticatedContext('two-device-user').firestore();
  const other=env.authenticatedContext('another-user').firestore();
  const userA=doc(deviceA,'users/two-device-user'),userB=doc(deviceB,'users/two-device-user');
  const scoutA=doc(deviceA,'scouts/two-device-user'),scoutB=doc(deviceB,'scouts/two-device-user');
  const runA=fn=>runTransaction(deviceA,fn),runB=fn=>runTransaction(deviceB,fn);
  const original={currency:150,observation:{collected:12},levels:{u1:3}};
  assert.equal(await CloudSave.commit(runA,userA,0,original),1);
  const cached=(await getDoc(userB)).data();
  assert.equal(cached.revision,1);
  assert.deepEqual(cached.state,original);

  // Both clients use revision 1. The winner's progress must not be overwritten.
  const outcomes=await Promise.allSettled([
   CloudSave.commit(runA,userA,1,{...original,currency:151}),
   CloudSave.commit(runB,userB,cached.revision,{...original,currency:999})
  ]);
  assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1,'only one device may save the same revision');
  assert.equal(outcomes.filter(x=>x.status==='rejected').length,1);
  const loserCode=outcomes.find(x=>x.status==='rejected').reason.code;
  // A true overlapping Firestore transaction can be rejected by security rules
  // before the client retries and reports the application-level CAS conflict.
  // Both are safe failures; the server's winning revision is authoritative.
  assert(['save-conflict','permission-denied'].includes(loserCode),
   'stale writer must receive a conflict or rules denial, not silently succeed: '+loserCode);
  const beforeDelete=(await getDoc(userA)).data();
  assert.equal(beforeDelete.revision,2);
  assert([151,999].includes(beforeDelete.state.currency));
  assert.equal(beforeDelete.state.observation.collected,12);
  await assertFails(getDoc(doc(other,'users/two-device-user')));

  // A lost offline client can still hold its old revision when another device erases.
  await assertSucceeds(setDoc(scoutA,{day:'2026-10-12',todayLv:2,total:12,lv5:0}));
  await CloudSave.erase(runA,userA,scoutA);
  const tombstone=(await getDoc(userB)).data();
  assert.deepEqual(tombstone.state,{accountDeleted:true},'no evidence or personal progress survives the deletion');
  assert.equal(tombstone.revision,3);
  assert.equal((await getDoc(scoutB)).exists(),false,'public aggregate was atomically erased');
  await assert.rejects(CloudSave.commit(runB,userB,2,{...original,currency:5000}),e=>e.code==='account-deleted');
  await assert.rejects(CloudSave.commit(runA,userA,3,original),e=>e.code==='account-deleted');

  // Rules independently reject a stale/offline client attempting to bypass the adapter.
  await assertFails(setDoc(userB,{state:original,revision:4}));
  await assertFails(deleteDoc(userB));
  await assertFails(setDoc(scoutB,{day:'2026-10-12',todayLv:1,total:1,lv5:0}));
  await assertFails(setDoc(doc(other,'users/two-device-user'),{state:original,revision:4}));
  await CloudSave.erase(runB,userB,scoutB);
  assert.deepEqual((await getDoc(userA)).data(),tombstone,'retry cannot regenerate the deleted record');
  console.log('Two Firebase clients: concurrent revision conflict, atomic erasure, stale client and direct-rule resurrection denied');
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1;});
