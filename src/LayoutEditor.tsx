import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, GripVertical, Trash2 } from 'lucide-react';
import { ModuleId, moduleNames } from './module-layout';
import { LayoutMode, useConsoleLayout } from './ResizableLayout';
import './layout-editor.css';
import { AddPanelControl } from './AddPanelControl';

const modes: LayoutMode[] = ['Standard', 'Host focus', 'Custom'];
const modeNames: Record<LayoutMode, string> = { Standard: 'Chat focus', 'Chat focus': 'Chat focus', 'Host focus': 'Video focus mode', Custom: 'Custom layout' };
const descriptions: Record<LayoutMode, string> = {
  Standard: 'Maximize control over your LIVE',
  'Chat focus': 'Maximize control over your LIVE',
  'Host focus': 'Bigger LIVE video preview lets you see what your viewers see.',
  Custom: 'Arrange and resize panels to suit your needs.',
};

export function RemovePanelButton({id}:{id:ModuleId}) {
  const {editing,removePanel,canRemovePanel}=useConsoleLayout();
  if(!editing)return null;
  if(!canRemovePanel)return <div className="remove-panel-guard" tabIndex={0} data-testid="last-panel-delete" aria-label={`Remove ${moduleNames[id]} panel unavailable`} aria-describedby={`last-panel-tooltip-${id}`}
    onPointerDown={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
    <button className="remove-panel" type="button" aria-label={`Remove ${moduleNames[id]} panel`} aria-describedby={`last-panel-tooltip-${id}`} disabled><Trash2 size={18}/></button>
    <span className="remove-panel-tooltip last-panel-tooltip" id={`last-panel-tooltip-${id}`} role="tooltip">At least one panel must remain in your LIVE console.</span>
  </div>;
  return <button className="remove-panel" type="button" aria-label={`Remove ${moduleNames[id]} panel`} disabled={!canRemovePanel}
    onPointerDown={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();removePanel(id);}}>
    <Trash2 size={18}/><span className="remove-panel-tooltip" role="tooltip">Remove panel</span>
  </button>;
}

export function ModuleTitle({ children }: { children: React.ReactNode }) {
  const { editing } = useConsoleLayout();
  return <h2 className="module-title" style={{ fontSize: "17px" }}>{editing && <GripVertical size={16} aria-hidden="true"/>}{children}</h2>;
}

export function EditingHeader() {
  const { mode, chooseMode, applyEdit, cancelEdit, applyDisabled, removedPanels } = useConsoleLayout();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(Math.max(0,modes.indexOf(mode)));
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  useEffect(() => { if (open) options.current[focused]?.focus(); }, [open, focused]);
  const choose = (value: LayoutMode) => {
    chooseMode(value);
    setOpen(false);
    trigger.current?.focus();
  };
  return <header className="topbar customize-header">
    <strong className="customize-title">Customize layout</strong>
    <div className="layout-mode-field" ref={root}>
      <button className="layout-mode-trigger" type="button" ref={trigger}
        aria-label="Layout mode" aria-haspopup="listbox" aria-expanded={open} aria-controls="layout-mode-options"
        onClick={() => { setFocused(Math.max(0,modes.indexOf(mode))); setOpen(!open); }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setFocused(Math.max(0,modes.indexOf(mode))); setOpen(true);
          }
        }}>
        <span id="layout-mode-label">Layout mode</span><span>{mode==='Standard'||mode==='Chat focus'?'Chat focus mode':modeNames[mode]}</span><ChevronDown size={16}/>
      </button>
      {open && <div className="layout-mode-options" id="layout-mode-options" role="listbox" aria-labelledby="layout-mode-label"
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setFocused(index => (index + (event.key === 'ArrowDown' ? 1 : modes.length - 1)) % modes.length);
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault(); setFocused(event.key === 'Home' ? 0 : modes.length - 1);
          } else if (event.key === 'Tab') setOpen(false);
        }}>
        {modes.map((value, index) => <button key={value} type="button" role="option" aria-label={modeNames[value]} aria-describedby={`layout-description-${index}`} aria-selected={mode === value}
          ref={node => { options.current[index] = node; }} tabIndex={focused === index ? 0 : -1}
          className={mode === value ? 'is-selected' : ''} onClick={() => choose(value)}>
          <span>{modeNames[value]}</span>
          <span className="layout-mode-description" id={`layout-description-${index}`}>{descriptions[value]}</span>
        </button>)}
      </div>}
    </div>
    <div className={`layout-editor-actions${removedPanels.length?' has-add-panel':''}`}>
      <AddPanelControl/>
      <button className="layout-apply" type="button" disabled={applyDisabled} onClick={applyEdit}>Apply</button>
      <button className="layout-cancel" type="button" onClick={cancelEdit}>Cancel</button>
    </div>
  </header>;
}
