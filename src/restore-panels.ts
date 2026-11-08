import {MAX_COLUMNS, cloneBoard, columnMin, validBoard} from './module-layout';
import type {ModuleBoard, ModuleId} from './module-layout';

/** Add a removed panel as a full-height column at the right-hand end. */
export function restoreRemovedPanel(board:ModuleBoard,id:ModuleId):ModuleBoard {
  if(!board.hidden?.includes(id) || board.columns.length>=MAX_COLUMNS)return board;
  const next=cloneBoard(board);
  const column={modules:[id],width:0,heights:[1]};
  column.width=columnMin(column);
  next.columns.push(column);
  next.hidden=next.hidden?.filter(panel=>panel!==id);
  if(id==='products')next.productsHidden=false;
  return validBoard(next)?next:board;
}
