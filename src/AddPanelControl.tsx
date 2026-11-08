import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Plus} from 'lucide-react';
import {useConsoleLayout} from './ResizableLayout';
import {AddPanelModal} from './AddPanelModal';

export function AddPanelControl() {
  const {removedPanels, restorePanels, showRestoreHint, dismissRestoreHint} = useConsoleLayout();
  const [open,setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!removedPanels.length)setOpen(false);},[removedPanels.length]);
  useEffect(()=>{
    if(!showRestoreHint)return;
    const timer=setTimeout(dismissRestoreHint,3000);
    return ()=>clearTimeout(timer);
  },[showRestoreHint,dismissRestoreHint]);
  useEffect(()=>{
    if(open || !showRestoreHint)return;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){dismissRestoreHint();trigger.current?.focus();}};
    document.addEventListener('keydown',escape);
    return ()=>document.removeEventListener('keydown',escape);
  },[open,showRestoreHint,dismissRestoreHint]);
  if(!removedPanels.length)return null;
  const openModal=()=>{dismissRestoreHint();setOpen(true);};
  const host=root.current?.closest('.console-shell');
  return <>
    <div className="add-panel-control" ref={root} data-testid={!showRestoreHint?'add-panel-without-hint':undefined}>
      <button className="add-panel-trigger" type="button" ref={trigger} aria-label="Add panel" aria-haspopup="dialog" aria-expanded={open}
        aria-describedby={showRestoreHint?'add-panel-hint':undefined} onClick={openModal}
        onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();openModal();}}}>
        <Plus size={18} aria-hidden="true"/>Add panel
      </button>
      {showRestoreHint && !open && <div className="add-panel-hint" id="add-panel-hint" role="status"><strong>Add panels back anytime</strong><p>Click “Add panel” to restore panels you’ve removed.</p></div>}
    </div>
    <span className="add-panel-divider" aria-hidden="true"/>
    {open && host && createPortal(<AddPanelModal panels={removedPanels} onClose={()=>setOpen(false)} onAdd={ids=>{restorePanels(ids);setOpen(false);}}/>,host)}
  </>;
}
