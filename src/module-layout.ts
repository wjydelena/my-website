export const MODULES = ['products', 'video', 'chat', 'analytics', 'activity', 'tools'] as const;
export type ModuleId = typeof MODULES[number];
export const moduleNames: Record<ModuleId, string> = { products: 'Products', video: 'Video', chat: 'Chat', analytics: 'Analytics', activity: 'Activity', tools: 'LIVE tools' };
export const minHeight: Record<ModuleId, number> = { products: 270, video: 200, chat: 200, analytics: 194, activity: 270, tools: 54 };
export type ModuleColumn = { modules: ModuleId[]; width: number; heights: number[] };
export type ModuleBoard = { columns: ModuleColumn[]; productsHidden?: boolean; hidden?: ModuleId[]; chatActivityMerged?: boolean };
export type DropTarget = { type: 'column'; index: number } | { type: 'stack'; column: number; index: number };
export type Rect = { left: number; top: number; width: number; height: number };
export const MIN_PANEL_WIDTH = 318;
export const MAX_COLUMNS = 5;
export const MAX_MODULES_PER_COLUMN = 3;
export const COLUMN_CAPACITY_MESSAGE = 'Maximum 3 modules per column';
export const columnMin = (column: ModuleColumn) => column.modules.includes('products') ? 400 : MIN_PANEL_WIDTH;
export const boardMinWidth = (board: ModuleBoard) => board.columns.reduce((sum, col) => sum + columnMin(col), 0);
export const cloneBoard = (board: ModuleBoard): ModuleBoard => ({ ...board, columns: board.columns.map(col => ({ ...col, modules: [...col.modules], heights: [...col.heights] })) });
export const sameStructure = (a: ModuleBoard, b: ModuleBoard) => JSON.stringify(a.columns.map(c => c.modules)) === JSON.stringify(b.columns.map(c => c.modules));
export const visualModuleIndices = (board: ModuleBoard, column: ModuleColumn) => column.modules.map((_,i)=>i).filter(i=>!(board.chatActivityMerged && column.modules[i]==='activity'));
export const moduleMinHeight = (board: ModuleBoard, id: ModuleId) => board.chatActivityMerged && id==='chat' ? 270 : minHeight[id];
export const panelRemovalIds = (board: ModuleBoard, id: ModuleId): ModuleId[] => board.chatActivityMerged && (id==='chat'||id==='activity') ? ['chat','activity'] : [id];
/** Capacity counts underlying modules, even when Chat and Activity share one surface. */
export function stackBlockedReason(board:ModuleBoard,id:ModuleId,column:number):string|undefined {
  const destination=board.columns[column];
  if(!destination)return 'Choose a column';
  if(id==='products')return 'Products can’t be stacked with other modules';
  if(destination.modules.includes('products'))return 'Modules can’t share a column with Products.';
  const moving=panelRemovalIds(board,id);
  const count=destination.modules.filter(m=>!moving.includes(m)).length+moving.length;
  if(count>MAX_MODULES_PER_COLUMN)return COLUMN_CAPACITY_MESSAGE;
}
export function removeBoardPanel(board:ModuleBoard,id:ModuleId):ModuleBoard {
  const visible=board.columns.flatMap(c=>c.modules), ids=panelRemovalIds(board,id);
  if(!ids.every(id=>visible.includes(id)) || visible.length<=ids.length)return board;
  const next=cloneBoard(board);
  next.hidden=[...new Set([...(next.hidden||[]),...ids])];
  next.columns.forEach(c=>{const keep=c.modules.map((_,i)=>i).filter(i=>!ids.includes(c.modules[i]));c.modules=keep.map(i=>c.modules[i]);c.heights=keep.map(i=>c.heights[i]);});
  next.columns=next.columns.filter(c=>c.modules.length);
  if(ids.includes('chat')||ids.includes('activity'))next.chatActivityMerged=false;
  return validBoard(next)?next:board;
}

/** Proportional tracks, freezing tracks at their minimum without overflowing. */
export function allocate(total: number, weights: number[], minimums: number[]) {
  total = Math.max(total, minimums.reduce((a, b) => a + b, 0));
  const result = weights.map(() => 0);
  let pending = weights.map((_, i) => i), remaining = total;
  while (pending.length) {
    const sum = pending.reduce((s, i) => s + Math.max(.001, weights[i]), 0);
    const frozen = pending.filter(i => remaining * Math.max(.001, weights[i]) / sum < minimums[i]);
    if (!frozen.length) {
      pending.forEach(i => { result[i] = remaining * Math.max(.001, weights[i]) / sum; });
      break;
    }
    frozen.forEach(i => { result[i] = minimums[i]; remaining -= minimums[i]; });
    pending = pending.filter(i => !frozen.includes(i));
  }
  return result;
}

export function resolveBoard(board: ModuleBoard, box: { width: number; height: number }) {
  const widths = allocate(box.width, board.columns.map(c => c.width), board.columns.map(columnMin));
  const rows = board.columns.map(c => {
    const indices=visualModuleIndices(board,c);
    const sizes=allocate(box.height,indices.map(i=>c.heights[i]+(board.chatActivityMerged&&c.modules[i]==='chat'?(c.heights[i+1]||0):0)),indices.map(i=>moduleMinHeight(board,c.modules[i])));
    const result=c.modules.map(()=>0);indices.forEach((i,j)=>{result[i]=sizes[j];});return result;
  });
  const rects = {} as Record<ModuleId, Rect>;
  let left = 0;
  board.columns.forEach((col, c) => {
    let top = 0;
    col.modules.forEach((id, r) => { if(board.chatActivityMerged&&id==='activity'){rects[id]={...rects.chat};return;} rects[id] = { left, top, width: widths[c], height: rows[c][r] }; top += rows[c][r]; });
    left += widths[c];
  });
  return { widths, rows, rects, width: left, height: box.height };
}

export function validBoard(board: ModuleBoard) {
  const all = board.columns.flatMap(c => c.modules);
  const expected = MODULES.filter(id => !(board.productsHidden && id === 'products') && !board.hidden?.includes(id));
  if(board.chatActivityMerged && !board.columns.some(c=>c.modules.includes('chat')&&c.modules[c.modules.indexOf('chat')+1]==='activity'))return false;
  return board.columns.length <= MAX_COLUMNS && board.columns.length > 0 && all.length === expected.length &&
    expected.every(id => all.filter(m => m === id).length === 1) &&
    board.columns.every(c => c.modules.length > 0 && c.modules.length <= MAX_MODULES_PER_COLUMN && (!c.modules.includes('products') || c.modules.length === 1));
}

export function moveModule(board: ModuleBoard, id: ModuleId, target: DropTarget): { board: ModuleBoard; changed: boolean; reason?: string } {
  if(target.type==='stack'){
    const reason=stackBlockedReason(board,id,target.column);
    if(reason)return {board,changed:false,reason};
  }
  if(board.chatActivityMerged)return moveMergedModule(board,id,target);
  const reject = (reason: string) => ({ board, changed: false, reason });
  const sourceIndex = board.columns.findIndex(c => c.modules.includes(id));
  if (sourceIndex < 0) return reject('Module not found');
  const next = cloneBoard(board), source = next.columns[sourceIndex], row = source.modules.indexOf(id);
  const sourceHeight = source.heights[row];
  if (target.type === 'stack') {
    const destination = next.columns[target.column];
    if (!destination) return reject('Choose a column');
    if (id === 'products' || destination.modules.includes('products')) return reject('Products must stay in its own column');
    if (destination !== source && destination.modules.length >= MAX_MODULES_PER_COLUMN) return reject(COLUMN_CAPACITY_MESSAGE);
    let insert = target.index;
    if (destination === source && row < insert) insert--;
    source.modules.splice(row, 1); source.heights.splice(row, 1);
    const average = destination.heights.reduce((a, b) => a + b, 0) / Math.max(1, destination.modules.length);
    destination.modules.splice(insert, 0, id); destination.heights.splice(insert, 0, destination === source ? sourceHeight : average || 1);
  } else {
    const wholeColumn = source.modules.length === 1;
    if (!wholeColumn && next.columns.length >= MAX_COLUMNS) return reject(`Maximum ${MAX_COLUMNS} columns`);
    let insert = target.index;
    source.modules.splice(row, 1); source.heights.splice(row, 1);
    if (wholeColumn) { next.columns.splice(sourceIndex, 1); if (sourceIndex < insert) insert--; }
    next.columns.splice(insert, 0, { modules: [id], width: source.width, heights: [1] });
  }
  next.columns = next.columns.filter(c => c.modules.length);
  if (!validBoard(next)) return reject('This position is not available');
  if (sameStructure(board, next)) return { board, changed: false };
  return { board: next, changed: true };
}

export function dropTargets(board: ModuleBoard): DropTarget[] {
  return [
    ...Array.from({ length: board.columns.length + 1 }, (_, index) => ({ type: 'column' as const, index })),
    ...board.columns.flatMap((c, column) => Array.from({ length: c.modules.length + 1 }, (_, index) => ({ type: 'stack' as const, column, index })).filter(t=>!(board.chatActivityMerged&&c.modules[t.index]==='activity'))),
  ];
}

export function targetRect(target: DropTarget, board: ModuleBoard, geometry: ReturnType<typeof resolveBoard>): Rect {
  if (target.type === 'column') return { left: geometry.widths.slice(0, target.index).reduce((a, b) => a + b, 0), top: 0, width: 3, height: geometry.height };
  return {
    left: geometry.widths.slice(0, target.column).reduce((a, b) => a + b, 0),
    top: geometry.rows[target.column].slice(0, target.index).reduce((a, b) => a + b, 0),
    width: geometry.widths[target.column], height: 3,
  };
}

export function targetLabel(target: DropTarget) {
  return target.type === 'column' ? `New column · position ${target.index + 1}` : `Column ${target.column + 1} · position ${target.index + 1}`;
}

function moveMergedModule(board:ModuleBoard,id:ModuleId,target:DropTarget):{board:ModuleBoard;changed:boolean;reason?:string} {
  if(target.type==='stack'&&!board.columns[target.column])return {board,changed:false,reason:'Choose a column'};
  if(target.type==='stack'&&board.columns[target.column].modules[target.index]==='activity')return {board,changed:false,reason:'Chat and Activity move together'};
  const compact=cloneBoard(board);compact.chatActivityMerged=false;compact.hidden=[...(compact.hidden||[]),'activity'];
  let translated=target;
  if(target.type==='stack')translated={...target,index:target.index-board.columns[target.column].modules.slice(0,target.index).filter(m=>m==='activity').length};
  compact.columns.forEach(c=>{const i=c.modules.indexOf('activity');if(i>=0){c.heights[i-1]+=c.heights[i]||0;c.modules.splice(i,1);c.heights.splice(i,1);}});
  const moved=moveModule(compact,id==='activity'?'chat':id,translated);
  if(!moved.changed)return {...moved,board};
  const next=moved.board;next.chatActivityMerged=true;next.hidden=next.hidden?.filter(m=>m!=='activity');
  const col=next.columns.find(c=>c.modules.includes('chat'))!;const i=col.modules.indexOf('chat');col.modules.splice(i+1,0,'activity');col.heights.splice(i+1,0,0);
  return validBoard(next)?{board:next,changed:true}:{board,changed:false,reason:'This position is not available'};
}
