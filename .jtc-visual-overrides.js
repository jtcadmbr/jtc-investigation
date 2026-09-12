(function(){
    const items=[{"selector":"h1.text-4xl.font-display","device":"desktop","text":"JTC INVESTDDDDDDDDDD","styles":{}}];
    const device=()=>window.innerWidth<=767?'mobile':window.innerWidth<=1023?'tablet':'desktop';
    const textOf=e=>('value' in e && /^(INPUT|TEXTAREA)$/.test(e.tagName))?e.value:(e.innerText??e.textContent??'');
    const apply=()=>{
      const current=device();
      for(const i of items){try{
        if(i.device && i.device!==current) continue;
        const e=document.querySelector(i.selector); if(!e) continue;
        if(i.styles) for(const [k,v] of Object.entries(i.styles)) { if(e.style[k]!==String(v)) e.style[k]=v; }
        if(i.text!==undefined){
          const wanted=String(i.text);
          if('value' in e && /^(INPUT|TEXTAREA)$/.test(e.tagName)) { if(e.value!==wanted) e.value=wanted; }
          else if(!/^(SELECT)$/.test(e.tagName) && textOf(e)!==wanted) e.textContent=wanted;
        }
      }catch(_){} }
    };
    const boot=()=>{
      apply();
      [50,150,400,900,1800,3500].forEach(ms=>setTimeout(apply,ms));
      if(!window.__JTC_VISUAL_OBSERVER__){
        let timer=0;
        const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,60);});
        if(document.documentElement) observer.observe(document.documentElement,{subtree:true,childList:true});
        window.__JTC_VISUAL_OBSERVER__=observer;
      }
      window.addEventListener('resize',apply,{passive:true});
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  })();