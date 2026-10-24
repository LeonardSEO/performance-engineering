export function page({variant='improved',scenario='loading',fail=false}){
 const improved=variant==='improved';
 const image=improved?'<img id="hero" src="/generated/hero-800.webp" srcset="/generated/hero-800.webp 800w, /generated/hero-1600.webp 1600w" sizes="800px" width="2400" height="1350" fetchpriority="high" alt="Synthetic colored circles">':'<img id="hero" src="/generated/hero-original.png" alt="Synthetic colored circles">';
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Performance lab</title>
 <style>body{font:18px system-ui;max-width:800px;margin:32px auto;background:#111714;color:#f3f2e9}button{padding:16px}img{max-width:100%;height:auto}#primary{min-height:90px}#optional{min-height:70px}a{color:#c4fa75}</style>
 <header id="shell"><h1>Performance lab</h1><p>Controlled synthetic fixture: ${variant} / ${scenario}</p></header>
 <button id="action">Run work</button><p id="status" role="status">Ready</p><section id="primary" aria-busy="true">Loading primary…</section><section id="optional">Loading optional…</section>
 ${scenario==='assets'?image:''}<script type="module">
 const improved=${improved}, scenario=${JSON.stringify(scenario)}, fail=${fail};
 const state={variant:${JSON.stringify(variant)},scenario,completedJobs:0,longTasks:[],marks:{},restoreEvents:[]};
 window.lab={state,snapshot:()=>structuredClone(state)};
 try{new PerformanceObserver(list=>state.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true})}catch{}
 const stamp=name=>{state.marks[name]=performance.now();performance.mark(name)};
 const read=async url=>{const r=await fetch(url);if(!r.ok)throw Error('HTTP '+r.status);return r.json()};
 const showPrimary=data=>{document.querySelector('#primary').textContent=data.label;document.querySelector('#primary').setAttribute('aria-busy','false');stamp('primary');};
 const showOptional=data=>{document.querySelector('#optional').textContent=data.label;stamp('optional');};
 const primary=read('/api/primary'), optional=read('/api/optional'+(fail?'?fail=1':''));
 if(improved){primary.then(showPrimary).catch(()=>document.querySelector('#primary').textContent='Primary failed');optional.then(showOptional).catch(()=>{document.querySelector('#optional').textContent='Optional failed';stamp('optionalError')});}
 else{Promise.all([primary,optional]).then(([a,b])=>{showPrimary(a);showOptional(b)}).catch(()=>document.querySelector('#status').textContent='Page failed');}
 const yieldMain=()=>globalThis.scheduler?.yield?globalThis.scheduler.yield():new Promise(r=>setTimeout(r,0));
 function job(){const end=performance.now()+1;while(performance.now()<end){}state.completedJobs++;}
 document.querySelector('#action').onclick=async()=>{
  stamp('tap');document.querySelector('#status').textContent='Working';
  requestAnimationFrame(()=>requestAnimationFrame(()=>stamp('acknowledgmentProxy')));
  if(improved)await yieldMain();
  for(let i=0;i<120;i++){job();if(improved&&i%6===5)await yieldMain();}
  stamp('done');document.querySelector('#status').textContent='Done';
 };
 if(scenario==='assets')document.querySelector('#hero').decode().then(()=>stamp('imageDecoded'));
 window.addEventListener('pageshow',event=>{state.restoreEvents.push({persisted:event.persisted});});
 </script></html>`;
}
