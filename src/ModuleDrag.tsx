import React, { createContext, useContext, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { DropTarget, ModuleBoard, ModuleId, Rect, dropTargets, moduleNames, moveModule, resolveBoard, targetLabel, targetRect } from './module-layout';
import './module-drag.css';

type DragView = { id: ModuleId; x: number; y: number; target?: DropTarget; reason?: string; keyboard: boolean };
type HeaderProps = React.HTMLAttributes<HTMLDivElement>;
const DragContext = createContext<(id: ModuleId) => HeaderProps>(() => ({}));
const HoverContext = createContext<{ id: ModuleId; rect: Rect } | null>(null);
export const useModuleHeader = (id: ModuleId) => useContext(DragContext)(id);

export function ModuleHoverOverlay() {
  const hovered = useContext(HoverContext);
  return hovered ? <div className="module-hover-overlay" data-hover-module={hovered.id} aria-hidden="true" style={hovered.rect}/> : null;
}

export function ModuleDragProvider({ board, box, editing, container, onMove, children }: {
  board: ModuleBoard; box: { width: number; height: number }; editing: boolean;
  container: React.RefObject<HTMLDivElement>; onMove: (id: ModuleId, target: DropTarget) => void; children: React.ReactNode;
}) {
  const session = useRef<{ id: ModuleId; x: number; y: number; pointer?: number; element?: HTMLElement; active: boolean; view?: DragView } | null>(null);
  const [view, setView] = useState<DragView | null>(null);
  const [hovered, setHovered] = useState<ModuleId | null>(null);
  const [announcement, announce] = useState('');
  const geometry = resolveBoard(board, box);
  const update = (next: DragView) => { if (session.current) session.current.view = next; setView(next); };
  const clear = () => {
    const current = session.current; session.current = null; setView(null); setHovered(null);
    if (current?.pointer !== undefined && current.element?.hasPointerCapture(current.pointer)) current.element.releasePointerCapture(current.pointer);
  };
  const finish = () => {
    const current = session.current;
    if (editing && current?.active && current.view?.target && !current.view.reason) {
      const result = moveModule(board, current.id, current.view.target);
      if (result.changed) { onMove(current.id, current.view.target); announce(`${moduleNames[current.id]} moved. ${targetLabel(current.view.target)}.`); }
    }
    clear();
  };
  React.useEffect(() => {
    if (!editing) { clear(); setHovered(null); }
  }, [editing]);
  React.useEffect(() => { clear(); }, [board]);
  React.useEffect(() => {
    const cancel = (event: KeyboardEvent) => { if (event.key === 'Escape' && session.current) { event.preventDefault(); clear(); announce('Move cancelled.'); } };
    const blur = () => clear();
    document.addEventListener('keydown', cancel); window.addEventListener('blur', blur);
    return () => { document.removeEventListener('keydown', cancel); window.removeEventListener('blur', blur); };
  }, []);

  const hit = (x: number, y: number) => {
    const origin = container.current!.getBoundingClientRect();
    const localX = x - origin.left, localY = y - origin.top;
    if (localX < -16 || localX > geometry.width + 16 || localY < -16 || localY > geometry.height + 16) return undefined;
    const all = dropTargets(board);
    // Column edges take priority over module edges at their intersections.
    return all.find(t => t.type === 'column' && Math.abs(localX - targetRect(t, board, geometry).left) <= 22) ||
      all.find(t => { if (t.type !== 'stack') return false; const r = targetRect(t, board, geometry); return localX > r.left + 22 && localX < r.left + r.width - 22 && Math.abs(localY - r.top) <= 32; });
  };
  const headerProps = (id: ModuleId): HeaderProps => !editing ? {} : {
    role: 'button', tabIndex: 0, 'aria-label': `Move ${moduleNames[id]}`,
    'aria-describedby': 'module-move-instructions', 'aria-pressed': view?.id === id,
    title: 'Drag to move · Space to pick up · Arrow keys to choose a position · Enter to drop · Esc to cancel',
    onPointerDown: event => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('button,a,input,[role="separator"]')) return;
      event.preventDefault(); event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      session.current = { id, x: event.clientX, y: event.clientY, pointer: event.pointerId, element: event.currentTarget, active: false };
    },
    onPointerMove: event => {
      const current = session.current;
      if (!current || current.pointer !== event.pointerId) return;
      if (!current.active && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return;
      current.active = true;
      const scroller = container.current?.parentElement;
      if (scroller) {
        const bounds = scroller.getBoundingClientRect();
        if (event.clientX > bounds.right - 36) scroller.scrollLeft += 20;
        else if (event.clientX < bounds.left + 36) scroller.scrollLeft -= 20;
      }
      const target = hit(event.clientX, event.clientY);
      const result = target ? moveModule(board, id, target) : undefined;
      update({ id, x: event.clientX, y: event.clientY, target, reason: result?.reason || (result && !result.changed ? 'Already in this position' : undefined), keyboard: false });
    },
    onPointerUp: event => { if (session.current?.pointer === event.pointerId) finish(); },
    onPointerCancel: clear,
    onLostPointerCapture: () => { if (session.current?.pointer !== undefined) clear(); },
    onKeyDown: event => {
      if (event.key === 'Tab') { clear(); return; }
      if (![' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Escape') { clear(); return; }
      const available = dropTargets(board).filter(t => moveModule(board, id, t).changed);
      if (!available.length) return;
      if (!session.current) {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        const rect = event.currentTarget.getBoundingClientRect();
        session.current = { id, x: rect.left, y: rect.top, active: true };
        update({ id, x: rect.left + 28, y: rect.top + 48, target: available[0], keyboard: true });
        announce(`${moduleNames[id]} picked up. Use arrow keys to choose a position, Enter to drop, Escape to cancel.`);
      } else if (event.key === ' ' || event.key === 'Enter') finish();
      else {
        const index = available.findIndex(t => JSON.stringify(t) === JSON.stringify(session.current?.view?.target));
        const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
        const target = available[(index + direction + available.length) % available.length];
        const origin = container.current!.getBoundingClientRect(), r = targetRect(target, board, geometry);
        container.current?.parentElement?.scrollTo?.({ left: Math.max(0, r.left - 80), behavior: 'instant' as ScrollBehavior });
        update({ id, x: origin.left + r.left + 16, y: origin.top + r.top + 32, target, keyboard: true });
        announce(targetLabel(target));
      }
    },
  };
  const line = view?.target && !view.reason ? targetRect(view.target, board, geometry) : undefined;
  const origin = container.current?.getBoundingClientRect();
  return <DragContext.Provider value={headerProps}>
    <HoverContext.Provider value={editing && hovered && !view ? { id: hovered, rect: geometry.rects[hovered] } : null}>
    <div className="module-dnd-scope" data-moving={view?.id}
      onPointerMoveCapture={event => {
        const module = (event.target as Element).closest('[data-module-id]');
        setHovered(editing && !session.current?.active && module ? module.getAttribute('data-module-id') as ModuleId : null);
      }}
      onPointerLeave={() => setHovered(null)}>
      {children}
      <span id="module-move-instructions" className="move-sr-only">Drag the header to move. Maximum 4 columns and 3 modules per column. Products must be alone. Space picks up, arrows choose a position, Enter drops, Escape cancels.</span>
      <span className="move-sr-only" role="status" aria-live="polite">{announcement}</span>
      {view && <>
        {line && origin && <div className={`module-drop-line ${view.target!.type === 'column' ? 'vertical' : 'horizontal'}`} data-testid="module-drop-line" style={{
          left: origin.left + Math.min(Math.max(line.left - (line.width === 3 ? 1.5 : 0), 0), geometry.width - line.width),
          top: origin.top + Math.min(Math.max(line.top - (line.height === 3 ? 1.5 : 0), 0), geometry.height - line.height), width: line.width, height: line.height,
        }}/>}
        <div className="module-drag-ghost" style={{ left: Math.max(8, Math.min(view.x + 18, window.innerWidth - 248)), top: Math.max(8, Math.min(view.y + 18, window.innerHeight - 62)) }}>
          <div className="module-drag-ghost-title"><GripVertical size={16}/><strong>{moduleNames[view.id]}</strong></div>
        </div>
      </>}
    </div>
    </HoverContext.Provider>
  </DragContext.Provider>;
}
