const fs=require('node:fs');
const {execFileSync}=require('node:child_process');

const documents=[
 ['docs/CURRENT-SPEC.md','仕様書'],
 ['docs/EXPERIENCE-DESIGN.md','設計書']
];

function isProductChange(file){
 return file==='index.html'||file.startsWith('assets/')||file.startsWith('firebase/')||
  file==='manifest.webmanifest'||file==='service-worker.js';
}

function noImpactReason(body,label){
 const line=body.split(/\r?\n/).find(row=>new RegExp(`^\\s*(?:-\\s*)?${label}:`).test(row));
 const match=line?.match(/^\s*(?:-\s*)?[^:]+:\s*影響なし\s*[—–-]\s*(.+)$/);
 const reason=match?.[1].trim()||'';
 if(reason.length<12||/^(?:理由を記入|未記入|なし|変更なし|該当なし|n\/a|todo)/i.test(reason))return null;
 return reason;
}

function check(changedFiles,body=''){
 const product=changedFiles.filter(isProductChange);
 if(!product.length)return {product,errors:[]};
 const errors=[];
 for(const [file,label] of documents){
  if(!changedFiles.includes(file)&&!noImpactReason(body,label)){
   errors.push(`${label} ${file} を更新するか、PR本文に「${label}: 影響なし — 具体的な理由」を記入してください。`);
  }
 }
 return {product,errors};
}

if(require.main===module){
 try{
  const eventPath=process.env.GITHUB_EVENT_PATH;
  if(!eventPath)throw Error('GITHUB_EVENT_PATH is required');
  const event=JSON.parse(fs.readFileSync(eventPath,'utf8'));
  if(!event.pull_request){console.log('Spec/design sync: pull request only; skipped');process.exit(0);}
  const base=event.pull_request.base.sha,head=event.pull_request.head.sha;
  if(!/^[0-9a-f]{40}$/i.test(base)||!/^[0-9a-f]{40}$/i.test(head))throw Error('Invalid PR commit SHA');
  const files=execFileSync('git',['diff','--name-only','-z',`${base}...${head}`],{encoding:'utf8'}).split('\0').filter(Boolean);
  const result=check(files,event.pull_request.body||'');
  if(result.errors.length){console.error(result.errors.join('\n'));process.exitCode=1;}
  else console.log(`Spec/design sync: ${result.product.length} product files checked; documentation or explicit no-impact reasons present`);
 }catch(error){console.error('Spec/design sync: '+error.message);process.exitCode=1;}
}

module.exports={check,isProductChange,noImpactReason};
