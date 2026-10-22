import React, { useRef, useState } from 'react';
import { ModuleBoard, columnMin, minHeight, moduleNames, resolveBoard } from './module-layout';

function TrackHandle({ vertical, value, min, max, label, style, change }: {
  vertical: boolean; value: number; min: number; max: number; label: string; style: React.CSSProperties; change: (value: number) => void;
}) {
  const drag = useRef<{ pointer: number; origin: number; value: number } | null>(null);
  const [active, setActive] = useState(false);
  const finish = () => { drag.current = null; setActive(false); };
  const update = (next: number) => change(Math.max(min, Math.min(max, next)));
  return <div className={`resize-handle dock-resize ${vertical ? 'vertical' : 'horizontal'}${active ? ' is-dragging' : ''}`}
    role="separator" tabIndex={0} aria-label={label} aria-orientation={vertical ? 'vertical' : 'horizontal'}
    aria-valuenow={Math.round(value)} aria-valuemin={Math.round(min)} aria-valuemax={Math.round(max)} style={style}
    title="Drag to resize · Arrow keys to adjust · Double-click to balance"
    onPointerDown={e => { if (e.button !== 0) return; e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { pointer: e.pointerId, origin: vertical ? e.clientX : e.clientY, value }; setActive(true); }}
    onPointerMove={e => { const start = drag.current; if (start?.pointer === e.pointerId) update(start.value + (vertical ? e.clientX : e.clientY) - start.origin); }}
    onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); finish(); }}
    onPointerCancel={finish} onLostPointerCapture={finish} onDoubleClick={() => update((min + max) / 2)}
    onKeyDown={e => {
      const positive = vertical ? 'ArrowRight' : 'ArrowDown', negative = vertical ? 'ArrowLeft' : 'ArrowUp';
      if (![positive, negative, 'Home', 'End', 'Enter'].includes(e.key)) return;
      e.preventDefault(); update(e.key === 'Home' ? min : e.key === 'End' ? max : e.key === 'Enter' ? (min + max) / 2 : value + (e.key === positive ? 1 : -1) * (e.shiftKey ? 40 : 10));
    }}/>;
}

export function BoardResizeHandles({ board, box, resize }: { board: ModuleBoard; box: { width: number; height: number }; resize: (axis: 'column' | 'row', column: number, row: number, value: number) => void }) {
  const { widths, rows } = resolveBoard(board, box);
  return <>
    {board.columns.slice(0, -1).map((col, c) => <TrackHandle key={`col-${c}`} vertical value={widths[c]} min={columnMin(col)} max={widths[c] + widths[c + 1] - columnMin(board.columns[c + 1])}
      label={`Resize column ${c + 1} and column ${c + 2}`} style={{ left: widths.slice(0, c + 1).reduce((a, b) => a + b, 0) }} change={value => resize('column', c, 0, value)}/>)}
    {board.columns.flatMap((col, c) => col.modules.slice(0, -1).map((id, r) => <TrackHandle key={`${id}-${col.modules[r + 1]}`} vertical={false}
      value={rows[c][r]} min={minHeight[id]} max={rows[c][r] + rows[c][r + 1] - minHeight[col.modules[r + 1]]}
      label={`Resize ${moduleNames[id]} and ${moduleNames[col.modules[r + 1]]}`}
      style={{ left: widths.slice(0, c).reduce((a, b) => a + b, 0), width: widths[c], right: 'auto', top: rows[c].slice(0, r + 1).reduce((a, b) => a + b, 0) - 4, bottom: 'auto' }} change={value => resize('row', c, r, value)}/>))}
  </>;
}
