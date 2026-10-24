import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
const root=fileURLToPath(new URL('../',import.meta.url)),plugin=path.join(root,'plugins/performance-engineering');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const meta=read('plugin.meta.json');
assert.match(meta.version,/^\d+\.\d+\.\d+$/);
const manifests=['plugin.json','.codex-plugin/plugin.json','.claude-plugin/plugin.json'];
for(const name of manifests){const obj=JSON.parse(fs.readFileSync(path.join(plugin,name)));assert.equal(obj.name,meta.name);assert.equal(obj.version,meta.version);}
const portable=JSON.parse(fs.readFileSync(path.join(plugin,'plugin.json')));
assert.equal(portable.$schema,'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.ok(portable.extensions['com.openai'].interface.shortDescription.length<=30);
assert.ok(portable.extensions['com.openai'].interface.defaultPrompt.length<=128);
for(const forbidden of ['skills','mcpServers','apps','interface'])assert.ok(!Object.hasOwn(portable,forbidden));
for(const host of ['codex','claude']){
 const config=JSON.parse(fs.readFileSync(path.join(plugin,`hooks/${host}.json`)));
 assert.deepEqual(Object.keys(config.hooks),['SessionStart','UserPromptSubmit','PostToolUse']);
 for(const groups of Object.values(config.hooks))for(const group of groups)for(const hook of group.hooks){assert.equal(hook.type,'command');assert.equal(hook.timeout,2);assert.ok(hook.command.endsWith(` ${host}`));assert.doesNotMatch(hook.command,/bypass|curl|wget/);}
}
const catalogs=[read('.agents/plugins/marketplace.json'),read('.claude-plugin/marketplace.json')];
for(const c of catalogs){assert.equal(c.name,meta.name);assert.equal(c.plugins.length,1);assert.equal(c.plugins[0].name,meta.name);}
const names=fs.readdirSync(path.join(plugin,'skills')).sort();assert.equal(names.length,9);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let links=0;
for(const name of names){
 const skill=path.join(plugin,'skills',name,'SKILL.md'),content=fs.readFileSync(skill,'utf8');
 const yaml=content.match(/^---\r?\n([\s\S]*?)\r?\n---/);assert.ok(yaml,skill);
 const front=parse(yaml[1]);assert.equal(front.name,name);assert.ok(typeof front.description==='string'&&front.description.length>30);
 assert.ok(Buffer.byteLength(content)<1024*1024);assert.doesNotMatch(content,/\bTODO\b|\[INSERT/);
 const ui=parse(fs.readFileSync(path.join(plugin,'skills',name,'agents/openai.yaml'),'utf8'));
 assert.ok(ui.interface.display_name&&ui.interface.short_description);assert.ok(ui.interface.default_prompt.includes('$'+name));
}
for(const file of walk(plugin).filter(f=>f.endsWith('.md'))){
 const content=fs.readFileSync(file,'utf8');assert.doesNotMatch(content,/\/Users\/|C:\\Users\\/);
 for(const m of content.matchAll(/\]\(([^)]+)\)/g)){
  if(/^[a-z]+:\/\//.test(m[1])||m[1].startsWith('#'))continue;
  const dest=path.resolve(path.dirname(file),m[1].split('#')[0]);assert.ok(dest.startsWith(plugin+path.sep),`${file}: external local link`);assert.ok(fs.existsSync(dest),`${file}: ${m[1]}`);links++;
 }
}
for(const license of fs.readdirSync(path.join(root,'licenses')))assert.equal(fs.readFileSync(path.join(root,'licenses',license),'utf8'),fs.readFileSync(path.join(plugin,'licenses',license),'utf8'));
const lock=read('docs/sources.lock.json');assert.equal(lock.sources.length,6);assert.ok(lock.sources.every(s=>Object.values(s.file_sha256).every(h=>/^[a-f0-9]{64}$/.test(h))));
assert.equal(read('package.json').version,meta.version);
console.log(`Validated 9 skills, ${links} local references, manifests, hook adapters, catalogs, source hashes and notices.`);
