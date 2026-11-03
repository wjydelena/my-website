import React, { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import './resize.css';
import { ModuleBoard, ModuleId, DropTarget, MODULES, boardMinWidth, cloneBoard, moveModule, resolveBoard } from './module-layout';
import { ModuleDragProvider, ModuleHoverOverlay } from './ModuleDrag';
import { BoardResizeHandles } from './BoardResizeHandles';

type Kind = 'products' | 'live' | 'video' | 'analytics' | 'feed';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const MIN_PRODUCTS_WIDTH = 400;
const MIN_LIVE_WIDTH = 324;
const MIN_ANALYTICS_WIDTH = 324;
export type LayoutMode = 'Standard' | 'Chat focus' | 'Host focus' | 'Custom';
type Arrangement = 'balanced' | 'chat-focus' | 'host-focus';
type Heights = { video: number; analytics: number; feed: number };
type GeometrySource = { ratios: number[]; heights: Heights; arrangement: Arrangement; board: ModuleBoard | null };
function resolveValues(source: GeometrySource, box: { width: number; height: number }) {
  const { ratios, heights, arrangement } = source;
  const focusedChat = arrangement === 'chat-focus';
  if (arrangement === 'host-focus') return { products: 0, live: box.width / 3, video: box.height, analytics: clamp(heights.analytics, 194, box.height - 310), feed: clamp(heights.feed, 160, box.height - heights.analytics - 150) };
  const products = clamp(ratios[0] * box.width, MIN_PRODUCTS_WIDTH, box.width - MIN_LIVE_WIDTH - MIN_ANALYTICS_WIDTH);
  const live = clamp(ratios[1] * box.width, MIN_LIVE_WIDTH, box.width - products - MIN_ANALYTICS_WIDTH);
  const video = clamp(heights.video, 200, focusedChat ? box.height - 194 - 160 - 110 : box.height - 200);
  const analytics = clamp(heights.analytics, 194, focusedChat ? box.height - video - 160 - 110 : box.height - 310);
  const feed = clamp(heights.feed, 160, focusedChat ? box.height - video - analytics - 110 : box.height - analytics - 150);
  return { products, live, video, analytics, feed };
}
function sourceBoard(source: GeometrySource, box: { width: number; height: number }): ModuleBoard {
  if (source.board) return source.board;
  if (source.arrangement === 'host-focus') {
    const v = resolveValues(source, box);
    return { productsHidden: true, columns: [
      { modules: ['video'], width: 1, heights: [box.height] },
      { modules: ['chat'], width: 1, heights: [box.height] },
      { modules: ['analytics', 'activity'], width: 1, heights: [v.analytics, box.height - v.analytics] },
    ] };
  }
  const v = resolveValues(source, box), third = box.width - v.products - v.live;
  return { columns: source.arrangement === 'chat-focus' ? [
    { modules: ['products'], width: v.products, heights: [box.height] },
    { modules: ['chat'], width: third, heights: [box.height] },
    { modules: ['video', 'analytics', 'activity'], width: v.live, heights: [v.video, v.analytics, box.height - v.video - v.analytics] },
  ] : [
    { modules: ['products'], width: v.products, heights: [box.height] },
    { modules: ['video', 'chat'], width: v.live, heights: [v.video, box.height - v.video] },
    { modules: ['analytics', 'activity'], width: third, heights: [v.analytics, box.height - v.analytics] },
  ] };
}
type LayoutState = {
  values: Record<Kind, number>;
  ranges: Record<Kind, number[]>;
  change: (kind: Kind, value: number) => void;
  reset: (kind: Kind) => void;
  editing: boolean;
  mode: LayoutMode;
  arrangement: Arrangement;
  docked: boolean;
  moduleStyle: (id: ModuleId) => React.CSSProperties | undefined;
  applyDisabled: boolean;
  beginEdit: () => void;
  applyEdit: () => void;
  cancelEdit: () => void;
  chooseMode: (mode: LayoutMode) => void;
};
const LayoutContext = createContext<LayoutState | null>(null);
export function useConsoleLayout() {
  const layout = useContext(LayoutContext);
  if (!layout) throw new Error('Layout controls require ResizableColumns');
  return layout;
}

export function ResizableColumns({ children, header }: { children: React.ReactNode; header?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 1190, height: 818 });
  const [ratios, setRatios] = useState([.4, .3, .3]);
  const [heights, setHeights] = useState({ video: 340, analytics: 194, feed: 272 });
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<LayoutMode>('Standard');
  const [arrangement, setArrangement] = useState<Arrangement>('balanced');
  const [board, setBoard] = useState<ModuleBoard | null>(null);
  const focusedChat = arrangement === 'chat-focus';
  const focusedHost = arrangement === 'host-focus';
  const absoluteLayout = !!board || focusedHost;
  const customBaseline = useRef<GeometrySource | null>(null);
  const currentGeometry = (): GeometrySource => ({ ratios: [...ratios], heights: { ...heights }, arrangement, board });
  const saved = useRef<(GeometrySource & { mode: LayoutMode }) | null>(null);
  const beginEdit = () => {
    saved.current = { ...currentGeometry(), mode };
    customBaseline.current = mode === 'Custom' ? currentGeometry() : null;
    setEditing(true);
  };
  const applyEdit = () => {
    if (applyDisabled) return;
    saved.current = null;
    customBaseline.current = null;
    setEditing(false);
  };
  const cancelEdit = () => {
    if (saved.current) {
      setRatios(saved.current.ratios);
      setHeights(saved.current.heights);
      setMode(saved.current.mode);
      setArrangement(saved.current.arrangement);
      setBoard(saved.current.board);
    }
    saved.current = null;
    customBaseline.current = null;
    setEditing(false);
  };
  const chooseMode = (next: LayoutMode) => {
    if (next === 'Custom') {
      if (mode !== 'Custom') customBaseline.current = currentGeometry();
    } else { customBaseline.current = null; setBoard(null); }
    setMode(next);
    if (next === 'Standard') {
      setArrangement('balanced');
      setRatios([.4, .3, .3]);
      setHeights({ video: 340, analytics: 194, feed: 272 });
    } else if (next === 'Chat focus') {
      setArrangement('chat-focus');
      setRatios([.38, .31, .31]);
      setHeights({ video: 240, analytics: 198, feed: 206 });
    } else if (next === 'Host focus') {
      setArrangement('host-focus');
      setHeights({ video: 340, analytics: 194, feed: 272 });
    }
  };
  useLayoutEffect(() => {
    const element = ref.current!;
    const measure = () => setBox({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // Resolve the draft and its baseline at the same viewport, so viewport resizing
  // alone never counts as a custom edit. Keep all existing size constraints.
  const currentSource = { ratios, heights, arrangement, board };
  const visibleBoard = sourceBoard(currentSource, box);
  const boardGeometry = resolveBoard(visibleBoard, box);
  const values = resolveValues(currentSource, box);
  if (absoluteLayout) values.feed = clamp(heights.feed, 160, boardGeometry.rects.activity.height - 110);
  const { products, live, video, analytics, feed } = values;
  const widths = [products, live, box.width - products - live];
  const baselineValues = customBaseline.current ? resolveValues(customBaseline.current, box) : values;
  const baselineBoard = sourceBoard(customBaseline.current || currentSource, box);
  const baselineGeometry = resolveBoard(baselineBoard, box);
  const placementChanged = MODULES.some(id => {
    const current = boardGeometry.rects[id], baseline = baselineGeometry.rects[id];
    if (!current || !baseline) return current !== baseline;
    return (['left', 'top', 'width', 'height'] as const).some(key => Math.abs(current[key] - baseline[key]) > .01);
  });
  const baselineFeed = (customBaseline.current?.board || customBaseline.current?.arrangement === 'host-focus') ? clamp(customBaseline.current.heights.feed, 160, baselineGeometry.rects.activity.height - 110) : baselineValues.feed;
  const customChanged = placementChanged || Math.abs(values.feed - baselineFeed) > .01;
  const applyDisabled = editing && mode === 'Custom' && !customChanged;
  const markCustom = () => {
    if (mode !== 'Custom') customBaseline.current = currentGeometry();
    setMode('Custom');
  };
  const ranges = {
    products: [MIN_PRODUCTS_WIDTH, focusedChat ? products + widths[2] - MIN_ANALYTICS_WIDTH : products + live - MIN_LIVE_WIDTH],
    live: [MIN_LIVE_WIDTH, live + widths[2] - MIN_ANALYTICS_WIDTH],
    video: [200, focusedChat ? box.height - analytics - feed - 110 : box.height - 200],
    analytics: [194, focusedChat ? box.height - video - feed - 110 : box.height - feed - 150],
    feed: [160, absoluteLayout ? boardGeometry.rects.activity.height - 110 : focusedChat ? box.height - video - analytics - 110 : box.height - analytics - 150],
  };
  const change = (kind: Kind, input: number) => {
    const [min, max] = ranges[kind];
    const next = clamp(input, min, max);
    if (Math.abs(next - values[kind]) <= 0.01) return;
    markCustom();
    if (kind === 'products') setRatios(focusedChat
      ? [next / box.width, live / box.width, (products + widths[2] - next) / box.width]
      : [next / box.width, (products + live - next) / box.width, widths[2] / box.width]);
    else if (kind === 'live') setRatios([products / box.width, next / box.width, (live + widths[2] - next) / box.width]);
    else setHeights(previous => ({ ...previous, [kind]: next }));
  };
  const reset = (kind: Kind) => {
    if (kind === 'products' || kind === 'live') { markCustom(); setRatios(focusedChat ? [.38, .31, .31] : [.4, .3, .3]); }
    else change(kind, (focusedChat ? { video: 240, analytics: 198, feed: 206 } : { video: 340, analytics: 194, feed: 272 })[kind]);
  };
  const move = (id: ModuleId, target: DropTarget) => {
    if (!editing) return;
    const result = moveModule(visibleBoard, id, target);
    if (!result.changed) return;
    markCustom(); setBoard(result.board);
  };
  const resizeBoard = (axis: 'column' | 'row', column: number, row: number, next: number) => {
    if (!absoluteLayout) return;
    const draft = cloneBoard(visibleBoard), geometry = resolveBoard(visibleBoard, box);
    const current = axis === 'column' ? geometry.widths[column] : geometry.rows[column][row];
    if (Math.abs(next - current) <= .01) return;
    if (axis === 'column') {
      draft.columns.forEach((col, c) => { col.width = geometry.widths[c]; });
      draft.columns[column].width = next;
      draft.columns[column + 1].width += current - next;
    } else {
      draft.columns[column].heights = [...geometry.rows[column]];
      draft.columns[column].heights[row] = next;
      draft.columns[column].heights[row + 1] += current - next;
    }
    markCustom(); setBoard(draft);
  };
  const moduleStyle = (id: ModuleId): React.CSSProperties | undefined => id === 'products' && visibleBoard.productsHidden ? { display: 'none' } : absoluteLayout ? { ...boardGeometry.rects[id], position: 'absolute' } : undefined;
  const style = {
    gridTemplateColumns: (focusedChat ? [products, widths[2], live] : widths).map(width => `${width}px`).join(' '),
    gridTemplateRows: focusedChat ? `${video}px ${analytics}px 54px minmax(0, 1fr) ${feed}px` : undefined,
    '--products-edge': `${products}px`, '--live-edge': `${focusedChat ? products + widths[2] : products + live}px`,
    '--video-height': `${video}px`, '--analytics-height': `${analytics}px`, '--feed-height': `${feed}px`,
  } as React.CSSProperties;
  if (absoluteLayout) style.minWidth = boardMinWidth(visibleBoard);
  return <LayoutContext.Provider value={{ values, ranges, change, reset, editing, mode, arrangement, docked: absoluteLayout, moduleStyle, applyDisabled, beginEdit, applyEdit, cancelEdit, chooseMode }}>
    <ModuleDragProvider board={visibleBoard} box={box} editing={editing} container={ref} onMove={move}>
    {header}
    <div className="layout-viewport">
    <div className={`columns resizable-columns${editing ? ' layout-editing' : ''}${focusedChat ? ' chat-focus' : ''}${focusedHost ? ' host-focus' : ''}${absoluteLayout ? ' docked-layout' : ''}`} data-column-count={visibleBoard.columns.length} ref={ref} style={style}>
      {children}
      <ModuleHoverOverlay/>
      {absoluteLayout ? <BoardResizeHandles board={visibleBoard} box={box} resize={resizeBoard}/> : <>
        <ResizeHandle kind="products" label={focusedChat ? 'Resize products and chat columns' : 'Resize products and live columns'} />
        <ResizeHandle kind="live" label={focusedChat ? 'Resize chat and live columns' : 'Resize live and analytics columns'} />
      </>}
    </div>
    </div>
    </ModuleDragProvider>
  </LayoutContext.Provider>;
}

export function ResizeHandle({ kind, label }: { kind: Kind; label: string }) {
  const { values, ranges, change, reset, docked, arrangement } = useConsoleLayout();
  const vertical = kind === 'products' || kind === 'live';
  const direction = kind === 'feed' || (kind === 'live' && arrangement === 'chat-focus') ? -1 : 1;
  const drag = useRef<{ id: number; origin: number; value: number } | null>(null);
  const [active, setActive] = useState(false);
  const finish = () => { drag.current = null; setActive(false); };
  if (docked && kind !== 'feed') return null;
  return <div
    className={`resize-handle resize-${kind} ${vertical ? 'vertical' : 'horizontal'}${active ? ' is-dragging' : ''}`}
    role="separator" tabIndex={0} aria-label={label}
    aria-orientation={vertical ? 'vertical' : 'horizontal'}
    aria-valuenow={Math.round(values[kind])} aria-valuemin={Math.round(ranges[kind][0])} aria-valuemax={Math.round(ranges[kind][1])}
    aria-valuetext={`${Math.round(values[kind])} pixels`}
    title="Drag to resize · Double-click to reset · Arrow keys to adjust"
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, origin: vertical ? event.clientX : event.clientY, value: values[kind] };
      setActive(true);
    }}
    onPointerMove={event => {
      if (!drag.current || event.pointerId !== drag.current.id) return;
      change(kind, drag.current.value + direction * ((vertical ? event.clientX : event.clientY) - drag.current.origin));
    }}
    onPointerUp={event => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      finish();
    }}
    onPointerCancel={finish} onLostPointerCapture={finish}
    onDoubleClick={() => reset(kind)}
    onKeyDown={event => {
      const positive = vertical ? 'ArrowRight' : 'ArrowDown';
      const negative = vertical ? 'ArrowLeft' : 'ArrowUp';
      if (![positive, negative, 'Home', 'End', 'Enter'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Enter') reset(kind);
      else if (event.key === 'Home') change(kind, ranges[kind][0]);
      else if (event.key === 'End') change(kind, ranges[kind][1]);
      else change(kind, values[kind] + (event.key === positive ? 1 : -1) * direction * (event.shiftKey ? 40 : 10));
    }}
  />;
}
