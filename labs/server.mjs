import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {VersionedStore} from './contracts.mjs';
import {page} from './page.mjs';
import {historyPage} from './history-page.mjs';
const generated=fileURLToPath(new URL('./generated/',import.meta.url));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
export async function startLab(port=0){
 const store=new VersionedStore();const counters={revalidationBodies:0};
 const server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://127.0.0.1');
   const json=(status,body,headers={})=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(body));};
   if(url.pathname==='/history'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});return res.end(historyPage);}
   if(url.pathname==='/health')return json(200,{ok:true});
   if(url.pathname==='/lab'||url.pathname==='/'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
    return res.end(page({variant:url.searchParams.get('variant')==='baseline'?'baseline':'improved',scenario:['assets','interaction'].includes(url.searchParams.get('case'))?url.searchParams.get('case'):'loading',fail:url.searchParams.has('fail')}));
   }
   if(url.pathname==='/api/primary'){await delay(100);return json(200,{label:'Primary content ready',items:[1,2,3]});}
   if(url.pathname==='/api/optional'){await delay(650);return json(url.searchParams.has('fail')?503:200,{label:'Optional content ready'});}
   if(url.pathname==='/revalidate'){
    const headers={'ETag':'"catalog-v1"','Last-Modified':'Fri, 23 Oct 2026 00:00:00 GMT','Cache-Control':'public, max-age=0, must-revalidate'};
    if(req.headers['if-none-match']==='"catalog-v1"'){res.writeHead(304,headers);return res.end();}
    counters.revalidationBodies++;return json(200,{items:['public item']},headers);
   }
   if(url.pathname==='/counters')return json(200,counters);
   if(url.pathname==='/preference'){
    // Fixed synthetic test identities, not a production authentication scheme.
    const tenant={'Bearer fixture-a':'a','Bearer fixture-b':'b'}[req.headers.authorization];
    if(!tenant)return json(401,{error:'Fixture identity required'});
    if(req.method==='GET'){const record=store.read(tenant,'preference');return json(200,record,{ETag:`"${record.revision}"`});}
    if(req.method!=='PUT')return json(405,{error:'Use PUT'},{Allow:'GET, PUT'});
    let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)return json(413,{error:'Too large'});}
    const {value}=JSON.parse(body);const result=store.write({tenant,id:'preference',value,ifMatch:req.headers['if-match'],mutationId:req.headers['idempotency-key']});
    // Deliberately lose the response AFTER durable-like fixture state changed.
    if(result.status===200&&url.searchParams.has('drop')){res.destroy();return;}
    return json(result.status,result.record??result.current??{error:'Write rejected'},{...(result.record?{ETag:`"${result.record.revision}"`}:{}),'Idempotency-Replayed':String(!!result.replayed)});
   }
   if(url.pathname.startsWith('/generated/')){
    const name=path.basename(url.pathname);if(!/^hero-(?:original\.png|(?:800|1600)\.webp)$/.test(name))return json(404,{});
    const file=path.join(generated,name);if(!fs.existsSync(file))return json(404,{error:'Run npm run labs:assets'});
    res.writeHead(200,{'Content-Type':name.endsWith('.png')?'image/png':'image/webp','Cache-Control':'no-cache'});return fs.createReadStream(file).pipe(res);
   }
   return json(404,{error:'Unknown fixture route'});
  }catch{if(!res.headersSent){res.writeHead(400,{'Content-Type':'application/json'});res.end('{"error":"Invalid fixture request"}');}else res.destroy();}
 });
 await new Promise(r=>server.listen(port,'127.0.0.1',r));
 return {url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise((r,j)=>{server.close(e=>e?j(e):r());server.closeAllConnections();})};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const lab=await startLab(Number(process.env.PERFORMANCE_LAB_PORT??4173));console.log(lab.url+'/lab?variant=improved&case=loading');
 process.on('SIGINT',async()=>{await lab.close();process.exit(0)});
}
