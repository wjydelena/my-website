import React, {useEffect, useRef, useState} from 'react';
import {LayoutPanelLeft} from 'lucide-react';
import layoutEducation from './assets/layout-education.gif';
import {markCustomizeEducationSeen, scheduleCustomizeEducation} from './customize-education';
import './customize-education.css';

export function CustomizeEducation({onCustomize}:{onCustomize:()=>void}) {
  const [visible,setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dismiss = () => {markCustomizeEducationSeen();setVisible(false);};
  useEffect(()=>scheduleCustomizeEducation(()=>setVisible(true)),[]);
  useEffect(()=>{
    if(!visible)return;
    const outside = (event:PointerEvent) => {
      if(!root.current?.contains(event.target as Node))dismiss();
    };
    const escape = (event:KeyboardEvent) => {
      if(event.key==='Escape')dismiss();
    };
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[visible]);
  return <div className="customize-education-anchor" ref={root}>
    <button type="button" className={`customize${visible?' education-highlight':''}`} style={{fontSize:'14px'}}
      aria-describedby={visible?'customize-education-copy':undefined}
      onClick={()=>{dismiss();onCustomize();}}>
      <LayoutPanelLeft size={16}/>Customize layout
    </button>
    {visible && <div className="customize-education-popover" role="status" aria-live="polite" id="customize-education-copy">
      <strong>Customize your LIVE console</strong>
      <p>Drag panels to rearrange, resize horizontally or vertically, or remove panels you don't need. Add them back anytime.</p>
      <img className="customize-education-gif" src={layoutEducation} alt="Demonstration of rearranging, resizing, removing and restoring LIVE console panels" width={296} height={168}/>
    </div>}
  </div>;
}
