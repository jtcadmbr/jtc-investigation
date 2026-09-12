(function(){
    const items=[{"selector":"h1.text-4xl.font-display","device":"desktop","text":"JTC CDI","styles":{}}];
    const device=()=>window.innerWidth<=767?'mobile':window.innerWidth<=1023?'tablet':'desktop';
    const apply=()=>{
      const current=device();
      for(const i of items){try{
        if(i.device && i.device!==current) continue;
        const e=document.querySelector(i.selector); if(!e) continue;
        if(i.styles) Object.assign(e.style,i.styles);
        if(i.text!==undefined){
          if('value' in e && /^(INPUT|TEXTAREA)$/.test(e.tagName)) e.value=i.text;
          else if(!/^(SELECT)$/.test(e.tagName)) e.textContent=i.text;
        }
      }catch(_){} }
    };
    apply();
    [50,150,400,900,1800,3500].forEach(ms=>setTimeout(apply,ms));
    if(!window.__JTC_VISUAL_OBSERVER__){
      let timer=0;
      const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,30);});
      if(document.documentElement) observer.observe(document.documentElement,{subtree:true,childList:true});
      window.__JTC_VISUAL_OBSERVER__=observer;
    }
    window.addEventListener('resize',apply,{passive:true});
  })();