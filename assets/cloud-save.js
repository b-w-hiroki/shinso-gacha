/* Compare-and-swap the whole saved game. Transaction retries never mutate UI/state. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CloudSave=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>({
 async commit(runTransaction,ref,expected,state){
  if(!Number.isInteger(expected)||expected<0)throw {code:'save-uninitialized'};
  const snapshot=JSON.parse(JSON.stringify(state));
  return runTransaction(async tx=>{
   const doc=await tx.get(ref),data=doc.exists()?doc.data():null,revision=Number.isInteger(data?.revision)?data.revision:0;
   if(data?.state?.accountDeleted)throw {code:'account-deleted'};
   if(revision!==expected)throw {code:'save-conflict'};
   tx.set(ref,{state:snapshot,revision:revision+1});return revision+1;
  });
 },
 async erase(runTransaction,ref,scoutRef){
  return runTransaction(async tx=>{
   const snap=await tx.get(ref),data=snap.exists()?snap.data():null;
   if(!data?.state?.accountDeleted)tx.set(ref,{state:{accountDeleted:true},revision:(Number.isInteger(data?.revision)?data.revision:0)+1});
   tx.delete(scoutRef);
  });
 }
}));
