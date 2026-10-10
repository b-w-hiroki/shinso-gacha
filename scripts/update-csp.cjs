const fs=require('fs'),crypto=require('crypto');
const path='index.html',html=fs.readFileSync(path,'utf8');
const hashes=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>"'sha256-"+crypto.createHash('sha256').update(m[1]).digest('base64')+"'");
const policy=`default-src 'self'; script-src 'self' ${hashes.join(' ')} https://www.gstatic.com/firebasejs/ https://cdn.jsdelivr.net/npm/budoux@0.9.3/ https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://shinso-gacha.firebaseapp.com; frame-src https://shinso-gacha.firebaseapp.com https://accounts.google.com; object-src 'none'; base-uri 'none'; form-action 'none'`;
const tag=`<meta http-equiv="Content-Security-Policy" content="${policy}">`;
const updated=html.includes('http-equiv="Content-Security-Policy"')?html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,tag):html.replace('<meta charset="utf-8">','<meta charset="utf-8">\n'+tag+'\n<meta name="referrer" content="strict-origin-when-cross-origin">');
if(process.argv.includes('--check')){if(updated!==html)throw Error('CSP hash stale: run node scripts/update-csp.cjs');}else fs.writeFileSync(path,updated);
