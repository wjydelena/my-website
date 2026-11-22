import type {ProductFlashSale} from './flash-sale-types';
import type {ProductPriceCut} from './price-cut-types';
import type {ProductGroupDeal} from './group-deal-types';
let lastCreation=0;
export function nextPromotionCreation(){lastCreation=Math.max(Date.now(),lastCreation+1);return lastCreation}
export function orderedProductPromotions(sales:ProductFlashSale[],cuts:ProductPriceCut[],deals:ProductGroupDeal[]){
 const rows=[...sales.map((value,i)=>({kind:'flash' as const,value,number:i+1})),...cuts.map((value,i)=>({kind:'cut' as const,value,number:i+1})),...deals.map((value,i)=>({kind:'group' as const,value,number:i+1}))];
 return rows.sort((a,b)=>(a.value.createdAt??0)-(b.value.createdAt??0));
}
