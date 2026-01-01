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
        overlay.style.display='block';
      }
      function onClick(e){
        if(!enabled) return;
        e.preventDefault();
        e.stopPropagation();
        if(!currentEl) return;
        const rect=currentEl.getBoundingClientRect();
        parent.postMessage({type:'ELEMENT_SELECTED',frameId:fid,outerHTML:currentEl.outerHTML,path:computePath(currentEl),rect:{x:rect.left,y:rect.top,width:rect.width,height:rect.height}},'*');
      }
      window.addEventListener('message',(event)=>{
        const d=event.data;
        if(d && d.type==='SELECT_MODE' && d.frameId===fid){
          enabled=!!d.enabled;
          overlay.style.display='none';
        }
      });
      document.addEventListener('mousemove',onMove,true);
      document.addEventListener('click',onClick,true);
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
