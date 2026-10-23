export const MODULES = ['products', 'video', 'chat', 'analytics', 'activity'] as const;
export type ModuleId = typeof MODULES[number];
export const moduleNames: Record<ModuleId, string> = { products: 'Products', video: 'Video', chat: 'Chat', analytics: 'Analytics', activity: 'Activity' };
export const minHeight: Record<ModuleId, number> = { products: 270, video: 200, chat: 200, analytics: 194, activity: 270 };
export type ModuleColumn = { modules: ModuleId[]; width: number; heights: number[] };
export type ModuleBoard = { columns: ModuleColumn[]; productsHidden?: boolean };
export type DropTarget = { type: 'column'; index: number } | { type: 'stack'; column: number; index: number };
export type Rect = { left: number; top: number; width: number; height: number };
export const columnMin = (column: ModuleColumn) => column.modules.includes('products') ? 400 : 324;
export const boardMinWidth = (board: ModuleBoard) => board.columns.reduce((sum, col) => sum + columnMin(col), 0);
export const cloneBoard = (board: ModuleBoard): ModuleBoard => ({ ...board, columns: board.columns.map(col => ({ ...col, modules: [...col.modules], heights: [...col.heights] })) });
export const sameStructure = (a: ModuleBoard, b: ModuleBoard) => JSON.stringify(a.columns.map(c => c.modules)) === JSON.stringify(b.columns.map(c => c.modules));

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
  const rows = board.columns.map(c => allocate(box.height, c.heights, c.modules.map(m => minHeight[m])));
  const rects = {} as Record<ModuleId, Rect>;
  let left = 0;
  board.columns.forEach((col, c) => {
    let top = 0;
    col.modules.forEach((id, r) => { rects[id] = { left, top, width: widths[c], height: rows[c][r] }; top += rows[c][r]; });
    left += widths[c];
  });
  return { widths, rows, rects, width: left, height: box.height };
}

export function validBoard(board: ModuleBoard) {
  const all = board.columns.flatMap(c => c.modules);
  const expected = board.productsHidden ? MODULES.filter(id => id !== 'products') : MODULES;
  return board.columns.length <= 4 && board.columns.length > 0 && all.length === expected.length &&
    expected.every(id => all.filter(m => m === id).length === 1) &&
    board.columns.every(c => c.modules.length > 0 && c.modules.length <= 3 && (!c.modules.includes('products') || c.modules.length === 1));
}

export function moveModule(board: ModuleBoard, id: ModuleId, target: DropTarget): { board: ModuleBoard; changed: boolean; reason?: string } {
  const reject = (reason: string) => ({ board, changed: false, reason });
  const sourceIndex = board.columns.findIndex(c => c.modules.includes(id));
  if (sourceIndex < 0) return reject('Module not found');
  const next = cloneBoard(board), source = next.columns[sourceIndex], row = source.modules.indexOf(id);
  const sourceHeight = source.heights[row];
  if (target.type === 'stack') {
    const destination = next.columns[target.column];
    if (!destination) return reject('Choose a column');
    if (id === 'products' || destination.modules.includes('products')) return reject('Products must stay in its own column');
    if (destination !== source && destination.modules.length >= 3) return reject('Maximum 3 modules per column');
    let insert = target.index;
    if (destination === source && row < insert) insert--;
    source.modules.splice(row, 1); source.heights.splice(row, 1);
    const average = destination.heights.reduce((a, b) => a + b, 0) / Math.max(1, destination.modules.length);
    destination.modules.splice(insert, 0, id); destination.heights.splice(insert, 0, destination === source ? sourceHeight : average || 1);
  } else {
    const wholeColumn = source.modules.length === 1;
    if (!wholeColumn && next.columns.length >= 4) return reject('Maximum 4 columns');
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
    ...board.columns.flatMap((c, column) => Array.from({ length: c.modules.length + 1 }, (_, index) => ({ type: 'stack' as const, column, index }))),
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
