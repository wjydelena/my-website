import type {AddedItem} from './PreliveProductList';
import type {PromotionKind} from './PromotionWizardSteps';
import type {ProductFlashSale} from './flash-sale-types';

// Only one-per-type promotions block creation/selection. Flash Sale stays available.
export const hasPromotion=(product:AddedItem,kind?:PromotionKind)=>Boolean(kind==='Price Cut'?product.priceCuts?.length:kind==='Group Deal'?product.groupDeals?.length:false);
const isManual=(sale:ProductFlashSale)=>!sale.start||sale.start==='Manually start during LIVE';
export const hasManualFlashSale=(product:AddedItem,editingId?:string)=>Boolean(product.flashSales?.some(sale=>sale.id!==editingId&&isManual(sale)));
// Keep every scheduled record and update matching IDs without appending duplicates.
// Reject a conflicting manual change without deleting the original record.
export function mergeFlashSales(current:ProductFlashSale[]=[],incoming:ProductFlashSale[]=[]):ProductFlashSale[]{
 const next=[...current];
 for(const sale of incoming){
  if(isManual(sale)&&next.some(existing=>existing.id!==sale.id&&isManual(existing)))continue;
  const index=next.findIndex(existing=>existing.id===sale.id);
  if(index<0)next.push(sale);else next[index]=sale;
 }
 return next;
}
export const promotionUnavailable=(kind:PromotionKind)=>kind==='Group Deal'?'A Group Deal has already been created for this product.':`Already has a ${kind}. Edit or delete the existing promotion first.`;
// Group Deal and Price Cut may coexist, but only one record of each type is saved.
// Matching IDs update the existing record; a different ID cannot append a duplicate.
export function onePromotion<T extends {id:string}>(current:T[]=[],incoming:T[]=[]):T[]{
 const existing=current[0];
 return existing?[incoming.find(record=>record.id===existing.id)||existing]:incoming.slice(0,1);
}
