import React, { useEffect, useState } from 'react';
import './prelive-flash-sales.css';
import type { ProductFlashSale } from './flash-sale-types';
import flashIcon from './assets/flash-sale/created-flash.png';
import deleteIcon from './assets/flash-sale/created-delete.png';
import editIcon from './assets/flash-sale/created-edit.png';
import arrowIcon from './assets/flash-sale/created-arrow.png';

export default function PreliveFlashSales({sales,index,disabled,onEdit,onDelete}:{
  sales:ProductFlashSale[];
  index:number;
  disabled:boolean;
  onEdit:(sale:ProductFlashSale,button:HTMLButtonElement)=>void;
  onDelete:(sale:ProductFlashSale)=>void;
}) {
  const [expanded,setExpanded]=useState(true);
  useEffect(()=>setExpanded(true),[sales.length]);
  return <div className="prelive-sale-summary" data-testid="created-flash-sales">
    <button type="button" className="prelive-sale-heading" aria-label={`Expand or collapse flash sales for added product ${index}`} aria-expanded={expanded} disabled={disabled} onClick={()=>setExpanded(!expanded)}>
      <span>{sales.length} unstarted promotions</span><img src={arrowIcon} alt="" width={16} height={16} className={expanded?'':'is-collapsed'}/>
    </button>
    {expanded&&<div className="prelive-sale-details">{sales.map((sale,k)=><div className="prelive-sale-row" key={sale.id} data-created-flash-sale={sale.id}>
      <div className="prelive-sale-title"><img src={flashIcon} alt="" width={16} height={16}/><strong>LIVE Flash sale</strong></div>
      <div className="prelive-sale-bottom"><p>Price: <strong>${Number(sale.price).toFixed(2)}</strong><i aria-hidden="true"/>Total purchase limit: {sale.total}</p>
        <div className="prelive-sale-actions"><button type="button" disabled={disabled} aria-label={`Delete flash sale ${k+1} for added product ${index}`} onClick={event=>{const trigger=event.currentTarget.closest('article')?.querySelector<HTMLButtonElement>('.product-promo-trigger');onDelete(sale);requestAnimationFrame(()=>trigger?.focus());}}><img src={deleteIcon} alt="" width={16} height={16}/></button><button type="button" disabled={disabled} aria-label={`Edit flash sale ${k+1} for added product ${index}`} onClick={event=>onEdit(sale,event.currentTarget)}><img src={editIcon} alt="" width={16} height={16}/></button></div>
      </div>
    </div>)}</div>}
  </div>;
}
