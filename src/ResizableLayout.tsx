import React, { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import './resize.css';
import { ModuleBoard, ModuleId, DropTarget, MODULES, MAX_COLUMNS, MIN_PANEL_WIDTH, boardMinWidth, cloneBoard, moveModule, resolveBoard, validBoard, visualModuleIndices, moduleMinHeight, panelRemovalIds, removeBoardPanel } from './module-layout';
import { ModuleDragProvider, ModuleHoverOverlay } from './ModuleDrag';
import { BoardResizeHandles } from './BoardResizeHandles';
import { restoreRemovedPanel } from './restore-panels';

type Kind = 'products' | 'live' | 'video' | 'tools' | 'analytics' | 'feed';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const MIN_PRODUCTS_WIDTH = 400;
const MIN_LIVE_WIDTH = MIN_PANEL_WIDTH;
const MIN_ANALYTICS_WIDTH = MIN_PANEL_WIDTH;
export type LayoutMode = 'Standard' | 'Host focus';
type Arrangement = 'balanced' | 'chat-focus' | 'host-focus';
type Heights = { video: number; tools: number; analytics: number; feed: number };
type GeometrySource = { ratios: number[]; heights: Heights; arrangement: Arrangement; board: ModuleBoard | null; toolsExpanded: boolean };
function presetSource(mode: LayoutMode, editing: boolean): GeometrySource {
  return {ratios:[.4,.3,.3],heights:mode==='Standard'&&editing?{video:262,tools:133,analytics:201,feed:324}:{video:268,tools:133,analytics:201,feed:328},arrangement:mode==='Host focus'?'host-focus':'balanced',board:null,toolsExpanded:true};
}
function resolveValues(source: GeometrySource, box: { width: number; height: number }) {
  const { ratios, heights, arrangement } = source;
  const focusedChat = arrangement === 'chat-focus';
  const width = Math.max(box.width, MIN_PRODUCTS_WIDTH + MIN_LIVE_WIDTH + MIN_ANALYTICS_WIDTH);
  const products = clamp(ratios[0] * width, MIN_PRODUCTS_WIDTH, width - MIN_LIVE_WIDTH - MIN_ANALYTICS_WIDTH);
  const live = clamp(ratios[1] * width, MIN_LIVE_WIDTH, width - products - MIN_ANALYTICS_WIDTH);
  const tools = clamp(heights.tools, 54, box.height - 194 - 270);
  const video = arrangement === 'host-focus' ? box.height-tools : clamp(heights.video, 200, focusedChat ? box.height - 194 - 160 - 110 : box.height - 200);
  const analytics = clamp(heights.analytics, 194, focusedChat ? box.height - video - 160 - 110 : box.height - (arrangement==='host-focus'?0:tools) - 310);
  const feed = clamp(heights.feed, 160, focusedChat ? box.height - video - analytics - 110 : box.height - (arrangement==='host-focus'?0:tools) - analytics - 150);
  return { products, live, video, tools, analytics, feed };
}
function sourceBoard(source: GeometrySource, box: { width: number; height: number }): ModuleBoard {
  if (source.board) return source.board;
  if (source.arrangement === 'host-focus') {
    const v = resolveValues(source, box);
    return { chatActivityMerged: true, columns: [
      { modules: ['products'], width: v.products, heights: [box.height] },
      { modules: ['tools', 'video'], width: v.live, heights: [v.tools, box.height-v.tools] },
      { modules: ['analytics', 'chat', 'activity'], width: Math.max(MIN_PANEL_WIDTH,box.width-v.products-v.live), heights: [v.analytics, box.height - v.analytics, 0] },
    ] };
  }
  const v = resolveValues(source, box), third = Math.max(MIN_PANEL_WIDTH, box.width - v.products - v.live);
  return { columns: source.arrangement === 'chat-focus' ? [
    { modules: ['products'], width: v.products, heights: [box.height] },
    { modules: ['tools', 'chat'], width: third, heights: [v.tools, box.height-v.tools] },
    { modules: ['video', 'analytics', 'activity'], width: v.live, heights: [v.video, v.analytics, box.height - v.video - v.analytics] },
  ] : [
    { modules: ['products'], width: v.products, heights: [box.height] },
    { modules: ['video', 'chat'], width: v.live, heights: [v.video, box.height - v.video] },
    { modules: ['tools', 'analytics', 'activity'], width: third, heights: [v.tools, v.analytics, box.height - v.tools - v.analytics] },
  ] };
}
type LayoutState = {
  values: Record<Kind, number>;
  ranges: Record<Kind, number[]>;
  change: (kind: Kind, value: number, fitFeed?: boolean) => void;
  toolsExpanded: boolean;
  toggleTools: () => void;
  reset: (kind: Kind) => void;
  editing: boolean;
  mode: LayoutMode;
  arrangement: Arrangement;
  docked: boolean;
  moduleStyle: (id: ModuleId) => React.CSSProperties | undefined;
  applyDisabled: boolean;
  presetAdjusted: boolean;
  resetPreset: () => void;
  beginEdit: () => void;
  applyEdit: () => void;
  cancelEdit: () => void;
  chooseMode: (mode: LayoutMode) => void;
  removePanel: (id: ModuleId) => void;
  canRemovePanel: boolean;
  canRemovePanelFor: (id: ModuleId) => boolean;
  mergedChatActivity: boolean;
  removedPanels: ModuleId[];
  restoreCapacity: number;
  restorePanel: (id: ModuleId) => void;
  restorePanels: (ids: ModuleId[]) => void;
  showRestoreHint: boolean;
  dismissRestoreHint: () => void;
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
  const [heights, setHeights] = useState({ video: 268, tools:133, analytics: 201, feed: 328 });
  const [toolsExpanded,setToolsExpanded]=useState(true);
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<LayoutMode>('Standard');
  const [arrangement, setArrangement] = useState<Arrangement>('balanced');
  const [board, setBoard] = useState<ModuleBoard | null>(null);
  const hintSeen = useRef(false);
  const [showRestoreHint, setShowRestoreHint] = useState(false);
  const dismissRestoreHint = useCallback(() => setShowRestoreHint(false), []);
  const focusedChat = arrangement === 'chat-focus';
  const focusedHost = arrangement === 'host-focus';
  const absoluteLayout = !!board || focusedHost;
  const editBaseline = useRef<GeometrySource | null>(null);
  const [presetEdited, setPresetEdited] = useState(false);
  const currentGeometry = (): GeometrySource => ({ ratios: [...ratios], heights: { ...heights }, arrangement, board, toolsExpanded });
  const saved = useRef<(GeometrySource & { mode: LayoutMode }) | null>(null);
  const beginEdit = () => {
    saved.current = { ...currentGeometry(), mode };
    editBaseline.current = !presetEdited&&mode==='Standard'?{...currentGeometry(),heights:{video:262,tools:133,analytics:201,feed:324}}:currentGeometry();
    if(mode === 'Standard'&&!presetEdited) setHeights({video:262,tools:133,analytics:201,feed:324});
    setEditing(true);
  };
  const applyEdit = () => {
    if (applyDisabled) return;
    dismissRestoreHint();
    saved.current = null;
    editBaseline.current = null;
    setEditing(false);
  };
  const cancelEdit = () => {
    dismissRestoreHint();
    setRatios([.4,.3,.3]);
    setHeights({video:268,tools:133,analytics:201,feed:328});
    setToolsExpanded(true);
    setMode('Standard');
    setArrangement('balanced');
    setBoard(null);
    saved.current = null;
    editBaseline.current = null;
    setPresetEdited(false);
    setEditing(false);
  };
  const chooseMode = (next: LayoutMode) => {
    dismissRestoreHint();
    editBaseline.current = null;
    setPresetEdited(false);
    setBoard(null);
    setMode(next);
    const preset=presetSource(next,editing);
    setArrangement(preset.arrangement);setRatios(preset.ratios);setHeights(preset.heights);
    setToolsExpanded(true);
  };
  const resetPreset = () => chooseMode(mode);
  useLayoutEffect(() => {
    const element = ref.current!;
    const measure = () => setBox({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // Resolve the draft and its baseline at the same viewport, so viewport resizing
  // alone never counts as an edit. Keep all existing size constraints.
  const currentSource = { ratios, heights, arrangement, board, toolsExpanded };
  const visibleBoard = sourceBoard(currentSource, box);
  const boardGeometry = resolveBoard(visibleBoard, box);
  const values = resolveValues(currentSource, box);
  if (absoluteLayout) values.feed = clamp(heights.feed, 160, (boardGeometry.rects.activity?.height ?? box.height) - 110);
  const { products, live, video, tools, analytics, feed } = values;
  const widths = [products, live, Math.max(MIN_PANEL_WIDTH, box.width - products - live)];
  const baselineValues = editBaseline.current ? resolveValues(editBaseline.current, box) : values;
  const baselineBoard = sourceBoard(editBaseline.current || currentSource, box);
  const baselineGeometry = resolveBoard(baselineBoard, box);
  const placementChanged = MODULES.some(id => {
    const current = boardGeometry.rects[id], baseline = baselineGeometry.rects[id];
    if (!current || !baseline) return current !== baseline;
    return (['left', 'top', 'width', 'height'] as const).some(key => Math.abs(current[key] - baseline[key]) > .01);
  });
  const baselineFeed = (editBaseline.current?.board || editBaseline.current?.arrangement === 'host-focus') ? clamp(editBaseline.current.heights.feed, 160, (baselineGeometry.rects.activity?.height ?? box.height) - 110) : baselineValues.feed;
  const editChanged = placementChanged || Math.abs(values.feed - baselineFeed) > .01;
  const applyDisabled = editing && presetEdited && !editChanged;
  const initialPreset=presetSource(mode,editing), initialBoard=sourceBoard(initialPreset,box), initialGeometry=resolveBoard(initialBoard,box);
  const initialValues=resolveValues(initialPreset,box);
  const initialFeed=mode==='Host focus'?clamp(initialPreset.heights.feed,160,(initialGeometry.rects.activity?.height??box.height)-110):initialValues.feed;
  const presetAdjusted=toolsExpanded!==initialPreset.toolsExpanded||!!visibleBoard.chatActivityMerged!==!!initialBoard.chatActivityMerged||Math.abs(values.feed-initialFeed)>.01||MODULES.some(id=>{
    const current=boardGeometry.rects[id], initial=initialGeometry.rects[id];
    if(!current||!initial)return current!==initial;
    return (['left','top','width','height'] as const).some(key=>Math.abs(current[key]-initial[key])>.01);
  });
  const markAdjusted = () => {
    if (!editBaseline.current) editBaseline.current = currentGeometry();
    setPresetEdited(true);
  };
  const ranges = {
    products: [MIN_PRODUCTS_WIDTH, focusedChat ? products + widths[2] - MIN_ANALYTICS_WIDTH : products + live - MIN_LIVE_WIDTH],
    live: [MIN_LIVE_WIDTH, live + widths[2] - MIN_ANALYTICS_WIDTH],
    video: [200, focusedChat ? box.height - analytics - feed - 110 : box.height - 200],
    tools: [54, box.height - analytics - feed - 150],
    analytics: [194, focusedChat ? box.height - video - feed - 110 : box.height - tools - feed - 150],
    feed: [160, absoluteLayout ? (boardGeometry.rects.activity?.height ?? box.height) - 110 : focusedChat ? box.height - video - analytics - 110 : box.height - tools - analytics - 150],
  };
  const change = (kind: Kind, input: number, fitFeed = false) => {
    // Automatic tool folding can release Activity space; manual handles retain their bounds.
    const [min, max] = kind === 'tools' && fitFeed
      ? [54, box.height - analytics - 310]
      : ranges[kind];
    const next = clamp(input, min, max);
    if (Math.abs(next - values[kind]) <= 0.01) return;
    markAdjusted();
    if (kind === 'products') setRatios(focusedChat
      ? [next / box.width, live / box.width, (products + widths[2] - next) / box.width]
      : [next / box.width, (products + live - next) / box.width, widths[2] / box.width]);
    else if (kind === 'live') setRatios([products / box.width, next / box.width, (live + widths[2] - next) / box.width]);
    else setHeights(previous => ({ ...previous, [kind]: next }));
  };
  const reset = (kind: Kind) => {
    if (kind === 'products' || kind === 'live') { markAdjusted(); setRatios(focusedChat ? [.38, .31, .31] : [.4, .3, .3]); }
    else change(kind, (focusedChat ? { video: 240, tools:133, analytics: 277, feed: 160 } : { video: 268, tools:133, analytics: 201, feed: 328 })[kind]);
  };
  const toggleTools = () => {
    if(editing)return;
    const desired=toolsExpanded?54:133;
    if(absoluteLayout){
      const draft=cloneBoard(visibleBoard), geometry=resolveBoard(visibleBoard,box);
      const c=draft.columns.findIndex(col=>col.modules.includes('tools'));
      if(c<0)return;
      const col=draft.columns[c], r=col.modules.indexOf('tools');
      col.heights=[...geometry.rows[c]];
      const siblings=visualModuleIndices(visibleBoard,col).filter(i=>i!==r);
      const current=col.heights[r];
      if(siblings.length){
        const available=siblings.reduce((sum,i)=>sum+Math.max(0,col.heights[i]-moduleMinHeight(visibleBoard,col.modules[i])),0);
        const next=clamp(desired,54,current+available);
        let delta=next-current;
        for(const i of siblings){
          if(delta<=0){col.heights[i]-=delta;delta=0;break;}
          const take=Math.min(delta,col.heights[i]-moduleMinHeight(visibleBoard,col.modules[i]));
          col.heights[i]-=take;delta-=take;
        }
        col.heights[r]=next;
      }
      markAdjusted();setBoard(draft);
    } else change('tools',desired,true);
    setToolsExpanded(!toolsExpanded);
    setHeights(previous=>({...previous,tools:desired}));
  };
  const move = (id: ModuleId, target: DropTarget) => {
    if (!editing) return;
    const result = moveModule(visibleBoard, id, target);
    if (!result.changed) return;
    markAdjusted(); setBoard(result.board);
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
      const nextRow=visualModuleIndices(visibleBoard,visibleBoard.columns[column]).find(i=>i>row);
      if(nextRow===undefined)return;
      draft.columns[column].heights[nextRow] += current - next;
    }
    markAdjusted(); setBoard(draft);
  };
  const canRemovePanel = visibleBoard.columns.flatMap(c=>c.modules).length > 1;
  const canRemovePanelFor = (id:ModuleId) => visibleBoard.columns.flatMap(c=>c.modules).length > panelRemovalIds(visibleBoard,id).length;
  const removedPanels = MODULES.filter(id => visibleBoard.hidden?.includes(id));
  const removePanel = (id: ModuleId) => {
    if(!editing || !canRemovePanelFor(id))return;
    const next = removeBoardPanel(visibleBoard,id);
    if(next===visibleBoard)return;
    markAdjusted();setBoard(next);
    let seen = hintSeen.current;
    try { seen = seen || localStorage.getItem('live-console.add-panel-hint.v1') === 'seen'; } catch {}
    if(!seen) {
      hintSeen.current = true;
      setShowRestoreHint(true);
      try { localStorage.setItem('live-console.add-panel-hint.v1','seen'); } catch {}
    }
  };
  const restorePanels = (ids: ModuleId[]) => {
    const selected=MODULES.filter(id=>ids.includes(id) && removedPanels.includes(id));
    if(!editing || !selected.length || selected.length>MAX_COLUMNS-visibleBoard.columns.length)return;
    const widths=resolveBoard(visibleBoard,box).widths;
    let next=cloneBoard(visibleBoard);
    // Normalize proportional preset tracks before mixing in pixel-sized new columns.
    next.columns.forEach((column,index)=>{column.width=widths[index];});
    for(const id of selected)next=restoreRemovedPanel(next,id);
    if(next.hidden?.length===visibleBoard.hidden?.length)return;
    markAdjusted();setBoard(next);dismissRestoreHint();
  };
  const restorePanel = (id: ModuleId) => restorePanels([id]);
  const moduleStyle = (id: ModuleId): React.CSSProperties | undefined => !boardGeometry.rects[id] || (visibleBoard.chatActivityMerged && id==='activity') ? { display: 'none' } : absoluteLayout ? { ...boardGeometry.rects[id], position: 'absolute' } : undefined;
  const style = {
    gridTemplateColumns: (focusedChat ? [products, widths[2], live] : widths).map(width => `${width}px`).join(' '),
    gridTemplateRows: focusedChat ? `${video}px ${analytics}px 54px minmax(0, 1fr) ${feed}px` : undefined,
    '--products-edge': `${products}px`, '--live-edge': `${focusedChat ? products + widths[2] : products + live}px`,
    '--video-height': `${video}px`, '--tools-height': `${tools}px`, '--analytics-height': `${analytics}px`, '--feed-height': `${feed}px`,
    '--panel-min-width': `${MIN_PANEL_WIDTH}px`,
    minWidth: boardMinWidth(visibleBoard),
  } as React.CSSProperties;
  return <LayoutContext.Provider value={{ values, ranges, change, toolsExpanded, toggleTools, reset, editing, mode, arrangement, docked: absoluteLayout, moduleStyle, applyDisabled, presetAdjusted, resetPreset, beginEdit, applyEdit, cancelEdit, chooseMode, removePanel, canRemovePanel, canRemovePanelFor, mergedChatActivity:!!visibleBoard.chatActivityMerged, removedPanels, restoreCapacity:MAX_COLUMNS-visibleBoard.columns.length, restorePanel, restorePanels, showRestoreHint, dismissRestoreHint }}>
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
