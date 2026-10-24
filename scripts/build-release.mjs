// Deterministic native and portable ZIPs, using only Node built-ins.
import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url)),meta=JSON.parse(fs.readFileSync(path.join(repo,'plugin.meta.json'))),source=path.join(repo,'plugins',meta.name);
const args=process.argv.slice(2),index=args.indexOf('--out'),out=path.resolve(index>=0?args[index+1]:path.join(repo,'..'));fs.mkdirSync(out,{recursive:true});
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc32=data=>{let c=0xffffffff;for(const b of data)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const f=path.join(dir,e.name);assert.ok(!e.isSymbolicLink(),'Release must not contain symlinks');return e.isDirectory()?walk(f):[f];});}
const files=walk(source).sort().map(file=>({name:path.relative(source,file).split(path.sep).join('/'),body:fs.readFileSync(file)}));
assert.equal(files.filter(f=>f.name.endsWith('/SKILL.md')).length,9);assert.ok(!files.some(f=>f.name==='plugin.json'));
const portable=JSON.parse(fs.readFileSync(path.join(repo,'packaging/portable-plugin.json')));
assert.equal(portable.version,meta.version);assert.equal(portable.extensions['com.openai'].interface.developerName,meta.publisher.name);
assert.deepEqual(portable.extensions['com.openai'].publication.countries,[]);
function zip(entries){const chunks=[],central=[];let offset=0;
 for(const entry of [...entries].sort((a,b)=>a.name.localeCompare(b.name))){
  assert.ok(!entry.name.startsWith('/')&&!entry.name.split('/').includes('..'));const name=Buffer.from(meta.name+'/'+entry.name),data=entry.body,compressed=zlib.deflateRawSync(data),crc=crc32(data);
  const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
  chunks.push(h,name,compressed);
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(0x314,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE((0o100644<<16)>>>0,38);c.writeUInt32LE(offset,42);central.push(c,name);offset+=h.length+name.length+compressed.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...chunks,directory,end]);
}
const results=[];
for(const [kind,entries]of [['native',files],['submission',[...files,{name:'plugin.json',body:Buffer.from(JSON.stringify(portable,null,2)+'\n')}]]]){
 const name=`${meta.name}-v${meta.version}${kind==='native'?'':'-submission'}.zip`,body=zip(entries);fs.writeFileSync(path.join(out,name),body);results.push({kind,name,files:entries.length,bytes:body.length,sha256:crypto.createHash('sha256').update(body).digest('hex')});
}
fs.writeFileSync(path.join(out,`${meta.name}-v${meta.version}-SHA256SUMS.txt`),results.map(r=>r.sha256+'  '+r.name).join('\n')+'\n');console.log(JSON.stringify({version:meta.version,results},null,2));
