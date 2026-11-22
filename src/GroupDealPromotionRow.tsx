import {promotionDuration,compactPromotionDuration} from './PromotionDuration';
import React from 'react';
import PromotionMetaIcon from './PromotionMetaIcon';
import type {ProductGroupDeal} from './group-deal-types';
import dealIcon from './assets/flash-sale/group.png';
import PromotionRowActions from './PromotionRowActions';
export default function GroupDealPromotionRow({deal,index,number,disabled,onEdit,onDelete}:{deal:ProductGroupDeal;index:number;number:number;disabled:boolean;onEdit:(deal:ProductGroupDeal,button:HTMLButtonElement)=>void;onDelete:(deal:ProductGroupDeal)=>void}){
 return <div className="product-promotion-row" data-created-group-deal={deal.id}><img src={dealIcon} className="product-promotion-icon" width={12} height={12} alt=""/><div className="product-promotion-copy"><strong>Group deal: ${Number(deal.price).toFixed(2)}</strong><p><span>Quantity: {deal.quantity}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Group size: ${deal.size}`}><PromotionMetaIcon kind="customers"/>{deal.size}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Duration: ${promotionDuration(deal.duration)}`}><PromotionMetaIcon kind="duration"/>{compactPromotionDuration(deal.duration)}</span></p></div><PromotionRowActions kind="group deal" index={index} number={number} disabled={disabled} onEdit={button=>onEdit(deal,button)} onDelete={()=>onDelete(deal)}/></div>;
}
