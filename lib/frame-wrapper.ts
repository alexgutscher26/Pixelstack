import { BASE_VARIABLES, OCEAN_BREEZE_THEME } from "./themes";

export function getHTMLWrapper(
  html: string,
  title = "Untitled",
  theme_style?: string,
  frameId?: string
) {
  const finalTheme = theme_style || OCEAN_BREEZE_THEME;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>

  <!-- Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>

  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet">

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
  </style>
</head>
<body>
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

</body>
</html>`;
}
