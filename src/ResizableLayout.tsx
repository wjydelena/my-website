import React, { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import './resize.css';

type Kind = 'products' | 'live' | 'video' | 'analytics' | 'feed';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const LayoutContext = createContext<any>(null);

export function ResizableColumns({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 1190, height: 818 });
  const [ratios, setRatios] = useState([.38, .31, .31]);
  const [heights, setHeights] = useState({ video: 340, analytics: 194, feed: 272 });
  useLayoutEffect(() => {
    const element = ref.current!;
    const measure = () => setBox({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // On viewport changes, keep all three columns within their readable minimums.
  const products = clamp(ratios[0] * box.width, 400, box.width - 600);
  const live = clamp(ratios[1] * box.width, 300, box.width - products - 300);
  const widths = [products, live, box.width - products - live];
  const video = clamp(heights.video, 200, box.height - 200);
  const analytics = clamp(heights.analytics, 194, box.height - 310);
  const feed = clamp(heights.feed, 160, box.height - analytics - 150);
  const values = { products, live, video, analytics, feed };
  const ranges = {
    products: [400, products + live - 300],
    live: [300, live + widths[2] - 300],
    video: [200, box.height - 200],
    analytics: [194, box.height - feed - 150],
    feed: [160, box.height - analytics - 150],
  };
  const change = (kind: Kind, input: number) => {
    const [min, max] = ranges[kind];
    const next = clamp(input, min, max);
    if (kind === 'products') setRatios([next / box.width, (products + live - next) / box.width, widths[2] / box.width]);
    else if (kind === 'live') setRatios([products / box.width, next / box.width, (live + widths[2] - next) / box.width]);
    else setHeights(previous => ({ ...previous, [kind]: next }));
  };
  const reset = (kind: Kind) => {
    if (kind === 'products' || kind === 'live') setRatios([.38, .31, .31]);
    else change(kind, { video: 340, analytics: 194, feed: 272 }[kind]);
  };
  const style = {
    gridTemplateColumns: widths.map(width => `${width}px`).join(' '),
    '--products-edge': `${products}px`, '--live-edge': `${products + live}px`,
    '--video-height': `${video}px`, '--analytics-height': `${analytics}px`, '--feed-height': `${feed}px`,
  } as React.CSSProperties;
  return <LayoutContext.Provider value={{ values, ranges, change, reset }}>
    <div className="columns resizable-columns" ref={ref} style={style}>
      {children}
      <ResizeHandle kind="products" label="Resize products and live columns" />
      <ResizeHandle kind="live" label="Resize live and analytics columns" />
    </div>
  </LayoutContext.Provider>;
}

export function ResizeHandle({ kind, label }: { kind: Kind; label: string }) {
  const { values, ranges, change, reset } = useContext(LayoutContext);
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
