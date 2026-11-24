import {orderedProductPromotions} from './promotion-creation-order';
import React from 'react';
import {ChevronDown} from 'lucide-react';
import './product-promotions.css';
import './prelive-flash-sales.css';
import type {ProductFlashSale} from './flash-sale-types';
import flashIcon from './assets/annotation-icons/promotion-flash.png';
import PriceCutPromotionRow from './PriceCutPromotionRow';
import PromotionRowActions from './PromotionRowActions';
import type {ProductPriceCut} from './price-cut-types';
import GroupDealPromotionRow from './GroupDealPromotionRow';
import type {ProductGroupDeal} from './group-deal-types';
import type {ProductPromotionRuntime} from './usePromotionLifecycle';

export default function PreliveFlashSales({sales,deals=[],onEditGroup,onDeleteGroup,cuts=[],onEditCut,onDeleteCut,index,expanded,onToggle,disabled,onEdit,onDelete,live=false,runtime,onStart}:{
 deals?:ProductGroupDeal[];onEditGroup:(deal:ProductGroupDeal,button:HTMLButtonElement)=>void;onDeleteGroup:(deal:ProductGroupDeal)=>void;
 cuts?:ProductPriceCut[];onEditCut:(cut:ProductPriceCut,button:HTMLButtonElement)=>void;onDeleteCut:(cut:ProductPriceCut)=>void;
 live?:boolean;runtime?:ProductPromotionRuntime;onStart?:(id:string)=>void;
 sales:ProductFlashSale[]; index:number; expanded:boolean; onToggle:()=>void; disabled:boolean;
 onEdit:(sale:ProductFlashSale,button:HTMLButtonElement)=>void; onDelete:(sale:ProductFlashSale)=>void;
}) {
 const all=orderedProductPromotions(sales,cuts,deals);
 const promotions=live?all.filter(p=>p.value.id!==runtime?.active?.id).sort((a,b)=>{const ae=runtime?.ended[a.value.id],be=runtime?.ended[b.value.id];return ae&&be?ae-be:ae?1:be?-1:0}):all;
 const remaining=promotions.length;
 const unstarted=live?promotions.filter(p=>!runtime?.ended[p.value.id]).length:remaining;
 const hasEnded=live&&promotions.some(p=>runtime?.ended[p.value.id]);
 if(live&&!remaining)return null;
 return <section className={`prelive-sale-summary product-promotions${hasEnded?' has-ended-promotions':''}`} data-testid="created-flash-sales" onClick={event=>{if(!disabled&&!(event.target as Element).closest('button'))onToggle()}}>
  <button type="button" className="prelive-sale-heading product-promotions-heading" aria-label={`Expand or collapse ${sales.length?'flash sales':'promotions'} for added product ${index}`} aria-expanded={expanded} disabled={disabled} onClick={onToggle}>
   <span>{unstarted} unstarted promotions</span><ChevronDown size={16} className={expanded?'is-expanded':''}/>
  </button>
  {expanded&&<div className="prelive-sale-details product-promotions-details">{promotions.map(entry=>{
   const actions={live,ended:!!runtime?.ended[entry.value.id],busy:!!runtime?.active,onStart:()=>onStart?.(entry.value.id)};
   if(entry.kind==='cut')return <PriceCutPromotionRow key={`cut-${entry.value.id}`} cut={entry.value} index={index} number={entry.number} disabled={disabled} {...actions} onEdit={onEditCut} onDelete={onDeleteCut}/>;
   if(entry.kind==='group')return <GroupDealPromotionRow key={`group-${entry.value.id}`} deal={entry.value} index={index} number={entry.number} disabled={disabled} {...actions} onEdit={onEditGroup} onDelete={onDeleteGroup}/>;
   const sale=entry.value;
   return <div className="prelive-sale-row product-promotion-row" key={`flash-${sale.id}`} data-created-flash-sale={sale.id} data-promotion-runtime-id={sale.id}>
    <img src={flashIcon} className="product-promotion-icon flash" width={14} height={20} alt=""/>
    <div className="product-promotion-copy"><strong>LIVE Flash sale</strong><div className="prelive-sale-bottom"><p><span>Price: {sale.price.trim()?`$${Number(sale.price).toFixed(2)}`:'—'}</span><span className="promotion-meta-dot" aria-hidden="true">•</span><span>Total purchase limit: {sale.total||'—'}</span></p></div></div>
    <PromotionRowActions kind="flash sale" index={index} number={entry.number} disabled={disabled} {...actions} onEdit={button=>onEdit(sale,button)} onDelete={()=>onDelete(sale)}/>
   </div>;
  })}</div>}
 </section>;
}
