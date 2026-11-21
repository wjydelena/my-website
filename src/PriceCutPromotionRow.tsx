import React from 'react';
import {Clock,UsersRound} from 'lucide-react';
import type {ProductPriceCut} from './price-cut-types';
import {priceCutDuration} from './PriceCutDrawer';
import PromotionRowActions from './PromotionRowActions';
import cutIcon from './assets/annotation-icons/promotion-cut.png';
export default function PriceCutPromotionRow({cut,index,number,disabled,onEdit,onDelete}:{cut:ProductPriceCut;index:number;number:number;disabled:boolean;onEdit:(cut:ProductPriceCut,button:HTMLButtonElement)=>void;onDelete:(cut:ProductPriceCut)=>void}){
 return <div className="product-promotion-row" data-created-price-cut={cut.id}><img src={cutIcon} className="product-promotion-icon" width={14} height={20} alt=""/><div className="product-promotion-copy"><strong>Price cut: ${Number(cut.lowest).toFixed(2)}</strong><p><span>Quantity: {cut.quantity}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Participants: ${cut.participants}`}><UsersRound size={14}/>{cut.participants}</span><span className="promotion-meta-dot">•</span><span className="promotion-icon-meta" aria-label={`Duration: ${priceCutDuration(cut.duration)}`}><Clock size={14}/>{priceCutDuration(cut.duration)}</span></p></div><PromotionRowActions kind="price cut" index={index} number={number} disabled={disabled} onEdit={button=>onEdit(cut,button)} onDelete={()=>onDelete(cut)}/></div>;
}
