const fs=require('fs'),{initializeTestEnvironment,assertFails,assertSucceeds}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc}=require('firebase/firestore');
(async()=>{const env=await initializeTestEnvironment({projectId:'demo-shinso-security',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firebase/firestore.rules','utf8')}});try{
 const a=env.authenticatedContext('alice').firestore(),b=env.authenticatedContext('bob').firestore(),anon=env.unauthenticatedContext().firestore();
 await assertSucceeds(setDoc(doc(a,'users/alice'),{state:{currency:30},revision:1}));
 await assertFails(getDoc(doc(b,'users/alice')));await assertFails(getDoc(doc(anon,'users/alice')));
 await assertFails(setDoc(doc(b,'users/alice'),{state:{},revision:2}));
 await assertFails(setDoc(doc(a,'users/alice'),{state:{},revision:1}));
 await assertFails(setDoc(doc(a,'users/alice'),{state:{}}));
 await assertFails(setDoc(doc(a,'users/alice'),{state:'bad',revision:2}));
 await assertFails(setDoc(doc(a,'users/alice'),{state:{},revision:2,secret:'bad'}));
 await assertSucceeds(setDoc(doc(a,'users/alice'),{state:{currency:31},revision:2}));
 await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'users/legacy'),{state:{currency:1}}));
 await assertSucceeds(setDoc(doc(env.authenticatedContext('legacy').firestore(),'users/legacy'),{state:{currency:1},revision:1}));
 const scout={day:'2026-10-10',todayLv:1,total:5,lv5:0};
 await assertSucceeds(setDoc(doc(a,'scouts/alice'),scout));await assertSucceeds(getDoc(doc(anon,'scouts/alice')));
 await assertFails(setDoc(doc(b,'scouts/alice'),scout));await assertFails(setDoc(doc(a,'scouts/alice'),{...scout,total:999}));await assertFails(setDoc(doc(a,'scouts/alice'),{...scout,email:'private'}));
 await assertFails(setDoc(doc(a,'unexpected/alice'),{}));console.log('Owner isolation, save schema/revisions/legacy migration, public aggregate bounds and default deny passed');
 }finally{await env.cleanup();}})().catch(e=>{console.error(e);process.exitCode=1;});
