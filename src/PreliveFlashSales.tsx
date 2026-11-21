import React from 'react';
import {ChevronDown} from 'lucide-react';
import './prelive-flash-sales.css';
import type {ProductFlashSale} from './flash-sale-types';
import flashIcon from './assets/annotation-icons/promotion-flash.png';
import PriceCutPromotionRow from './PriceCutPromotionRow';
import PromotionRowActions from './PromotionRowActions';
import type {ProductPriceCut} from './price-cut-types';
import GroupDealPromotionRow from './GroupDealPromotionRow';
import type {ProductGroupDeal} from './group-deal-types';

export default function PreliveFlashSales({sales,deals=[],onEditGroup,onDeleteGroup,cuts=[],onEditCut,onDeleteCut,index,expanded,onToggle,disabled,onEdit,onDelete}:{
 deals?:ProductGroupDeal[];onEditGroup:(deal:ProductGroupDeal,button:HTMLButtonElement)=>void;onDeleteGroup:(deal:ProductGroupDeal)=>void;
 cuts?:ProductPriceCut[];onEditCut:(cut:ProductPriceCut,button:HTMLButtonElement)=>void;onDeleteCut:(cut:ProductPriceCut)=>void;
 sales:ProductFlashSale[]; index:number; expanded:boolean; onToggle:()=>void; disabled:boolean;
 onEdit:(sale:ProductFlashSale,button:HTMLButtonElement)=>void; onDelete:(sale:ProductFlashSale)=>void;
}) {
 const remaining=sales.length+cuts.length+deals.length;
 return <section className="prelive-sale-summary product-promotions" data-testid="created-flash-sales" onClick={event=>{if(!disabled&&!(event.target as Element).closest('button'))onToggle()}}>
  <button type="button" className="prelive-sale-heading product-promotions-heading" aria-label={`Expand or collapse ${sales.length?'flash sales':'promotions'} for added product ${index}`} aria-expanded={expanded} disabled={disabled} onClick={onToggle}>
   <span>{remaining} unstarted promotions</span><ChevronDown size={16} className={expanded?'is-expanded':''}/>
  </button>
  {expanded&&<div className="prelive-sale-details product-promotions-details">{sales.map((sale,k)=><div className="prelive-sale-row product-promotion-row" key={sale.id} data-created-flash-sale={sale.id}>
   <img src={flashIcon} className="product-promotion-icon flash" width={14} height={20} alt=""/>
   <div className="product-promotion-copy"><strong>LIVE Flash sale</strong><div className="prelive-sale-bottom"><p><span>Price: {sale.price.trim()?`$${Number(sale.price).toFixed(2)}`:'—'}</span><span className="promotion-meta-dot" aria-hidden="true">•</span><span>Total purchase limit: {sale.total||'—'}</span></p></div></div>
   <PromotionRowActions kind="flash sale" index={index} number={k+1} disabled={disabled} onEdit={button=>onEdit(sale,button)} onDelete={()=>onDelete(sale)}/>
  </div>)}{cuts.map((cut,k)=><PriceCutPromotionRow key={cut.id} cut={cut} index={index} number={k+1} disabled={disabled} onEdit={onEditCut} onDelete={onDeleteCut}/>)}{deals.map((deal,k)=><GroupDealPromotionRow key={deal.id} deal={deal} index={index} number={k+1} disabled={disabled} onEdit={onEditGroup} onDelete={onDeleteGroup}/>)}</div>}
 </section>;
}
