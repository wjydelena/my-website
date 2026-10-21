import React, { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import './resize.css';

type Kind = 'products' | 'live' | 'video' | 'analytics' | 'feed';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const MIN_PRODUCTS_WIDTH = 400;
const MIN_LIVE_WIDTH = 324;
const MIN_ANALYTICS_WIDTH = 324;
export type LayoutMode = 'Balanced' | 'Chat focus' | 'Custom Layout';
type Arrangement = 'balanced' | 'chat-focus';
type Heights = { video: number; analytics: number; feed: number };
type GeometrySource = { ratios: number[]; heights: Heights; arrangement: Arrangement };
function resolveValues(source: GeometrySource, box: { width: number; height: number }) {
  const { ratios, heights, arrangement } = source;
  const focusedChat = arrangement === 'chat-focus';
  const products = clamp(ratios[0] * box.width, MIN_PRODUCTS_WIDTH, box.width - MIN_LIVE_WIDTH - MIN_ANALYTICS_WIDTH);
  const live = clamp(ratios[1] * box.width, MIN_LIVE_WIDTH, box.width - products - MIN_ANALYTICS_WIDTH);
  const video = clamp(heights.video, 200, focusedChat ? box.height - 194 - 160 - 110 : box.height - 200);
  const analytics = clamp(heights.analytics, 194, focusedChat ? box.height - video - 160 - 110 : box.height - 310);
  const feed = clamp(heights.feed, 160, focusedChat ? box.height - video - analytics - 110 : box.height - analytics - 150);
  return { products, live, video, analytics, feed };
}
type LayoutState = {
  values: Record<Kind, number>;
  ranges: Record<Kind, number[]>;
  change: (kind: Kind, value: number) => void;
  reset: (kind: Kind) => void;
  editing: boolean;
  mode: LayoutMode;
  arrangement: Arrangement;
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
  const [ratios, setRatios] = useState([.38, .31, .31]);
  const [heights, setHeights] = useState({ video: 340, analytics: 194, feed: 272 });
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<LayoutMode>('Balanced');
  const [arrangement, setArrangement] = useState<Arrangement>('balanced');
  const focusedChat = arrangement === 'chat-focus';
  const customBaseline = useRef<GeometrySource | null>(null);
  const currentGeometry = (): GeometrySource => ({ ratios: [...ratios], heights: { ...heights }, arrangement });
  const saved = useRef<{ ratios: number[]; heights: Heights; mode: LayoutMode; arrangement: Arrangement } | null>(null);
  const beginEdit = () => {
    saved.current = { ratios: [...ratios], heights: { ...heights }, mode, arrangement };
    customBaseline.current = mode === 'Custom Layout' ? currentGeometry() : null;
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
    }
    saved.current = null;
    customBaseline.current = null;
    setEditing(false);
  };
  const chooseMode = (next: LayoutMode) => {
    if (next === 'Custom Layout') {
      if (mode !== 'Custom Layout') customBaseline.current = currentGeometry();
    } else customBaseline.current = null;
    setMode(next);
    if (next === 'Balanced') {
      setArrangement('balanced');
      setRatios([.38, .31, .31]);
      setHeights({ video: 340, analytics: 194, feed: 272 });
    } else if (next === 'Chat focus') {
      setArrangement('chat-focus');
      setRatios([.38, .31, .31]);
      setHeights({ video: 240, analytics: 198, feed: 206 });
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
  const values = resolveValues({ ratios, heights, arrangement }, box);
  const { products, live, video, analytics, feed } = values;
  const widths = [products, live, box.width - products - live];
  const baselineValues = customBaseline.current ? resolveValues(customBaseline.current, box) : values;
  const customChanged = (Object.keys(values) as Kind[]).some(kind => Math.abs(values[kind] - baselineValues[kind]) > 0.01);
  const applyDisabled = editing && mode === 'Custom Layout' && !customChanged;
  const markCustom = () => {
    if (mode !== 'Custom Layout') customBaseline.current = currentGeometry();
    setMode('Custom Layout');
  };
  const ranges = {
    products: [MIN_PRODUCTS_WIDTH, focusedChat ? products + widths[2] - MIN_ANALYTICS_WIDTH : products + live - MIN_LIVE_WIDTH],
    live: [MIN_LIVE_WIDTH, focusedChat ? live + products - MIN_PRODUCTS_WIDTH : live + widths[2] - MIN_ANALYTICS_WIDTH],
    video: [200, focusedChat ? box.height - analytics - feed - 110 : box.height - 200],
    analytics: [194, focusedChat ? box.height - video - feed - 110 : box.height - feed - 150],
    feed: [160, focusedChat ? box.height - video - analytics - 110 : box.height - analytics - 150],
  };
  const change = (kind: Kind, input: number) => {
    const [min, max] = ranges[kind];
    const next = clamp(input, min, max);
    if (Math.abs(next - values[kind]) <= 0.01) return;
    markCustom();
    if (kind === 'products') setRatios(focusedChat
      ? [next / box.width, live / box.width, (products + widths[2] - next) / box.width]
      : [next / box.width, (products + live - next) / box.width, widths[2] / box.width]);
    else if (kind === 'live') setRatios(focusedChat
      ? [(products + live - next) / box.width, next / box.width, widths[2] / box.width]
      : [products / box.width, next / box.width, (live + widths[2] - next) / box.width]);
    else setHeights(previous => ({ ...previous, [kind]: next }));
  };
  const reset = (kind: Kind) => {
    if (kind === 'products' || kind === 'live') { markCustom(); setRatios([.38, .31, .31]); }
    else change(kind, (focusedChat ? { video: 240, analytics: 198, feed: 206 } : { video: 340, analytics: 194, feed: 272 })[kind]);
  };
  const style = {
    gridTemplateColumns: (focusedChat ? [live, products, widths[2]] : widths).map(width => `${width}px`).join(' '),
    gridTemplateRows: focusedChat ? `${video}px ${analytics}px 54px minmax(0, 1fr) ${feed}px` : undefined,
    '--products-edge': `${focusedChat ? live + products : products}px`, '--live-edge': `${focusedChat ? live : products + live}px`,
    '--video-height': `${video}px`, '--analytics-height': `${analytics}px`, '--feed-height': `${feed}px`,
  } as React.CSSProperties;
  return <LayoutContext.Provider value={{ values, ranges, change, reset, editing, mode, arrangement, applyDisabled, beginEdit, applyEdit, cancelEdit, chooseMode }}>
    {header}
    <div className={`columns resizable-columns${editing ? ' layout-editing' : ''}${focusedChat ? ' chat-focus' : ''}`} ref={ref} style={style}>
      {children}
      <ResizeHandle kind="products" label={focusedChat ? 'Resize products and chat columns' : 'Resize products and live columns'} />
      <ResizeHandle kind="live" label={focusedChat ? 'Resize live and products columns' : 'Resize live and analytics columns'} />
    </div>
  </LayoutContext.Provider>;
}

export function ResizeHandle({ kind, label }: { kind: Kind; label: string }) {
  const { values, ranges, change, reset } = useConsoleLayout();
  const vertical = kind === 'products' || kind === 'live';
  const direction = kind === 'feed' ? -1 : 1;
  const drag = useRef<{ id: number; origin: number; value: number } | null>(null);
  const [active, setActive] = useState(false);
  const finish = () => { drag.current = null; setActive(false); };
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
