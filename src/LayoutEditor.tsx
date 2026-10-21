import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, GripVertical } from 'lucide-react';
import { LayoutMode, useConsoleLayout } from './ResizableLayout';
import './layout-editor.css';

const modes: LayoutMode[] = ['Balanced', 'Chat focus', 'Custom Layout'];

export function ModuleTitle({ children }: { children: React.ReactNode }) {
  const { editing } = useConsoleLayout();
  return <h2 className="module-title" style={{ fontSize: "17px" }}>{editing && <GripVertical size={16} aria-hidden="true"/>}{children}</h2>;
}

export function EditingHeader() {
  const { mode, chooseMode, applyEdit, cancelEdit } = useConsoleLayout();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(modes.indexOf(mode));
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
      <span id="layout-mode-label">Layout mode</span>
      <button className="layout-mode-trigger" type="button" ref={trigger}
        aria-label={`Layout mode: ${mode}`} aria-haspopup="listbox" aria-expanded={open} aria-controls="layout-mode-options"
        onClick={() => { setFocused(modes.indexOf(mode)); setOpen(!open); }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setFocused(modes.indexOf(mode)); setOpen(true);
          }
        }}>
        <span>{mode}</span><ChevronDown size={16}/>
      </button>
      {open && <div className="layout-mode-options" id="layout-mode-options" role="listbox" aria-labelledby="layout-mode-label"
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setFocused(index => (index + (event.key === 'ArrowDown' ? 1 : 2)) % modes.length);
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault(); setFocused(event.key === 'Home' ? 0 : 2);
          } else if (event.key === 'Tab') setOpen(false);
        }}>
        {modes.map((value, index) => <button key={value} type="button" role="option" aria-selected={mode === value}
          ref={node => { options.current[index] = node; }} tabIndex={focused === index ? 0 : -1}
          className={mode === value ? 'is-selected' : ''} onClick={() => choose(value)}>
          <span>{value}</span>{mode === value && <Check size={16} aria-hidden="true"/>}
        </button>)}
      </div>}
    </div>
    <div className="layout-editor-actions">
      <button className="layout-apply" type="button" onClick={applyEdit}>Apply</button>
      <button className="layout-cancel" type="button" onClick={cancelEdit}>Cancel</button>
    </div>
  </header>;
}
