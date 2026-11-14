import React, {useEffect, useRef, useState} from 'react';
import {SlidersHorizontal, X} from 'lucide-react';
import {usePrompter} from './PrompterContext';
import {useConsoleLayout} from './ResizableLayout';
import {isCustomizeEducationBlankTarget} from './customize-education';
import logo from './assets/prompter-logo.png';
import collapseIcon from './assets/video-collapse.png';
import './prompter.css';

export function PrompterLogo(){
  return <span className="prompter-logo" aria-hidden="true" style={{maskImage:`url("${logo}")`,WebkitMaskImage:`url("${logo}")`}}/>;
}
export function PrompterOverlay(){
  const state=usePrompter();
  const {editing}=useConsoleLayout();
  const {visible,collapsed,layoutCompleted,open,close,setCollapsed}=state;
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [settings,setSettings]=useState(false);
  const [recommendations,setRecommendations]=useState(true);
  const root=useRef<HTMLElement>(null);
  const preview=collapsed&&(hovered||focused);
  const compact=collapsed&&!preview;
  const product=state.products[0];
  const suggestion=product&&!state.handled&&state.pinned!==product.id&&recommendations;
  const minimize=()=>{setCollapsed(true);setHovered(false);setFocused(false);setSettings(false);};
  useEffect(()=>{
    if(editing)close();
  },[editing,close]);
  useEffect(()=>{
    if(!visible){setHovered(false);setFocused(false);setSettings(false);}
  },[visible]);
  useEffect(()=>{
    if(editing||!layoutCompleted)return;
    const click=(event:MouseEvent)=>{
      if(event.button!==0||event.defaultPrevented||document.visibilityState!=='visible')return;
      if(event.target instanceof Element&&event.target.closest('.prompter-popover,.prompter-video-product'))return;
      if(isCustomizeEducationBlankTarget(event.target))open();
    };
    document.addEventListener('click',click,true);
    return()=>document.removeEventListener('click',click,true);
  },[editing,layoutCompleted,open]);
  useEffect(()=>{
    if(!visible)return;
    const escape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){if(settings)setSettings(false);else close();}
    };
    const outside=(event:PointerEvent)=>{
      if(settings&&event.target instanceof Node&&!root.current?.contains(event.target))setSettings(false);
    };
    document.addEventListener('keydown',escape);
    document.addEventListener('pointerdown',outside);
    return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);};
  },[visible,settings,close]);
  if(editing||!visible)return null;
  return <div className="prompter-positioner">
    <section ref={root} className={`prompter-popover${compact?' is-compact':suggestion?' has-suggestion':' is-empty'}`}
      style={{backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}
      id="prompter-panel" role="region" aria-label="Prompter suggestions" data-testid={compact?'prompter-collapsed':suggestion?'prompter-suggestion':'prompter-empty'}
      onPointerDown={event=>event.stopPropagation()}
      onPointerEnter={()=>{if(collapsed){setHovered(true);state.setVideoPreviewVisible(false);}}}
      onPointerLeave={()=>setHovered(false)}
      onFocusCapture={()=>{if(collapsed){setFocused(true);state.setVideoPreviewVisible(false);}}}
      onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
      <header className="prompter-header">
        <PrompterLogo/><strong>Prompter</strong>
        <div className="prompter-controls">
          <button type="button" aria-label={compact?'Expand Prompter':'Collapse Prompter'} onClick={compact?open:minimize}>
            <img src={collapseIcon} width={16} height={16} alt=""/>
          </button>
          {!compact&&<><button type="button" aria-label="Prompter settings" aria-expanded={settings} onClick={()=>setSettings(!settings)}><SlidersHorizontal size={16}/></button><button type="button" aria-label="Close Prompter" onClick={close}><X size={16}/></button></>}
        </div>
      </header>
      {!compact&&(suggestion?<div className="prompter-body">
        <p className="prompter-recommendation"><em>69</em> viewers have recently viewed #1 product. Pin it now!</p>
        <div className="prompter-product">
          <div className="prompter-product-image"><img src={product.image} alt="Suggested product"/><span>1</span></div>
          <div className="prompter-product-info"><p>{product.name}</p><strong>${product.price}</strong></div>
          <button type="button" className="prompter-pin" aria-label="Pin suggested product" onClick={()=>{setHovered(false);setFocused(false);setSettings(false);state.pinSuggestion(product.id);}}>Pin</button>
        </div>
      </div>:<p className="prompter-empty-copy">All good for now. Suggestions will appear when there’s a good moment.</p>)}
      {settings&&!compact&&<div className="prompter-preferences"><strong>Suggestions</strong><label><span>Product recommendations</span><input type="checkbox" checked={recommendations} onChange={event=>setRecommendations(event.target.checked)}/></label></div>}
    </section>
  </div>;
}
export function PrompterVideoProduct(){
  const {products,pinned,setPinned,videoPreviewVisible}=usePrompter();
  const {editing}=useConsoleLayout();
  const product=products.find(item=>item.id===pinned);
  if(editing||!product||!videoPreviewVisible)return null;
  return <div className="prompter-video-product" data-testid="pinned-video-product" onPointerDown={event=>event.stopPropagation()}>
    <div className="prompter-video-thumbnail"><img src={product.image} alt="Pinned product"/><span>{products.indexOf(product)+1}</span></div>
    <div className="prompter-video-info"><strong title={product.name}>{product.name}</strong><b>${product.price}</b></div>
    <button type="button" aria-label="Unpin video product" onClick={()=>setPinned(null)}><X size={16}/></button>
  </div>;
}
