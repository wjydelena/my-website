import {cloneBoard, validBoard} from './module-layout';
import type {ModuleBoard, ModuleId} from './module-layout';
export type RemovedPosition = {board:ModuleBoard;column:number;row:number};
export function restoreRemovedPanel(board:ModuleBoard,id:ModuleId,savedPosition?:RemovedPosition):ModuleBoard {
  if(!board.hidden?.includes(id))return board;
    const next = cloneBoard(board);
    const original = savedPosition?.board.columns[savedPosition.column];
    const peerColumn = id === 'products' ? -1 : next.columns.findIndex(col =>
      !col.modules.includes('products') && col.modules.length < 3 && original?.modules.some(peer=>col.modules.includes(peer)));
    const addToColumn = (column:number) => {
      const col = next.columns[column];
      const order = original?.modules || [];
      const following = col.modules.findIndex(peer=>order.indexOf(peer) > (savedPosition?.row ?? -1));
      const row = following < 0 ? col.modules.length : following;
      col.modules.splice(row,0,id);
      col.heights.splice(row,0,original?.heights[savedPosition!.row] || 270);
    };
    if(peerColumn >= 0) addToColumn(peerColumn);
    else {
      // Products always owns a column. If four columns are occupied, consolidate
      // two compatible non-product columns before adding its original column.
      if(id === 'products' && next.columns.length >= 4) {
        const first = next.columns.findIndex(c=>!c.modules.includes('products') && c.modules.length < 3);
        if(first<0)return board;
        const second = next.columns.findIndex((c,i)=>i!==first && !c.modules.includes('products') && c.modules.length+next.columns[first].modules.length<=3);
        if(second<0)return board;
        next.columns[first].modules.push(...next.columns[second].modules);
        next.columns[first].heights.push(...next.columns[second].heights);
        next.columns[first].width += next.columns[second].width;
        next.columns.splice(second,1);
      }
      if(next.columns.length < 4) {
        const width = original?.width || next.columns[0].width;
        next.columns.splice(Math.min(savedPosition?.column ?? next.columns.length,next.columns.length),0,{modules:[id],width,heights:[original?.heights[savedPosition!.row] || 270]});
      } else {
        const available = next.columns.findIndex(c=>!c.modules.includes('products') && c.modules.length<3);
        if(available<0)return board;
        addToColumn(available);
      }
    }
    next.hidden = next.hidden?.filter(panel=>panel!==id);
    if(id==='products')next.productsHidden=false;
    if(!validBoard(next))return board;
  return next;
}
