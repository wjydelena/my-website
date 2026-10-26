import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical } from 'lucide-react';

type Props = {
  labels: string[];
  customizing: boolean;
  onOrderChange: (labels: string[]) => void;
  onOpen: (label: string) => void;
  graphic: (label: string) => React.ReactNode;
};
type Drag = { label: string; pointer: number; startX: number; startY: number; active: boolean; before: string[] };

export default function PinnedTools({ labels, customizing, onOrderChange, onOpen, graphic }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const current = useRef(labels);
  current.current = labels;
  const drag = useRef<Drag | null>(null);
  const [ghost, setGhost] = useState<{ label: string; x: number; y: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const move = (label: string, index: number) => {
    const next = current.current.filter(value => value !== label);
    next.splice(Math.max(0, Math.min(index, next.length)), 0, label);
    current.current = next;
    onOrderChange(next);
    setAnnouncement(`${label}, position ${next.indexOf(label) + 1} of ${next.length}`);
  };
  const end = (cancel = false) => {
    const state = drag.current;
    drag.current = null;
    setGhost(null);
    if (state && cancel) { current.current = state.before; onOrderChange(state.before); }
    if (state && container.current?.hasPointerCapture(state.pointer)) container.current.releasePointerCapture(state.pointer);
  };
  useEffect(() => {
    if (!customizing) { drag.current = null; setGhost(null); }
  }, [customizing]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drag.current) {
        event.preventDefault(); event.stopImmediatePropagation(); end(true);
      }
    };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, []);
  return <>
    <div className={`promotion-pinned${customizing ? ' is-customizing' : ''}`} ref={container} role="group" aria-label="Pinned tools"
      onPointerMove={event => {
        const state = drag.current;
        if (!state || state.pointer !== event.pointerId) return;
        if (!state.active && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) < 5) return;
        state.active = true;
        event.preventDefault();
        setGhost({ label: state.label, x: event.clientX, y: event.clientY });
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-pinned-label]');
        if (target && container.current?.contains(target)) {
          const label = target.dataset.pinnedLabel!;
          if (label !== state.label) move(state.label, current.current.indexOf(label));
        }
        const scroll = container.current?.closest<HTMLElement>('.promotion-panel-scroll');
        if (scroll) {
          const bounds = scroll.getBoundingClientRect();
          if (event.clientY < bounds.top + 24) scroll.scrollTop -= 12;
          if (event.clientY > bounds.bottom - 24) scroll.scrollTop += 12;
        }
      }}
      onPointerUp={() => end()}
      onPointerCancel={() => end(true)}
      onLostPointerCapture={() => { if (drag.current) end(true); }}>
      {labels.map(label => <button type="button" key={label} data-pinned-label={label}
        className={`promo-pill${ghost?.label === label ? ' is-dragging-pin' : ''}`}
        aria-label={customizing ? `Move ${label}` : label}
        aria-describedby={customizing ? 'pinned-reorder-instructions' : undefined}
        onPointerDown={event => {
          if (!customizing || event.button !== 0) return;
          event.stopPropagation();
          drag.current = { label, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, active: false, before: [...current.current] };
          try { container.current?.setPointerCapture(event.pointerId); } catch { /* Pointer may have ended before capture. */ }
        }}
        onKeyDown={event => {
          if (!customizing || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault(); event.stopPropagation();
          const index = current.current.indexOf(label);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? current.current.length - 1 : index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1);
          move(label, next);
        }}
        onClick={() => { if (!customizing) onOpen(label); }}>
        {customizing && <GripVertical size={14} className="promotion-grip" aria-hidden="true"/>}{graphic(label)}{label}
      </button>)}
      {!labels.length && <span className="promotion-empty">Choose tools below to pin them here.</span>}
    </div>
    <span className="promotion-sr-only" id="pinned-reorder-instructions">Drag to reorder. You can also use arrow keys, Home and End.</span>
    <span className="promotion-sr-only" aria-live="polite">{announcement}</span>
    {ghost && createPortal(<div className="promotion-drag-ghost" style={{ left: ghost.x + 12, top: ghost.y + 12 }} aria-hidden="true"><GripVertical size={14} className="promotion-grip"/>{graphic(ghost.label)}{ghost.label}</div>, document.body)}
  </>;
}
