import React, {useEffect, useRef, useState} from 'react';
import {Plus} from 'lucide-react';
import {moduleNames} from './module-layout';
import {useConsoleLayout} from './ResizableLayout';

export function AddPanelControl() {
  const {removedPanels, restorePanel, showRestoreHint, dismissRestoreHint} = useConsoleLayout();
  const [open,setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!removedPanels.length)setOpen(false);},[removedPanels.length]);
  useEffect(()=>{
    if(!open && !showRestoreHint)return;
    const outside=(event:PointerEvent)=>{
      if(!root.current?.contains(event.target as Node)){setOpen(false);dismissRestoreHint();}
    };
    const escape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setOpen(false);dismissRestoreHint();trigger.current?.focus();}
    };
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open,showRestoreHint]);
  useEffect(()=>{if(open)root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();},[open]);
  if(!removedPanels.length)return null;
  return <>
    <div className="add-panel-control" ref={root}>
      <button className="add-panel-trigger" type="button" ref={trigger} aria-label="Add panel" aria-haspopup="menu" aria-expanded={open} aria-controls="removed-panel-menu"
        aria-describedby={showRestoreHint?'add-panel-hint':undefined}
        onClick={()=>{dismissRestoreHint();setOpen(!open);}}
        onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();dismissRestoreHint();setOpen(true);}}}>
        <Plus size={18} aria-hidden="true"/>Add panel
      </button>
      {showRestoreHint && !open && <div className="add-panel-hint" id="add-panel-hint" role="status">
        <strong>Add panels back anytime</strong>
        <p>Click “Add panel” to restore panels you’ve removed.</p>
      </div>}
      {open && <div className="removed-panel-menu" id="removed-panel-menu" role="menu" aria-label="Removed panels" onKeyDown={event=>{
        const items=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
        const index=items.indexOf(document.activeElement as HTMLButtonElement);
        if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
          event.preventDefault();
          const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:items.length-1))%items.length;
          items[next]?.focus();
        } else if(event.key==='Tab')setOpen(false);
      }}>
        <span className="removed-panel-label">Removed panels</span>
        {removedPanels.map(id=><button type="button" role="menuitem" aria-label={`Add ${moduleNames[id]} panel`} key={id}
          onClick={()=>{restorePanel(id);setOpen(false);requestAnimationFrame(()=>{if(trigger.current)trigger.current.focus();else document.querySelector<HTMLButtonElement>('.layout-mode-trigger')?.focus();});}}>
          <span>{moduleNames[id]}</span><Plus size={16} aria-hidden="true"/>
        </button>)}
      </div>}
    </div>
    <span className="add-panel-divider" aria-hidden="true"/>
  </>;
}
