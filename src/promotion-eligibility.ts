import type {AddedItem} from './PreliveProductList';
import type {PromotionKind} from './PromotionWizardSteps';

export const hasPromotion=(product:AddedItem,kind?:PromotionKind)=>Boolean(kind==='Flash Sale'?product.flashSales?.length:kind==='Price Cut'?product.priceCuts?.length:kind==='Group Deal'?product.groupDeals?.length:false);
export const promotionUnavailable=(kind:PromotionKind)=>`Already has a ${kind}. Edit or delete the existing promotion first.`;
// A type may coexist with the other types, but only one record of that type is saved.
// Matching IDs update the existing record; a different ID cannot append a duplicate.
export function onePromotion<T extends {id:string}>(current:T[]=[],incoming:T[]=[]):T[]{
 const existing=current[0];
 return existing?[incoming.find(record=>record.id===existing.id)||existing]:incoming.slice(0,1);
}
