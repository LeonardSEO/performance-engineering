// Native CLI loading without exporting user credentials or bypassing hook trust.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url)),modules=path.resolve(process.argv[2]??'validation/private/host-clis/node_modules');
const plugin=path.join(repo,'plugins/performance-engineering');
const expected=JSON.parse(fs.readFileSync(path.join(repo,'plugin.meta.json')));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'performance-loaders-'));
function cli(pkg,bin,args,env=process.env){
 const root=path.join(modules,...pkg.split('/')),meta=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
 const entry=typeof meta.bin==='string'?meta.bin:meta.bin[bin];
 const native=entry.endsWith('.exe');
 const result=spawnSync(native?path.join(root,entry):process.execPath,native?args:[path.join(root,entry),...args],{cwd:repo,env,encoding:'utf8',timeout:60000});
 assert.equal(result.status,0,`${bin}: ${result.stderr||result.stdout||result.error}`);return result.stdout;
}
try{
 const version=cli('@openai/codex','codex',['--version']).trim();
 const install=JSON.parse(cli('@openai/codex','codex',['plugin','add','performance-engineering@performance-engineering','--json','-c','marketplaces.performance-engineering.source_type="local"','-c','marketplaces.performance-engineering.source='+JSON.stringify(repo)]));
 const skills=fs.readdirSync(path.join(install.installedPath,'skills'));assert.equal(skills.length,9);
 const codexManifest=JSON.parse(fs.readFileSync(path.join(install.installedPath,'.codex-plugin/plugin.json')));assert.equal(codexManifest.version,expected.version);
 const claudeEnv={...process.env,CLAUDE_CONFIG_DIR:path.join(temp,'claude')};
 const claudeVersion=cli('@anthropic-ai/claude-code','claude',['--version'],claudeEnv).trim();
 cli('@anthropic-ai/claude-code','claude',['plugin','validate',plugin],claudeEnv);
 cli('@anthropic-ai/claude-code','claude',['plugin','validate',path.join(repo,'.claude-plugin/marketplace.json')],claudeEnv);
 cli('@anthropic-ai/claude-code','claude',['plugin','marketplace','add',repo],claudeEnv);
 cli('@anthropic-ai/claude-code','claude',['plugin','install','performance-engineering@performance-engineering'],claudeEnv);
 const inventories=JSON.parse(cli('@anthropic-ai/claude-code','claude',['plugin','list','--json'],claudeEnv));
 const serialized=JSON.stringify(inventories);assert.ok(serialized.includes('performance-engineering@performance-engineering'));
 const report={platform:process.platform,node:process.version,codex:version,claude:claudeVersion,codexInstalledSkills:skills.length,claudeNativeValidation:true,claudeNativeInstallation:true,limits:'Native CLI loading/installation only. No authenticated model turn or Codex hook trust was bypassed. Cross-OS live-agent behavior remains a separate test.'};
 fs.mkdirSync(path.join(repo,'validation/private'),{recursive:true});fs.writeFileSync(path.join(repo,`validation/private/native-loader-${process.platform}.json`),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
