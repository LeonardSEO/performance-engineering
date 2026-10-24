import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { handleHook, routePrompt, routeFiles, detectStack } from '../plugins/performance-engineering/scripts/engine.mjs';
const pluginRoot = fileURLToPath(new URL('../plugins/performance-engineering/',import.meta.url));
const cli = path.join(pluginRoot,'scripts/hook.mjs');
function fixture(t, pkg = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'performance-test-'));
  const cwd = path.join(root,'project'), dataRoot = path.join(root,'data');
  fs.mkdirSync(cwd);fs.writeFileSync(path.join(cwd,'package.json'),JSON.stringify(pkg));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const input = (event,extra={}) => ({hook_event_name:event,cwd,session_id:'session',...extra});
  const run = (event,extra={},host='codex') => handleHook(input(event,extra),{host,pluginRoot,dataRoot});
  const write = (relative,content) => { const p = path.join(cwd,relative);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content);return p; };
  return {root,cwd,dataRoot,input,run,write};
}
const context = out => out ? JSON.parse(out).hookSpecificOutput.additionalContext : '';
test('complete evaluation payloads route by the actual opening request',t=>{
  const f=fixture(t),cases=JSON.parse(fs.readFileSync(new URL('../evals/cases.json',import.meta.url)));
  for(const c of cases){
    const prompt=c.prompt+'\n\nThe complete fixture source follows.\n'+JSON.stringify(c.files)+'\n\nFor the spelling-only task follow its output requirement.';
    const out=context(f.run('UserPromptSubmit',{session_id:c.id,prompt}));
    if(!c.domains.length)assert.equal(out,'');
    else assert.ok(c.domains.some(domain=>out.includes(path.sep+domain+path.sep)),c.id);
  }
});
for (const host of ['codex','claude']) {
  test(`${host}: routes only relevant English and Dutch prompts with valid JSON`, t => {
    const f = fixture(t);
    const first=f.run('UserPromptSubmit',{prompt:'Make this slow API faster: N+1 queries and tenant caching.'},host);
    const parsed=JSON.parse(first);assert.equal(parsed.hookSpecificOutput.hookEventName,'UserPromptSubmit');
    assert.match(context(first),/backend-performance/);assert.match(context(first),/data-performance/);
    assert.ok(context(first).length<=3000);
    assert.equal(f.run('UserPromptSubmit',{prompt:'Fix a spelling mistake in README.'},host),'');
    assert.equal(f.run('UserPromptSubmit',{prompt:'Update the performance documentation typo.'},host),'');
    assert.equal(f.run('UserPromptSubmit',{prompt:'Correct the spelling mistake in this README. Do not review code, performance, or tooling.'},host),'');
    const dutch=f.run('UserPromptSubmit',{prompt:'De knop reageert traag; verbeter feedback en opslaan.'},host);
    assert.match(context(dutch),/doherty-threshold/);
  });
  test(`${host}: repeated events deduplicate and compaction restores routing`,t=>{
    const f=fixture(t);
    const task={prompt:'Optimize the LCP image and font bundle.'};
    assert.match(context(f.run('UserPromptSubmit',task,host)),/asset-performance/);
    assert.equal(f.run('UserPromptSubmit',task,host),'');
    const startup=f.run('SessionStart',{source:'compact'},host);
    assert.ok(context(startup).length<=1000);assert.match(context(startup),/performance-engineering/);
    assert.match(context(f.run('UserPromptSubmit',task,host)),/asset-performance/);
  });
  test(`${host}: patch/edit/result formats do not guess arbitrary shell effects`,t=>{
    const f=fixture(t);
    f.write('src/routes/page.js','export const x = 1;');
    const patch=f.run('PostToolUse',{tool_name:'apply_patch',tool_input:{command:'*** Begin Patch\n*** Update File: src/routes/page.js\n@@\n-a\n+b\n*** End Patch'}},host);
    assert.match(context(patch),/progressive-page-rendering/);
    f.write('src/style.css','a {opacity:1}');
    assert.match(context(f.run('PostToolUse',{tool_name:'Edit',tool_input:{file_path:path.join(f.cwd,'src/style.css')}},host)),/rendering-performance/);
    f.write('assets/hero.webp','test');
    assert.match(context(f.run('PostToolUse',{tool_name:'Bash',tool_input:{command:'image-tool'},tool_response:{changed_files:['assets/hero.webp']}},host)),/asset-performance/);
    assert.equal(f.run('PostToolUse',{tool_name:'Bash',tool_input:{command:'python -c "rewrite_everything()"'},tool_response:{stdout:'done'}},host),'');
  });
}
test('native precedence, nested workspace isolation and TSX ambiguity',t=>{
  const f=fixture(t,{dependencies:{next:'16','react-dom':'19'}});
  const native=f.write('apps/mobile/package.json',JSON.stringify({dependencies:{'react-native':'0.87'}}));
  const file=f.write('apps/mobile/src/Screen.tsx','export default function Screen() { return null }');
  assert.equal(detectStack(f.cwd,file),'native');assert.deepEqual(routeFiles([file],f.cwd),['react-native-performance']);
  const generic=f.write('apps/plain/package.json','{}');
  const plain=f.write('apps/plain/View.tsx','export const View = null;');
  assert.equal(detectStack(f.cwd,plain),'generic');assert.deepEqual(routeFiles([plain],f.cwd),[]);
  assert.deepEqual(routePrompt('Optimize animation jank in React Native with Hermes.'),['react-native-performance']);
  assert.ok(!routePrompt('Optimize React Native startup and CSS animation.').includes('rendering-performance'));
});
test('import evidence recognizes native without a framework dependency',t=>{
  const f=fixture(t);
  const file=f.write('src/Button.tsx',"import {View} from 'react-native';");
  assert.deepEqual(routeFiles([file],f.cwd),['react-native-performance']);
});
test('state stores only domain flags; no prompt, code or project files are written',t=>{
  const f=fixture(t);f.write('src/api/route.js','const secret = "SOURCE_SENTINEL";');
  const before=fs.readdirSync(f.cwd,{recursive:true});
  f.run('UserPromptSubmit',{prompt:'Optimize slow N+1 queries. PRIVATE_PROMPT_SENTINEL'});
  const files=fs.readdirSync(path.join(f.dataRoot,'hook-state-v1'));
  assert.equal(files.length,1);const state=fs.readFileSync(path.join(f.dataRoot,'hook-state-v1',files[0]),'utf8');
  assert.doesNotMatch(state,/SENTINEL|project|session|cwd|prompt/);assert.ok(state.length<1024);
  assert.deepEqual(fs.readdirSync(f.cwd,{recursive:true}),before);
});
test('unknown, oversized, malformed and unsafe input fail open',t=>{
  const f=fixture(t);
  assert.equal(handleHook(null,{}),'');assert.equal(handleHook({},{}),'');
  assert.equal(f.run('Stop',{prompt:'slow page'}),'');
  assert.equal(f.run('UserPromptSubmit',{prompt:{text:'slow'}}),'');
  assert.equal(f.run('UserPromptSubmit',{session_id:'',prompt:'slow'}),'');
  assert.equal(f.run('UserPromptSubmit',{prompt:'slow'.repeat(100000)}),'');
  assert.equal(handleHook(f.input('UserPromptSubmit',{prompt:'slow'}),{host:'codex',pluginRoot,dataRoot:f.cwd}),'');
  const bad=spawnSync(process.execPath,[cli,'codex'],{input:'{invalid',encoding:'utf8'});assert.equal(bad.status,0);assert.equal(bad.stdout,'');assert.equal(bad.stderr,'');
  const large=spawnSync(process.execPath,[cli,'codex'],{input:'x'.repeat(1024*1024+1),encoding:'utf8'});assert.equal(large.status,0);assert.equal(large.stdout,'');
});
test('symlinks and out-of-project paths do not disclose external source',t=>{
  const f=fixture(t);const outside=path.join(f.root,'outside');fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside,'Screen.tsx'),"import { View } from 'react-native';");
  try {fs.symlinkSync(outside,path.join(f.cwd,'linked'),'junction');} catch(error) {if(error.code==='EPERM'){t.skip('Symlink privileges unavailable');return;}throw error;}
  assert.deepEqual(routeFiles([path.join(f.cwd,'linked','Screen.tsx')],f.cwd),[]);
  assert.equal(f.run('PostToolUse',{tool_name:'Edit',tool_input:{file_path:path.join(outside,'Screen.tsx')}}),'');
});
test('parallel hooks cannot corrupt state or inject the same domain twice',async t=>{
  const f=fixture(t);const payload=JSON.stringify(f.input('UserPromptSubmit',{prompt:'Optimize LCP image and fonts.'}));
  const run=()=>new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[cli,'codex'],{env:{...process.env,PLUGIN_DATA:f.dataRoot},stdio:['pipe','pipe','pipe']});
    let out='',err='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);child.on('error',reject);
    child.on('close',code=>resolve({code,out,err}));child.stdin.end(payload);
  });
  const results=await Promise.all(Array.from({length:12},run));
  assert.ok(results.every(r=>r.code===0 && !r.err));assert.equal(results.filter(r=>r.out).length,1);
  const stateFiles=fs.readdirSync(path.join(f.dataRoot,'hook-state-v1')).filter(n=>n.endsWith('.json'));
  assert.equal(stateFiles.length,1);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.dataRoot,'hook-state-v1',stateFiles[0]))).domains,['asset-performance']);
});
test('a state-directory symlink cannot create metadata in the user project',t=>{
  const f=fixture(t),link=path.join(f.root,'state-link');
  try {fs.symlinkSync(f.cwd,link,'junction');} catch(error) {if(error.code==='EPERM'){t.skip('Symlink privileges unavailable');return;}throw error;}
  const result=handleHook(f.input('UserPromptSubmit',{prompt:'Optimize slow API queries.'}),{host:'codex',pluginRoot,dataRoot:link});
  assert.equal(result,'');assert.ok(!fs.existsSync(path.join(f.cwd,'hook-state-v1')));
});
test('state count and TTL are bounded; documented opt-out is silent',t=>{
  const f=fixture(t);const dir=path.join(f.dataRoot,'hook-state-v1');fs.mkdirSync(dir,{recursive:true});
  for(let i=0;i<140;i++)fs.writeFileSync(path.join(dir,i.toString(16).padStart(64,'0')+'.json'),'{}');
  f.run('SessionStart',{source:'startup'});
  assert.ok(fs.readdirSync(dir).filter(x=>x.endsWith('.json')).length<=128);
  const result=spawnSync(process.execPath,[cli,'codex'],{input:JSON.stringify(f.input('SessionStart')),encoding:'utf8',env:{...process.env,PERFORMANCE_ENGINEERING_HOOKS:'off'}});
  assert.equal(result.status,0);assert.equal(result.stdout,'');
});

test('routing corpus activates intended guidance and stays silent for unrelated work',()=>{
 const cases=JSON.parse(fs.readFileSync(new URL('../evals/routing.json',import.meta.url)));
 for(const c of cases){
  const actual=routePrompt(c.prompt);
  if(c.silent)assert.deepEqual(actual,[],c.prompt);
  for(const expected of c.includes??[])assert.ok(actual.includes(expected),`${c.prompt}: ${expected} missing from ${actual}`);
  for(const forbidden of c.excludes??[])assert.ok(!actual.includes(forbidden),c.prompt);
  assert.ok(actual.length<=2);
 }
});
test('affected markup uses asset/readiness evidence without auditing plain text edits',t=>{
 const f=fixture(t);
 const image=f.write('index.html','<img src="hero.webp" width="800" height="450" loading="lazy">');
 assert.deepEqual(routeFiles([image],f.cwd),['asset-performance']);
 const ready=f.write('view.svelte','<section aria-busy="true"><img src="a.webp"></section>');
 assert.deepEqual(routeFiles([ready],f.cwd),['asset-performance','progressive-page-rendering']);
 const prose=f.write('about.html','<p>Hello world.</p>');assert.deepEqual(routeFiles([prose],f.cwd),[]);
});
