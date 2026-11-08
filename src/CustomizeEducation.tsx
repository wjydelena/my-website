import React, {useCallback, useEffect, useRef, useState} from 'react';
import {LayoutPanelLeft} from 'lucide-react';
import layoutEducation from './assets/layout-education-twice.gif';
import {hasSeenCustomizeEducation, markCustomizeEducationSeen, scheduleCustomizeEducation, scheduleCustomizeEducationDismiss} from './customize-education';
import './customize-education.css';

export function CustomizeEducation({onCustomize}:{onCustomize:()=>void}) {
  const [visible,setVisible] = useState(false);
  const [animationReady,setAnimationReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  const dismiss = useCallback(() => {markCustomizeEducationSeen();setVisible(false);},[]);
  useEffect(()=>{
    if(!visible){setAnimationReady(false);return;}
    if(!animationReady)return;
    return scheduleCustomizeEducationDismiss(dismiss);
  },[visible,animationReady,dismiss]);
  useEffect(()=>{
    const element = root.current;
    if(!element)return;
    let intersecting = false;
    let cancel = () => {};
    const sync = () => {
      cancel();
      if(document.visibilityState!=='visible' || !intersecting) {
        shown.current=false;
        setVisible(false);
        return;
      }
      if(shown.current || hasSeenCustomizeEducation())return;
      cancel=scheduleCustomizeEducation(()=>{shown.current=true;setVisible(true);});
    };
    const observer = new IntersectionObserver(entries=>{
      intersecting=entries[0].isIntersecting && entries[0].intersectionRatio>=.5;
      sync();
    },{threshold:[0,.5,1]});
    observer.observe(element);
    document.addEventListener('visibilitychange',sync);
    return ()=>{cancel();observer.disconnect();document.removeEventListener('visibilitychange',sync);};
  },[]);
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
    {visible && <div className="customize-education-popover" role="status" aria-live="polite" id="customize-education-copy">
      <strong>Customize your LIVE console</strong>
      <p>Drag panels to rearrange, resize horizontally or vertically, or remove panels you don't need. Add them back anytime.</p>
      <img className="customize-education-gif" src={layoutEducation} onLoad={()=>setAnimationReady(true)} onError={dismiss} alt="Demonstration of rearranging, resizing, removing and restoring LIVE console panels" width={296} height={168}/>
    </div>}
  </div>;
}
