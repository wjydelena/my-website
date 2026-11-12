import React, { createContext, useContext, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { DropTarget, ModuleBoard, ModuleId, Rect, dropTargets, moduleNames, moveModule, resolveBoard, targetLabel, targetRect, stackBlockedReason, COLUMN_CAPACITY_MESSAGE } from './module-layout';
import './module-drag.css';

type DragView = { id: ModuleId; x: number; y: number; target?: DropTarget; reason?: string; keyboard: boolean; blockedColumn?: number };
type HeaderProps = React.HTMLAttributes<HTMLDivElement>;
type MotionSurface = { id: ModuleId; node: HTMLElement; rect: Rect; offset?: {left: number; top: number}; animation?: Animation; settled?: boolean };
function releaseSurface(surface: MotionSurface) {
  surface.animation?.cancel();
  surface.node.classList.remove('module-displacement-surface', 'module-preview-source');
  for (const key of ['left','top','width','height']) surface.node.style.removeProperty(`--floating-${key}`);
}
const DragContext = createContext<(id: ModuleId) => HeaderProps>(() => ({}));
const HoverContext = createContext<{ id: ModuleId; rect: Rect } | null>(null);
const BlockedContext = createContext<{ column: number; rect: Rect; message: string } | null>(null);
const PreviewContext = createContext<Rect | null>(null);
export const useModuleHeader = (id: ModuleId) => useContext(DragContext)(id);

export function ModuleHoverOverlay() {
  const hovered = useContext(HoverContext);
  const blocked = useContext(BlockedContext);
  const placeholder = useContext(PreviewContext);
  return <>
    {placeholder && <div className="module-drop-placeholder" data-testid="module-drop-placeholder" aria-hidden="true" style={placeholder}/>}
    {hovered && <div className="module-hover-overlay" data-hover-module={hovered.id} aria-hidden="true" style={hovered.rect}/>}
    {blocked && <div className="module-blocked-overlay" data-blocked-column={blocked.column} style={blocked.rect}><span>{blocked.message}</span></div>}
  </>;
}

export function ModuleDragProvider({ board, box, editing, container, onMove, children }: {
  board: ModuleBoard; box: { width: number; height: number }; editing: boolean;
  container: React.RefObject<HTMLDivElement>; onMove: (id: ModuleId, target: DropTarget) => void; children: React.ReactNode;
}) {
  const session = useRef<{ id: ModuleId; x: number; y: number; grabX?: number; grabY?: number; pointer?: number; element?: HTMLElement; active: boolean; view?: DragView } | null>(null);
  const [view, setView] = useState<DragView | null>(null);
  const [hovered, setHovered] = useState<ModuleId | null>(null);
  const [announcement, announce] = useState('');
  const [tipTop, setTipTop] = useState<number | null>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout>>();
  const dismissTip = () => { clearTimeout(tipTimer.current); setTipTop(null); };
  React.useEffect(() => {
    dismissTip();
    if (!editing) return;
    tipTimer.current = setTimeout(() => {
      const banner = container.current?.closest('.console-shell')?.querySelector('header');
      setTipTop((banner?.getBoundingClientRect().bottom ?? 56) + 20);
    }, 300);
    const operate = (event: Event) => {
      if (event instanceof KeyboardEvent && ['Tab','Shift','Control','Alt','Meta'].includes(event.key)) return;
      dismissTip();
    };
    for (const type of ['pointerdown','click','keydown','wheel']) document.addEventListener(type, operate, true);
    return () => {
      clearTimeout(tipTimer.current);
      for (const type of ['pointerdown','click','keydown','wheel']) document.removeEventListener(type, operate, true);
    };
  }, [editing]);
  const suppressClick = useRef(false);
  const geometry = resolveBoard(board, box);
  const surfaces = useRef<MotionSurface[]>([]);
  const droppedRects = useRef<Map<ModuleId, Rect> | null>(null);
  const motionLayout = useRef({ board, width: box.width, height: box.height });
  const proposed = view?.target && !view.reason ? moveModule(board, view.id, view.target) : undefined;
  const preview = proposed?.changed ? resolveBoard(proposed.board, box) : undefined;
  const previewKey = preview && view ? `${view.id}:${JSON.stringify(view.target)}` : '';
  // Animate only the rendered surfaces. The board and hit-test geometry stay unchanged until drop.
  React.useLayoutEffect(() => {
    const previous = motionLayout.current;
    if (previous.board !== board || previous.width !== box.width || previous.height !== box.height) {
      container.current?.classList.remove('module-displacement-layout');
      surfaces.current.forEach(s => { releaseSurface(s); });
      surfaces.current = [];
      motionLayout.current = { board, width: box.width, height: box.height };
    }
    const dropped = droppedRects.current;
    droppedRects.current = null;
    if ((view || dropped) && !surfaces.current.length && container.current) {
      const origin = container.current.getBoundingClientRect();
      container.current.querySelectorAll<HTMLElement>('[data-module-id]').forEach(module => {
        const id = module.dataset.moduleId as ModuleId;
        if (getComputedStyle(module).display === 'none') return;
        // Measure Activity's region before giving its display:contents wrapper a temporary box.
        const nodes = getComputedStyle(module).display === 'contents' ? Array.from(module.children) as HTMLElement[] : [module];
        const parts = nodes.map(node => ({ node, bounds: node.getBoundingClientRect() })).filter(p => p.bounds.width && p.bounds.height);
        if (!parts.length) return;
        const left = Math.min(...parts.map(p => p.bounds.left)) - origin.left;
        const top = Math.min(...parts.map(p => p.bounds.top)) - origin.top;
        const rect = { left, top, width: Math.max(...parts.map(p => p.bounds.right)) - origin.left - left, height: Math.max(...parts.map(p => p.bounds.bottom)) - origin.top - top };
        surfaces.current.push({ id, node: module, rect });
      });
      container.current.classList.add('module-displacement-layout');
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = (r: Rect, offset: {left: number; top: number}) => ({ left: `${r.left - offset.left}px`, top: `${r.top - offset.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    surfaces.current.forEach(surface => {
      const destination = preview?.rects[surface.id];
      const moving = surface.id === view?.id || !!(board.chatActivityMerged && view?.id === 'chat' && surface.id === 'activity');
      const floating = surface.node.classList.contains('module-preview-source') ? surface.node.getBoundingClientRect() : undefined;
      surface.node.classList.add('module-displacement-surface');
      if (!surface.offset) {
        const origin = container.current!.getBoundingClientRect();
        const parent = surface.node.offsetParent?.getBoundingClientRect() || origin;
        surface.offset = {left: parent.left - origin.left, top: parent.top - origin.top};
      }
      const style = getComputedStyle(surface.node);
      const origin = container.current!.getBoundingClientRect();
      const current = floating && !moving ? frame({left: floating.left - origin.left, top: floating.top - origin.top, width: floating.width, height: floating.height}, surface.offset) : surface.animation ? {left: style.left, top: style.top, width: style.width, height: style.height} : frame(dropped?.get(surface.id) || surface.rect, surface.offset);
      surface.animation?.cancel();
      surface.node.classList.toggle('module-preview-source', !!view && moving);
      surface.node.style.setProperty('--floating-width', `${surface.rect.width}px`);
      surface.node.style.setProperty('--floating-height', `${surface.rect.height}px`);
      const animation = surface.node.animate([current, frame(destination || surface.rect, surface.offset)], {
        duration: reduced ? 0 : 200, easing: 'cubic-bezier(.25, .8, .25, 1)', fill: 'both',
      });
      surface.animation = animation;
      surface.settled = false;
      if (!view) animation.onfinish = () => {
        if (surface.animation !== animation) return;
        surface.settled = true;
        // Restore all wrappers together: no intermediate flex/grid reflow on cancellation.
        if (surfaces.current.every(s => s.settled)) {
          container.current?.classList.remove('module-displacement-layout');
          surfaces.current.forEach(s => { releaseSurface(s); });
          surfaces.current = [];
        }
      };
    });
  }, [previewKey, view?.id, board, box.width, box.height, editing]);
  React.useLayoutEffect(() => () => {
    container.current?.classList.remove('module-displacement-layout');
    surfaces.current.forEach(s => { releaseSurface(s); });
    surfaces.current = [];
  }, []);
  const update = (next: DragView) => { if (session.current) session.current.view = next; setView(next); };
  const clear = () => {
    const current = session.current;
    if (current) suppressClick.current = false;
    session.current = null; setView(null); setHovered(null);
    if (current?.pointer !== undefined && current.element?.hasPointerCapture(current.pointer)) current.element.releasePointerCapture(current.pointer);
  };
  const finish = () => {
    const current = session.current;
    if (editing && current?.active && current.view?.target && !current.view.reason) {
      const result = moveModule(board, current.id, current.view.target);
      if (result.changed) {
        const origin = container.current!.getBoundingClientRect();
        droppedRects.current = new Map(surfaces.current.map(s => {
          const r = s.node.getBoundingClientRect();
          return [s.id, {left: r.left - origin.left, top: r.top - origin.top, width: r.width, height: r.height}];
        }));
        onMove(current.id, current.view.target); announce(`${moduleNames[current.id]} moved. ${targetLabel(current.view.target)}.`);
      }
    }
    clear();
    suppressClick.current = !!current?.active && current.pointer !== undefined;
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
    // Like the reference sortable cards: crossing a panel's midpoint shifts its neighbors.
    const edge = all.find(t => t.type === 'column' && Math.abs(localX - targetRect(t, board, geometry).left) <= 32);
    if (edge) return edge;
    const column = board.columns.findIndex(c => {const r=geometry.rects[c.modules[0]];return localX>=r.left&&localX<r.left+r.width;});
    if (column < 0) return undefined;
    const candidates = all.filter((t):t is Extract<DropTarget,{type:'stack'}> => t.type==='stack'&&t.column===column);
    let index = board.columns[column].modules.length;
    for (let i=0;i<board.columns[column].modules.length;i++) {
      const id=board.columns[column].modules[i];
      if(board.chatActivityMerged&&id==='activity')continue;
      const r=geometry.rects[id];
      if(localY<r.top+r.height/2){index=i;break;}
    }
    return candidates.find(t=>t.index===index);
  };
  const pointerProps: React.HTMLAttributes<HTMLDivElement> = {
    onPointerDown: event => {
      suppressClick.current = false;
      const target = event.target as Element;
      const module = target.closest('[data-module-id]');
      if (!editing || event.button !== 0 || !module || target.closest('[role="separator"]') || session.current) return;
      const id = module.getAttribute('data-module-id') as ModuleId;
      const nodes = getComputedStyle(module).display === 'contents' ? Array.from(module.children) : [module];
      const rects = nodes.map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height);
      const left = Math.min(...rects.map(r=>r.left)), top = Math.min(...rects.map(r=>r.top));
      session.current = { id, x: event.clientX, y: event.clientY, grabX: event.clientX-left, grabY: event.clientY-top, pointer: event.pointerId, element: event.currentTarget, active: false };
    },
    onPointerMove: event => {
      const current = session.current;
      if (!current || current.pointer !== event.pointerId) return;
      if (!current.active && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return;
      if (!current.active) {
        current.element?.setPointerCapture(event.pointerId);
        container.current?.querySelector<HTMLElement>(`[aria-label="Move ${moduleNames[current.id]}"]`)?.focus({ preventScroll: true });
      }
      current.active = true;
      suppressClick.current = true;
      event.preventDefault();
      const scroller = container.current?.parentElement;
      if (scroller) {
        const bounds = scroller.getBoundingClientRect();
        if (event.clientX > bounds.right - 36) scroller.scrollLeft += 20;
        else if (event.clientX < bounds.left + 36) scroller.scrollLeft -= 20;
      }
      const target = hit(event.clientX, event.clientY);
      const result = target ? moveModule(board, current.id, target) : undefined;
      const origin = container.current!.getBoundingClientRect();
      const x = event.clientX - origin.left, y = event.clientY - origin.top;
      let blockedColumn: number | undefined;
      let blockedReason: string | undefined;
      if (target?.type !== 'column' && y >= 0 && y <= geometry.height) {
        const column = board.columns.findIndex(col => {
          const r = geometry.rects[col.modules[0]];
          return x >= r.left && x < r.left + r.width;
        });
        if (column >= 0) {
          // Reordering within Products' own column is not an invalid cross-column hover.
          if(!(current.id==='products'&&board.columns[column].modules.includes('products'))){
            blockedReason=stackBlockedReason(board,current.id,column);
            if(blockedReason)blockedColumn=column;
          }
        }
      }
      if(blockedReason&&blockedReason!==current.view?.reason)announce(blockedReason);
      update({ id: current.id, x: event.clientX, y: event.clientY, target, blockedColumn,
        reason: blockedReason || result?.reason || (result && !result.changed ? 'Already in this position' : undefined), keyboard: false });
    },
    onPointerUp: event => {
      if (session.current?.pointer === event.pointerId) {
        finish();
        window.setTimeout(() => { suppressClick.current = false; }, 0);
      }
    },
    onPointerCancel: clear,
    onLostPointerCapture: () => { if (session.current?.pointer !== undefined) clear(); },
    onClickCapture: event => {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
    onDragStartCapture: event => {
      if (editing && (event.target as Element).closest('[data-module-id]')) event.preventDefault();
    },
  };
  const headerProps = (id: ModuleId): HeaderProps => !editing ? {} : {
    role: 'button', tabIndex: 0, 'aria-label': `Move ${moduleNames[id]}`,
    'aria-describedby': 'module-move-instructions', 'aria-pressed': view?.id === id,
    onKeyDown: event => {
      if (event.key === 'Tab') { clear(); return; }
      if (![' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Escape') { clear(); return; }
      const available = dropTargets(board).filter(t => {const result=moveModule(board,id,t);return result.changed||result.reason===COLUMN_CAPACITY_MESSAGE;});
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
        const reason=moveModule(board,id,target).reason;
        update({ id, x: origin.left + r.left + 16, y: origin.top + r.top + 32, target, reason,
          blockedColumn:reason===COLUMN_CAPACITY_MESSAGE&&target.type==='stack'?target.column:undefined, keyboard: true });
        announce(reason||targetLabel(target));
      }
    },
  };
  const blocked = view?.blockedColumn !== undefined ? {
    column: view.blockedColumn,
    message: view.reason ?? '',
    rect: { left: geometry.rects[board.columns[view.blockedColumn].modules[0]].left, top: 0, width: geometry.widths[view.blockedColumn], height: geometry.height },
  } : null;
  return <DragContext.Provider value={headerProps}>
    <HoverContext.Provider value={editing && hovered && geometry.rects[hovered] && !view ? { id: hovered, rect: geometry.rects[hovered] } : null}>
    <BlockedContext.Provider value={blocked}>
    <PreviewContext.Provider value={view && preview ? preview.rects[view.id] : null}>
    <div className="module-dnd-scope" data-moving={view?.id} data-drop-preview={preview ? 'true' : undefined} data-drop-blocked={blocked ? 'true' : undefined} {...pointerProps}
      onPointerMoveCapture={event => {
        if((event.target as Element).closest('.remove-panel, .remove-panel-guard')){setHovered(null);return;}
        const module = (event.target as Element).closest('[data-module-id]');
        setHovered(editing && !session.current?.active && module ? module.getAttribute('data-module-id') as ModuleId : null);
      }}
      onPointerLeave={() => { setHovered(null); if (session.current && !session.current.active) clear(); }}>
      {children}
      {editing && tipTop !== null && <div className="layout-edit-tip" role="status" style={{top: tipTop}}>Make it yours. Move, resize, add, or remove panels.</div>}
      {view && <div className="module-anchor-card" aria-hidden="true" data-testid="module-anchor-card" style={{left: Math.max(8, Math.min(view.x + 18, window.innerWidth - 248)), top: Math.max(8, Math.min(view.y + 18, window.innerHeight - 58))}}><GripVertical size={16}/><span>{moduleNames[view.id]}</span></div>}
      <span id="module-move-instructions" className="move-sr-only">Drag anywhere in a module to move it. Maximum 5 columns and 3 modules per column. Products must be alone. Space picks up, arrows choose a position, Enter drops, Escape cancels.</span>
      <span className="move-sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
    </PreviewContext.Provider>
    </BlockedContext.Provider>
    </HoverContext.Provider>
  </DragContext.Provider>;
}
