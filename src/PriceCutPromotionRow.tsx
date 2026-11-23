import React from 'react';
import {compactPromotionDuration} from './PromotionDuration';
import PromotionMetaIcon from './PromotionMetaIcon';
import type {ProductPriceCut} from './price-cut-types';
import {priceCutDuration} from './PriceCutDrawer';
import PromotionRowActions,{type LivePromotionActionProps} from './PromotionRowActions';
import cutIcon from './assets/annotation-icons/promotion-cut.png';
export default function PriceCutPromotionRow({cut,index,number,disabled,onEdit,onDelete,...liveActions}:{cut:ProductPriceCut;index:number;number:number;disabled:boolean;onEdit:(cut:ProductPriceCut,button:HTMLButtonElement)=>void;onDelete:(cut:ProductPriceCut)=>void}&LivePromotionActionProps){
 return <div className="product-promotion-row" data-promotion-runtime-id={cut.id} data-created-price-cut={cut.id}><img src={cutIcon} className="product-promotion-icon" width={14} height={20} alt=""/><div className="product-promotion-copy"><strong className="promotion-cut-title"><span>Price cut: ${Number(cut.starting).toFixed(2)}</span><i className="promotion-title-divider" aria-hidden="true"/><span><span className="promotion-muted">{cut.participants} cuts to </span>${Number(cut.lowest).toFixed(2)}</span></strong><p><span>Quantity: {cut.quantity}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Participants: ${cut.participants}`}><PromotionMetaIcon kind="customers"/>{cut.participants}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Duration: ${priceCutDuration(cut.duration)}`}><PromotionMetaIcon kind="duration"/>{compactPromotionDuration(cut.duration)}</span></p></div><PromotionRowActions {...liveActions} kind="price cut" index={index} number={number} disabled={disabled} onEdit={button=>onEdit(cut,button)} onDelete={()=>onDelete(cut)}/></div>;
}
