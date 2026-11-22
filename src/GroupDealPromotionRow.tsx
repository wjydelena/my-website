import {promotionDuration,compactPromotionDuration} from './PromotionDuration';
import React from 'react';
import PromotionMetaIcon from './PromotionMetaIcon';
import type {ProductGroupDeal} from './group-deal-types';
import dealIcon from './assets/annotation-icons/promotion-group.png';
import PromotionRowActions,{type LivePromotionActionProps} from './PromotionRowActions';
export default function GroupDealPromotionRow({deal,index,number,disabled,onEdit,onDelete,...liveActions}:{deal:ProductGroupDeal;index:number;number:number;disabled:boolean;onEdit:(deal:ProductGroupDeal,button:HTMLButtonElement)=>void;onDelete:(deal:ProductGroupDeal)=>void}&LivePromotionActionProps){
 return <div className="product-promotion-row" data-created-group-deal={deal.id}><img src={dealIcon} className="product-promotion-icon" width={14} height={20} alt=""/><div className="product-promotion-copy"><strong>Group deal: ${Number(deal.price).toFixed(2)}</strong><p><span>Quantity: {deal.quantity}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Group size: ${deal.size}`}><PromotionMetaIcon kind="customers"/>{deal.size}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Duration: ${promotionDuration(deal.duration)}`}><PromotionMetaIcon kind="duration"/>{compactPromotionDuration(deal.duration)}</span></p></div><PromotionRowActions {...liveActions} kind="group deal" index={index} number={number} disabled={disabled} onEdit={button=>onEdit(deal,button)} onDelete={()=>onDelete(deal)}/></div>;
}
