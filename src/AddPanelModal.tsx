import React, {useEffect, useRef, useState} from 'react';
import {Check, X} from 'lucide-react';
import {ModuleId, moduleNames} from './module-layout';
import products from './assets/panel-previews/products.png';
import video from './assets/panel-previews/video.png';
import chat from './assets/panel-previews/chat.png';
import analytics from './assets/panel-previews/analytics.png';
import activity from './assets/panel-previews/activity.png';
import './add-panel-modal.css';

const illustrations = {products,video,chat,analytics,activity};
export const panelDescriptions: Record<ModuleId,string> = {
  products:'Manage products, organize Buy now and Auction listings',
  video:'Preview your LIVE video',
  chat:'View and respond to viewer comments in real time',
  analytics:'Track key LIVE performance metrics',
  activity:'Track orders and viewer activities as they happen during your LIVE',
};
export function AddPanelModal({panels,onAdd,onClose}:{panels:ModuleId[];onAdd:(ids:ModuleId[])=>void;onClose:()=>void}) {
  const [selected,setSelected]=useState<ModuleId[]>([]);
  const dialog=useRef<HTMLDivElement>(null);
  const close=useRef(onClose);close.current=onClose;
  useEffect(()=>{
    const previouslyFocused=document.activeElement as HTMLElement|null;
    const shell=dialog.current?.closest('.console-shell');
    const siblings=Array.from(shell?.querySelectorAll<HTMLElement>(':scope > .sidebar, :scope > .workspace')||[]);
    const oldInert=siblings.map(el=>el.inert);siblings.forEach(el=>{el.inert=true;});
    dialog.current?.focus();
    const keydown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close.current();return;}
      if(event.key!=='Tab')return;
      const buttons=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]);
      const first=buttons[0],last=buttons[buttons.length-1];
      if(event.shiftKey && (document.activeElement===first || document.activeElement===dialog.current)){event.preventDefault();last?.focus();}
      else if(!event.shiftKey && (document.activeElement===last || document.activeElement===dialog.current)){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',keydown,true);
    return ()=>{document.removeEventListener('keydown',keydown,true);siblings.forEach((el,i)=>{el.inert=oldInert[i];});if(previouslyFocused?.isConnected)previouslyFocused.focus();else requestAnimationFrame(()=>shell?.querySelector<HTMLButtonElement>('.layout-mode-trigger')?.focus());};
  },[]);
  const chosen=panels.filter(id=>selected.includes(id));
  return <div className="add-panel-backdrop" onPointerDown={e=>e.stopPropagation()}>
    <div className={`add-panel-modal ${panels.length===1?'single-panel':'multiple-panels'}`} ref={dialog} role="dialog" aria-modal="true" aria-labelledby="add-panel-title" tabIndex={-1}>
      <header className="add-panel-modal-header"><h2 id="add-panel-title">Add panel</h2><button className="add-panel-modal-close" type="button" aria-label="Close Add panel" onClick={onClose}><X size={20}/></button></header>
      <div className="add-panel-modal-body"><div className="add-panel-card-grid">
        {panels.map(id=><button key={id} type="button" className={`panel-choice${selected.includes(id)?' is-selected':''}`} role="checkbox" aria-checked={selected.includes(id)} aria-label={moduleNames[id]} aria-describedby={`panel-description-${id}`}
          onClick={()=>setSelected(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id])}>
          <span className="panel-choice-preview"><img src={illustrations[id]} alt="" className={`panel-choice-art panel-art-${id}`} draggable={false}/><span className="panel-choice-check" aria-hidden="true"><Check size={13} strokeWidth={3.5}/></span></span>
          <span className="panel-choice-name">{moduleNames[id]}</span><span className="panel-choice-description" id={`panel-description-${id}`}>{panelDescriptions[id]}</span>
        </button>)}
      </div></div>
      <footer className="add-panel-modal-footer"><button type="button" className="panel-modal-cancel" aria-label="Cancel Add panel" onClick={onClose}>Cancel</button><button type="button" className="panel-modal-add" disabled={!chosen.length} onClick={()=>onAdd(chosen)}>Add</button></footer>
    </div>
  </div>;
}
