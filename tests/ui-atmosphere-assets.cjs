const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const rows=JSON.parse(fs.readFileSync(path.join(root,'assets/ui/atmosphere-manifest.json'),'utf8')).entries;
const css=fs.readFileSync(path.join(root,'assets/physical-ui.css'),'utf8');
assert.deepEqual(rows.map(row=>row.screen).sort(),['archive','lab','menu','report']);
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
function webpSize(buffer){
 assert.equal(buffer.toString('ascii',0,4),'RIFF');
 assert.equal(buffer.toString('ascii',8,12),'WEBP');
 for(let at=12;at+8<=buffer.length;){
  const kind=buffer.toString('ascii',at,at+4),n=buffer.readUInt32LE(at+4),start=at+8;
  assert(start+n<=buffer.length,'truncated WebP');
  if(kind==='VP8X')return [1+buffer.readUIntLE(start+4,3),1+buffer.readUIntLE(start+7,3)];
  if(kind==='VP8 ')return [buffer.readUInt16LE(start+6)&0x3fff,buffer.readUInt16LE(start+8)&0x3fff];
  at=start+n+(n%2);
 }
 throw Error('unsupported WebP');
}
for(const row of rows){
 const png=fs.readFileSync(path.join(root,row.source)),webp=fs.readFileSync(path.join(root,row.output));
 assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
 assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],row.size);
 assert.deepEqual(webpSize(webp),row.size);
 assert.equal(png.length,row.sourceBytes);
 assert.equal(webp.length,row.outputBytes);
 assert.equal(sha(png),row.sourceSha256);
 assert.equal(sha(webp),row.outputSha256);
 assert.match(css,new RegExp(`\\.${row.screen}-scene::before\\s*\\{[^}]*${path.basename(row.output).replaceAll('.','\\.')}`));
}
assert(!/\.agent-home::before\s*\{[^}]*-v1\.webp/.test(css),'screen atmosphere must not leak into observation');
console.log('Archive, laboratory, report and menu atmosphere: original/output dimensions, hashes and scoped CSS verified');
