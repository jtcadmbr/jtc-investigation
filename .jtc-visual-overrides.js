(function(){
    const items=[{"selector":"h1.text-4xl.font-display","device":"desktop","text":"JTC INVESTDDDDDDDDDD","styles":{}},{"selector":"span","device":"desktop","text":"SISTEMA RESTRITO • USO ORGANIZACIONAL•JTC","styles":{}},{"selector":"div.absolute.-inset-2","device":"desktop","text":"","styles":{}},{"selector":"div.absolute.-top-3:nth-of-type(1)","device":"desktop","text":"ACESSO RESTRITO JTC","styles":{}}];
    const device=()=>window.innerWidth<=767?'mobile':window.innerWidth<=1023?'tablet':'desktop';
    const apply=()=>{
      const current=device();
      for(const i of items){
        if(i.device && i.device!==current) continue;
        try{
          const el=document.querySelector(i.selector);
          if(!el) continue;
          if(i.styles) for(const [k,v] of Object.entries(i.styles)){
            if(v!==undefined && v!==null && el.style[k]!==String(v)) el.style.setProperty(k,String(v),'important');
          }
          if(i.text!==undefined){
            const wanted=String(i.text);
            if('value' in el && /^(INPUT|TEXTAREA)$/.test(el.tagName)){
              if(el.value!==wanted) el.value=wanted;
            } else if(!/^(SELECT|SCRIPT|STYLE)$/.test(el.tagName) && el.textContent!==wanted){
              el.textContent=wanted;
            }
          }
        }catch(_){ }
      }
    };
    let observerStarted=false;
    const boot=()=>{
      apply();
      [0,50,150,300,600,1200,2500,5000].forEach(ms=>setTimeout(apply,ms));
      if(observerStarted)return;
      observerStarted=true;
      let timer=0;
      const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,30);});
      const start=()=>observer.observe(document.documentElement,{subtree:true,childList:true});
      if(document.documentElement) start(); else document.addEventListener('DOMContentLoaded',start,{once:true});
      window.addEventListener('resize',apply,{passive:true});
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  })();