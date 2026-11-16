import React, {useEffect, useLayoutEffect, useState} from 'react';
import {usePrompter} from './PrompterContext';

export default function PrompterSettings({anchor,container,panelPosition,popoverRef}:{anchor:React.RefObject<HTMLButtonElement>;container:React.RefObject<HTMLElement>;panelPosition:{x:number;y:number}|null;popoverRef:React.RefObject<HTMLDivElement>}){
  const state=usePrompter();
  const root=popoverRef;
  const [position,setPosition]=useState<{left:number;top:number}|null>(null);
  const placed=position!==null;
  useEffect(()=>{if(placed)root.current?.focus({preventScroll:true});},[placed,root]);
  useLayoutEffect(()=>{
    const element=root.current,parent=container.current,button=anchor.current;
    if(!element||!parent||!button)return;
    const place=()=>{
      const buttonBounds=button.getBoundingClientRect(),parentBounds=parent.getBoundingClientRect();
      const width=element.offsetWidth,height=element.offsetHeight;
      const left=Math.max(8,Math.min(buttonBounds.right-width,window.innerWidth-width-8));
      let top=buttonBounds.bottom+8;
      if(top+height>window.innerHeight-8)top=buttonBounds.top-height-8;
      top=Math.max(8,Math.min(top,window.innerHeight-height-8));
      const next={left:left-parentBounds.left,top:top-parentBounds.top};
      setPosition(previous=>previous?.left===next.left&&previous?.top===next.top?previous:next);
    };
    place();
    const observer=new ResizeObserver(place);observer.observe(element);observer.observe(parent);
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    return()=>{observer.disconnect();window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
  },[anchor,container,root,panelPosition?.x,panelPosition?.y]);
  const switches=[
    {label:'Real-time suggestions',checked:state.realTimeSuggestions,toggle:()=>state.setRealTimeSuggestions(value=>!value)},
    {label:'Smart scripts',checked:state.smartScripts,toggle:()=>state.setSmartScripts(value=>!value)},
    {label:'Auto-post giveaway',checked:state.autoPostGiveaway,toggle:()=>state.setAutoPostGiveaway(value=>!value)},
  ];
  return <div className="prompter-preferences" ref={root} id="prompter-settings-popover" role="dialog" aria-label="Prompter settings" tabIndex={-1}
    style={{...(position?{left:position.left,top:position.top}:{top:44,right:48}),backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}>
    <strong className="prompter-preferences-title">Settings</strong>
    <div className="prompter-preferences-options">
      {switches.map(option=><label className="prompter-preference-row" key={option.label}>
        <span>{option.label}</span>
        <button type="button" role="switch" className="prompter-preference-switch" aria-label={option.label} aria-checked={option.checked} onClick={option.toggle}><i aria-hidden="true"/></button>
      </label>)}
    </div>
  </div>;
}
