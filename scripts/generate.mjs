import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const m = JSON.parse(fs.readFileSync(path.join(root,'plugin.meta.json'),'utf8'));
const folder = 'plugins/performance-engineering';
const write = (file, value) => {
  const full = path.join(root,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,JSON.stringify(value,null,2)+'\n');
};
const identity = {name:m.name,version:m.version,description:m.description,author:m.author,repository:m.repository,homepage:m.repository,license:m.license};
const iface = {displayName:m.displayName,shortDescription:m.shortDescription,longDescription:m.description,developerName:m.author.name,category:'Developer Tools',capabilities:[],defaultPrompt:'Diagnose the bottleneck, select relevant skills, preserve correctness, and compare equivalent measurements.'};
// Codex 0.163 skips hooks for a portable manifest selected at the runtime root.
// Keep its portable export manifest separate from the native runtime package.
write('packaging/portable-plugin.json',{$schema:'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',...identity,extensions:{'com.openai':{interface:iface,hooks:'./hooks/codex.json'}}});
const rootManifest = path.join(root, folder, 'plugin.json');
if (fs.existsSync(rootManifest)) {
  if (JSON.parse(fs.readFileSync(rootManifest,'utf8')).name !== m.name) throw new Error('Refusing to remove an unrelated manifest');
  fs.unlinkSync(rootManifest);
}
write(`${folder}/.codex-plugin/plugin.json`,{...identity,skills:'./skills/',hooks:'./hooks/codex.json',interface:iface});
write(`${folder}/.claude-plugin/plugin.json`,{...identity,hooks:'./hooks/claude.json'});
for (const host of ['codex','claude']) {
  const variable = host === 'codex' ? 'PLUGIN_ROOT' : 'CLAUDE_PLUGIN_ROOT';
  const command = `node "\${${variable}}/scripts/hook.mjs" ${host}`;
  const handler = {type:'command',command,timeout:2};
  write(`${folder}/hooks/${host}.json`,{hooks:{SessionStart:[{hooks:[handler]}],UserPromptSubmit:[{hooks:[handler]}],PostToolUse:[{matcher:'^(Write|Edit|MultiEdit|apply_patch|Bash)$',hooks:[handler]}]}});
}
write('.agents/plugins/marketplace.json',{name:m.name,interface:{displayName:m.displayName},plugins:[{name:m.name,source:{source:'local',path:`./${folder}`},policy:{installation:'AVAILABLE',authentication:'ON_USE'},category:'Developer Tools'}]});
write('.claude-plugin/marketplace.json',{name:m.name,owner:m.author,metadata:{description:m.description},plugins:[{name:m.name,source:`./${folder}`,version:m.version,description:m.description}]});
console.log('Generated synchronized manifests, catalogs and host hook adapters.');
