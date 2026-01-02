import { BASE_VARIABLES, OCEAN_BREEZE_THEME } from "./themes";

export function getHTMLWrapper(
  html: string,
  title = "Untitled",
  theme_style?: string,
  frameId?: string,
  wireframe?: boolean
) {
  const finalTheme = theme_style || OCEAN_BREEZE_THEME;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>

  <script>
    (function(){
      try{
        var dm = (navigator as any).deviceMemory || 4;
        var hc = (navigator && navigator.hardwareConcurrency) || 4;
        var et = (navigator as any).connection && (navigator as any).connection.effectiveType || '4g';
        var low = (dm && dm <= 2) || (hc && hc <= 4) || (/^(slow-2g|2g|3g)$/).test(String(et));
        (window as any).__quality = low ? 'low' : 'high';
        document.documentElement.classList.toggle('quality-low', !!low);
      }catch(e){
        (window as any).__quality = 'high';
      }
    })();
  </script>
  <script>
    (function(){
      // Inject fonts only for non-low quality devices
      if((window as any).__quality !== 'low'){
        var fonts = [
          'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap',
          'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap',
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap',
          'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
        ];
        fonts.forEach(function(href){
          var link=document.createElement('link');
          link.rel='stylesheet';
          link.href=href;
          document.head.appendChild(link);
        });
      }
    })();
  </script>

  <!-- Tailwind + Iconify -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>


  <style type="text/tailwindcss">
    :root {${BASE_VARIABLES}${finalTheme}}
    *, *::before, *::after {margin:0;padding:0;box-sizing:border-box;}
    html, body {width:100%;min-height:100%;}
    body {font-family:var(--font-sans);background:var(--background);color:var(--foreground);-webkit-font-smoothing:antialiased;}
    #root {width:100%;min-height:100vh;}
    * {scrollbar-width:none;-ms-overflow-style:none;}
    *::-webkit-scrollbar {display:none;}
    /* Low-end overrides */
    .quality-low * { transition: none !important; animation: none !important; }
    .quality-low [class*="backdrop-blur"] { backdrop-filter: none !important; }
    .quality-low [class*="shadow-"] { box-shadow: none !important; }
    .quality-low [class*="drop-shadow"] { filter: none !important; }
    .quality-low .glassmorphic { backdrop-filter: none !important; }
    .quality-low section, .quality-low main { content-visibility: auto; contain-intrinsic-size: 800px; }
    .quality-low img { image-rendering: -webkit-optimize-contrast; }
    /* Wireframe mode */
    .wireframe {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important;
      --background: #ffffff;
      --foreground: #000000;
      --card: #ffffff;
      --card-foreground: #000000;
      --popover: #ffffff;
      --popover-foreground: #000000;
      --primary: #000000;
      --primary-rgb: 0,0,0;
      --primary-foreground: #ffffff;
      --secondary: #ffffff;
      --secondary-foreground: #000000;
      --accent: #000000;
      --accent-foreground: #ffffff;
      --muted: #ffffff;
      --muted-foreground: #000000;
      --destructive: #000000;
      --border: #111111;
      --input: #111111;
      --ring: #111111;
      --radius: 0px;
    }
    .wireframe *, .wireframe *::before, .wireframe *::after { transition: none !important; box-shadow: none !important; filter: grayscale(100%) saturate(0) !important; }
    .wireframe img, .wireframe video, .wireframe canvas { filter: grayscale(100%) contrast(120%) !important; opacity: 0.8 !important; }
    .wireframe [class*="rounded"], .wireframe * { border-radius: 0 !important; }
    .wireframe section, .wireframe header, .wireframe footer, .wireframe main, .wireframe aside, .wireframe article, .wireframe div, .wireframe nav { border: 2px solid var(--border) !important; background: #ffffff !important; }
    .wireframe button, .wireframe input, .wireframe textarea, .wireframe select { background: #ffffff !important; color: #000000 !important; border: 2px solid var(--border) !important; }
    .wireframe [class*="bg-"], .wireframe [class*="from-"], .wireframe [class*="to-"], .wireframe [class*="via-"] { background: #ffffff !important; }
    .wireframe [class*="text-"] { color: #000000 !important; }
    .wireframe [class*="ring-"], .wireframe [class*="border-"] { border-color: var(--border) !important; }
    .wireframe [class*="shadow"] { box-shadow: none !important; }
    .wireframe iconify-icon { color: #000 !important; }
    .wireframe a { color: #000000 !important; text-decoration: underline dotted; }
  </style>
</head>
<body class="${wireframe ? "wireframe" : ""}">
  <div id="root">
  <div class="relative">
    ${html}
  </div>
  <script>
    (()=>{
      const fid='${frameId}';
      const send=()=>{
        const r=document.getElementById('root')?.firstElementChild;
        const h=r?.className.match(/h-(screen|full)|min-h-screen/)?Math.max(800,innerHeight):Math.max(r?.scrollHeight||0,document.body.scrollHeight,800);
        parent.postMessage({type:'FRAME_HEIGHT',frameId:fid,height:h},'*');
      };
      setTimeout(send,100);
      setTimeout(send,500);
    })();
  </script>

  <script>
    (()=>{
      const fid='${frameId}';
      let enabled=false;
      let currentEl=null;
      const overlay=document.createElement('div');
      overlay.style.position='fixed';
      overlay.style.pointerEvents='none';
      overlay.style.zIndex='2147483647';
      overlay.style.border='2px solid rgba(var(--primary-rgb,59,130,246),0.7)';
      overlay.style.borderRadius='12px';
      overlay.style.boxShadow='0 0 16px rgba(var(--primary-rgb,59,130,246),0.5)';
      overlay.style.background='transparent';
      overlay.style.display='none';
      document.body.appendChild(overlay);
      const selected=new Set();
      const selectionOverlays=new Map();
      const groupOverlay=document.createElement('div');
      groupOverlay.style.position='fixed';
      groupOverlay.style.pointerEvents='none';
      groupOverlay.style.zIndex='2147483645';
      groupOverlay.style.border='2px dashed rgba(var(--ring-rgb,59,130,246),0.75)';
      groupOverlay.style.borderRadius='10px';
      groupOverlay.style.background='transparent';
      groupOverlay.style.display='none';
      document.body.appendChild(groupOverlay);
      let marquee=null;
      let dragStart=null;
      const locked=new Set();
      function isSelectable(el){
        try{
          const r=el.getBoundingClientRect();
          const area=(r.width||0)*(r.height||0);
          const disp=(getComputedStyle(el).display||'block');
          return area>=1200 && disp!=='inline';
        }catch{return true;}
      }
      function findSelectableAncestor(el){
        let node=el;
        let hops=0;
        while(node && hops<8){
          if(isSelectable(node)) return node;
          node=node.parentElement;
          hops++;
        }
        return el;
      }
      function dedupByContainment(set){
        const arr=Array.from(set);
        const keep=new Set(arr);
        arr.forEach((a)=>{
          arr.forEach((b)=>{
            if(a!==b && keep.has(b) && a.contains(b)){
              keep.delete(b);
            }
          });
        });
        return keep;
      }
      function pathToString(path){
        return path.map((n)=>{
          const cls=(n.classes||[]).map((c)=>'.'+c).join('');
          const id=n.id?('#'+n.id):'';
          const nth=':nth-child('+(Number(n.index||0)+1)+')';
          return (n.tag||'div')+id+cls+nth;
        }).join('>');
      }
      function computePath(el){
        const path=[];
        let node=el;
        while(node && node!==document.body){
          let index=0;
          let sib=node;
          while(sib.previousElementSibling){
            index++;
            sib=sib.previousElementSibling;
          }
          path.unshift({tag:(node.tagName||'').toLowerCase(),id:node.id||null,classes:Array.from(node.classList||[]),index});
          node=node.parentElement;
        }
        return path;
      }
      function highlightSelected(){
        selectionOverlays.forEach((box)=>box.remove());
        selectionOverlays.clear();
        let minL=Infinity,minT=Infinity,maxR=-Infinity,maxB=-Infinity,count=0;
        selected.forEach((el)=>{
          const rect=el.getBoundingClientRect();
          const box=document.createElement('div');
          box.style.position='fixed';
          box.style.pointerEvents='none';
          box.style.zIndex='2147483646';
          box.style.border='2px dashed rgba(var(--ring-rgb,59,130,246),0.7)';
          box.style.borderRadius='8px';
          box.style.left=rect.left+'px';
          box.style.top=rect.top+'px';
          box.style.width=rect.width+'px';
          box.style.height=rect.height+'px';
          document.body.appendChild(box);
          selectionOverlays.set(el,box);
          minL=Math.min(minL,rect.left);
          minT=Math.min(minT,rect.top);
          maxR=Math.max(maxR,rect.right);
          maxB=Math.max(maxB,rect.bottom);
          count++;
        });
        if(count>1 && isFinite(minL) && isFinite(minT) && isFinite(maxR) && isFinite(maxB)){
          groupOverlay.style.left=minL+'px';
          groupOverlay.style.top=minT+'px';
          groupOverlay.style.width=(maxR-minL)+'px';
          groupOverlay.style.height=(maxB-minT)+'px';
          groupOverlay.style.display='block';
        }else{
          groupOverlay.style.display='none';
        }
      }
      function emitSelection(){
        const outs=[];
        const rects=[];
        selected.forEach((el)=>{
          const r=el.getBoundingClientRect();
          outs.push(el.outerHTML);
          rects.push({x:r.left,y:r.top,width:r.width,height:r.height});
        });
        const paths=[];
        selected.forEach((el)=>{
          const p=pathToString(computePath(el));
          paths.push(p);
        });
        parent.postMessage({type:'ELEMENT_SELECTED',frameId:fid,outerHTML:outs.length<=1?outs[0]:outs,rects,paths:paths.length<=1?paths[0]:paths},'*');
      }
      function onMove(e){
        if(!enabled) return;
        const el=document.elementFromPoint(e.clientX,e.clientY);
        if(!el) return;
        currentEl=el;
        const rect=el.getBoundingClientRect();
        overlay.style.left=rect.left+'px';
        overlay.style.top=rect.top+'px';
        overlay.style.width=rect.width+'px';
        overlay.style.height=rect.height+'px';
        try{
          const p=pathToString(computePath(el));
          const isLocked=locked.has(p);
          overlay.style.border=isLocked?'2px solid rgba(255,0,0,0.75)':'2px solid rgba(var(--primary-rgb,59,130,246),0.7)';
          overlay.style.boxShadow=isLocked?'0 0 16px rgba(255,0,0,0.5)':'0 0 16px rgba(var(--primary-rgb,59,130,246),0.5)';
          overlay.style.cursor=isLocked?'not-allowed':'default';
        }catch{}
        overlay.style.display='block';
      }
      function onClick(e){
        if(!enabled) return;
        e.preventDefault();
        e.stopPropagation();
        let el=document.elementFromPoint(e.clientX,e.clientY) || currentEl;
        if(el) el=findSelectableAncestor(el);
        if(!el) return;
        if(e.shiftKey){
          if(selected.has(el)) selected.delete(el); else selected.add(el);
          const pruned=dedupByContainment(selected);
          selected.clear();
          pruned.forEach((n)=>selected.add(n));
        }else{
          selected.clear();
          selected.add(el);
        }
        highlightSelected();
        emitSelection();
      }
      function onMouseDown(e){
        if(!enabled) return;
        if(e.button!==0) return;
        dragStart={x:e.clientX,y:e.clientY};
        marquee=document.createElement('div');
        marquee.style.position='fixed';
        marquee.style.left=dragStart.x+'px';
        marquee.style.top=dragStart.y+'px';
        marquee.style.border='1.5px solid rgba(255,255,255,0.9)';
        marquee.style.background='rgba(255,255,255,0.08)';
        marquee.style.zIndex='2147483648';
        document.body.appendChild(marquee);
        document.addEventListener('mousemove',onDrag,true);
        document.addEventListener('mouseup',onMouseUp,true);
      }
      function onDrag(e){
        if(!dragStart||!marquee) return;
        const x=Math.min(dragStart.x,e.clientX);
        const y=Math.min(dragStart.y,e.clientY);
        const w=Math.abs(e.clientX-dragStart.x);
        const h=Math.abs(e.clientY-dragStart.y);
        marquee.style.left=x+'px';
        marquee.style.top=y+'px';
        marquee.style.width=w+'px';
        marquee.style.height=h+'px';
      }
      function intersects(a,b){
        return !(b.left>a.right||b.right<a.left||b.top>a.bottom||b.bottom<a.top);
      }
      function onMouseUp(e){
        document.removeEventListener('mousemove',onDrag,true);
        document.removeEventListener('mouseup',onMouseUp,true);
        if(marquee){
          const rect=marquee.getBoundingClientRect();
          const root=document.getElementById('root')?.firstElementChild||document.body;
          const nodes=Array.from(root.querySelectorAll('*')).slice(0,1200);
          const candidates=[];
          nodes.forEach((n)=>{
            const r=n.getBoundingClientRect();
            const R={left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom};
            const S={left:r.left,top:r.top,right:r.right,bottom:r.bottom};
            if(intersects(R,S) && isSelectable(n)) candidates.push(n);
          });
          const temp=new Set(candidates.map(findSelectableAncestor));
          const pruned=dedupByContainment(temp);
          selected.clear();
          Array.from(pruned).slice(0,50).forEach((n)=>selected.add(n));
          marquee.remove();
          marquee=null;
          dragStart=null;
          highlightSelected();
          emitSelection();
        }
      }
      window.addEventListener('message',(event)=>{
        const d=event.data;
        if(d && d.type==='SELECT_MODE' && d.frameId===fid){
          enabled=!!d.enabled;
          overlay.style.display='none';
          selected.clear();
          highlightSelected();
        }
        if(d && d.type==='LOCKED_SET' && d.frameId===fid){
          try{
            locked.clear();
            const arr=Array.isArray(d.paths)?d.paths:(d.paths? [d.paths]:[]);
            arr.forEach((p)=>{ if(typeof p==='string') locked.add(p); });
          }catch{}
        }
      });
      document.addEventListener('mousemove',onMove,true);
      document.addEventListener('click',onClick,true);
      document.addEventListener('mousedown',onMouseDown,true);
    })();
  </script>
  
  <script>
    (()=>{
      const fid='${frameId}';
      // FPS estimation via rAF
      let frames=0, fps=0;
      let lastTick=performance.now();
      function raf(t){
        frames++;
        if(t - lastTick >= 1000){
          fps = frames;
          frames = 0;
          lastTick = t;
        }
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      // Long Task observer
      let longTasks=0, longTaskTotal=0;
      try{
        const po=new PerformanceObserver((list)=>{
          list.getEntries().forEach((e)=>{
            longTasks++;
            longTaskTotal += e.duration;
          });
        });
        po.observe({entryTypes:['longtask']});
      }catch{}
      // Memory
      function getMemory(){
        const m=(performance as any).memory;
        if(!m) return null;
        return { used:m.usedJSHeapSize, total:m.totalJSHeapSize, limit:m.jsHeapSizeLimit };
      }
      // Battery
      async function getBattery(){
        try{
          const b=await (navigator as any).getBattery();
          return { level:b.level, charging:b.charging, dischargingTime:b.dischargingTime };
        }catch{return null;}
      }
      // Frame time sampling
      let frameTimes=[];
      function sampleFrame(){
        const start=performance.now();
        requestAnimationFrame(()=>{
          const dt=performance.now()-start;
          frameTimes.push(dt);
          if(frameTimes.length>120) frameTimes.shift();
        });
      }
      setInterval(sampleFrame, 200);
      // Emit metrics periodically
      setInterval(async ()=>{
        const memory=getMemory();
        const battery=await getBattery();
        const avgFrameTime=frameTimes.length?frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length:null;
        parent.postMessage({
          type:'PERF_METRICS',
          frameId:fid,
          metrics:{
            fps,
            longTasks,
            longTaskTotal,
            avgFrameTime,
            memory,
            battery,
            quality:(window as any).__quality
          }
        },'*');
        longTasks=0; longTaskTotal=0;
      },2000);
    })();
  </script>

</body>
</html>`;
}
