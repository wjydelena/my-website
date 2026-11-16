import React, {useEffect, useRef, useState} from 'react';
import {Settings, X} from 'lucide-react';
import {usePrompter} from './PrompterContext';
import {useConsoleLayout} from './ResizableLayout';
import {isCustomizeEducationBlankTarget} from './customize-education';
import logo from './assets/prompter-logo.png';
import captionLogo from './assets/annotation-icons/prompter-caption.png';
import collapseIcon from './assets/video-collapse.png';
import './prompter.css';

export function PrompterLogo({monochrome=false}:{monochrome?:boolean}){
  if(!monochrome)return <img className="prompter-entry-logo" src={captionLogo} width={16} height={16} alt="" style={{width:16,height:16,objectFit:'contain',flexShrink:0,filter:'none'}}/>;
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
  const [position,setPosition]=useState<{x:number;y:number}|null>(null);
  const [dragging,setDragging]=useState(false);
  const drag=useRef<{pointer:number;startX:number;startY:number;x:number;y:number}|null>(null);
  const movePanel=(x:number,y:number)=>{
    const width=root.current?.offsetWidth??368;
    const height=root.current?.offsetHeight??206;
    setPosition({x:Math.max(8,Math.min(x,window.innerWidth-width-8)),y:Math.max(8,Math.min(y,window.innerHeight-height-8))});
  };
  const startDrag=(event:React.PointerEvent<HTMLElement>)=>{
    if(event.button!==0||!event.isPrimary||(event.target as Element).closest('button,input'))return;
    const anchor=root.current?.parentElement;
    if(!anchor)return;
    event.preventDefault();event.stopPropagation();
    drag.current={pointer:event.pointerId,startX:event.clientX,startY:event.clientY,x:anchor.offsetLeft,y:anchor.offsetTop};
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onDrag=(event:React.PointerEvent<HTMLElement>)=>{
    const active=drag.current;
    if(!active||active.pointer!==event.pointerId)return;
    movePanel(active.x+event.clientX-active.startX,active.y+event.clientY-active.startY);
  };
  const endDrag=(event:React.PointerEvent<HTMLElement>)=>{
    if(drag.current?.pointer!==event.pointerId)return;
    drag.current=null;setDragging(false);
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };
  useEffect(()=>{
    if(!visible||editing){drag.current=null;setDragging(false);return;}
    const element=root.current;
    if(!element)return;
    const constrain=()=>setPosition(previous=>{
      if(!previous)return previous;
      const x=Math.max(8,Math.min(previous.x,window.innerWidth-element.offsetWidth-8));
      const y=Math.max(8,Math.min(previous.y,window.innerHeight-element.offsetHeight-8));
      return x===previous.x&&y===previous.y?previous:{x,y};
    });
    const observer=new ResizeObserver(constrain);observer.observe(element);
    window.addEventListener('resize',constrain);
    return()=>{observer.disconnect();window.removeEventListener('resize',constrain);};
  },[visible,editing]);
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
  return <div className={`prompter-positioner${dragging?' is-dragging':''}`} style={position?{left:position.x,top:position.y,right:'auto'}:undefined}>
    <section ref={root} className={`prompter-popover${compact?' is-compact':suggestion?' has-suggestion':' is-empty'}`}
      style={{backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)'}}
      id="prompter-panel" role="region" aria-label="Prompter suggestions" data-testid={compact?'prompter-collapsed':suggestion?'prompter-suggestion':'prompter-empty'}
      onPointerDown={event=>event.stopPropagation()}
      onPointerEnter={()=>{if(collapsed){setHovered(true);state.setVideoPreviewVisible(false);}}}
      onPointerLeave={()=>setHovered(false)}
      onFocusCapture={()=>{if(collapsed){setFocused(true);state.setVideoPreviewVisible(false);}}}
      onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
      <header className="prompter-header" tabIndex={0} aria-label="Move Prompter panel" aria-describedby="prompter-drag-instructions"
        onPointerDown={startDrag} onPointerMove={onDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
        onKeyDown={event=>{
          if(event.target!==event.currentTarget||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
          event.preventDefault();event.stopPropagation();
          const anchor=root.current?.parentElement;if(!anchor)return;
          const step=event.shiftKey?40:10;
          movePanel(anchor.offsetLeft+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),anchor.offsetTop+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0));
        }}>
        <PrompterLogo monochrome/><strong>Prompter</strong>
        <div className="prompter-controls">
          <button type="button" aria-label={compact?'Expand Prompter':'Collapse Prompter'} onClick={compact?open:minimize}>
            <img src={collapseIcon} width={16} height={16} alt=""/>
          </button>
          {!compact&&<><button type="button" aria-label="Prompter settings" aria-expanded={settings} onClick={()=>setSettings(!settings)}><Settings size={16}/></button><button type="button" aria-label="Close Prompter" onClick={close}><X size={16}/></button></>}
        </div>
      </header>
      <span id="prompter-drag-instructions" className="move-sr-only">Drag the title bar to move this panel. When focused, use arrow keys to move; hold Shift for larger steps.</span>
      {!compact&&(suggestion?<div className="prompter-body">
        <p className="prompter-recommendation">69 viewers have recently viewed #1 product. Pin it now!</p>
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
