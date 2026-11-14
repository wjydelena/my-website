import React, {useCallback, useEffect, useRef, useState} from 'react';
import {LayoutPanelLeft} from 'lucide-react';
import layoutEducation from './assets/layout-education-twice.gif';
import {isCustomizeEducationBlankTarget, scheduleCustomizeEducationDismiss} from './customize-education';
import './customize-education.css';

export function CustomizeEducation({onCustomize,entryShown,allowBlankReplay=true}:{onCustomize:()=>void;entryShown:React.MutableRefObject<boolean>;allowBlankReplay?:boolean}) {
  const [visible,setVisible] = useState(()=>!entryShown.current);
  const [animationReady,setAnimationReady] = useState(false);
  const [gifSrc,setGifSrc] = useState<string>();
  const root = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => {setVisible(false);setAnimationReady(false);},[]);
  // Header survives edit mode, so returning from editing does not replay entry education automatically.
  useEffect(()=>{entryShown.current=true;},[entryShown]);
  useEffect(()=>{
    if(!visible){setGifSrc(undefined);return;}
    let active=true;
    let url:string|undefined;
    // A fresh URL gives every demonstration its own GIF playback timeline.
    fetch(layoutEducation).then(response=>response.blob()).then(blob=>{
      if(!active)return;
      url=URL.createObjectURL(blob);
      setGifSrc(url);
    }).catch(()=>{if(active)dismiss();});
    return ()=>{active=false;if(url)URL.revokeObjectURL(url);};
  },[visible,dismiss]);
  useEffect(()=>{
    if(!visible){setAnimationReady(false);return;}
    if(!animationReady)return;
    return scheduleCustomizeEducationDismiss(dismiss);
  },[visible,animationReady,dismiss]);
  useEffect(()=>{
    const click = (event:MouseEvent) => {
      if(!(event.target instanceof Node) || root.current?.contains(event.target))return;
      if(visible){dismiss();return;}
      if(event.button!==0 || event.defaultPrevented || document.visibilityState!=='visible')return;
      if(allowBlankReplay&&isCustomizeEducationBlankTarget(event.target)){
        setAnimationReady(false);
        setVisible(true);
      }
    };
    const hide = () => {if(document.visibilityState!=='visible')dismiss();};
    document.addEventListener('click',click,true);
    document.addEventListener('visibilitychange',hide);
    return ()=>{document.removeEventListener('click',click,true);document.removeEventListener('visibilitychange',hide);};
  },[visible,dismiss,allowBlankReplay]);
  useEffect(()=>{
    if(!visible)return;
    const escape = (event:KeyboardEvent) => {
      if(event.key==='Escape')dismiss();
    };
    document.addEventListener('keydown',escape);
    return ()=>document.removeEventListener('keydown',escape);
  },[visible,dismiss]);
  return <div className="customize-education-anchor" ref={root} data-testid={!visible?'customize-without-education':undefined}>
    <button type="button" className={`customize${visible?' education-highlight':''}`} style={{fontSize:'14px'}}
      aria-describedby={visible?'customize-education-copy':undefined}
      onClick={()=>{dismiss();onCustomize();}}>
      <LayoutPanelLeft size={16}/>Customize layout
    </button>
    {visible && <div className="customize-education-popover" role="status" aria-live="polite" id="customize-education-copy" data-testid={animationReady?'customize-education-ready':undefined}>
      <strong>Customize your LIVE console</strong>
      <p>Drag panels to rearrange, resize horizontally or vertically, or remove panels you don't need. Add them back anytime.</p>
      <img className="customize-education-gif" src={gifSrc} onLoad={()=>setAnimationReady(true)} onError={dismiss} alt="Demonstration of rearranging, resizing, removing and restoring LIVE console panels" width={296} height={168}/>
    </div>}
  </div>;
}
