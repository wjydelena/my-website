import React, {useState} from 'react';
import {ChevronDown,MoreHorizontal} from 'lucide-react';
import './prelive-flash-sales.css';
import type {ProductFlashSale} from './flash-sale-types';
import flashIcon from './assets/annotation-icons/promotion-flash.png';

export default function PreliveFlashSales({sales,index,expanded,onToggle,disabled,onEdit,onDelete}:{
 sales:ProductFlashSale[]; index:number; expanded:boolean; onToggle:()=>void; disabled:boolean;
 onEdit:(sale:ProductFlashSale,button:HTMLButtonElement)=>void; onDelete:(sale:ProductFlashSale)=>void;
}) {
 const [menu,setMenu]=useState<string|null>(null);
 const [running,setRunning]=useState<string[]>([]);
 const remaining=sales.filter(s=>!running.includes(s.id)).length;
 return <section className="prelive-sale-summary product-promotions" data-testid="created-flash-sales" onClick={event=>{if(!disabled&&!(event.target as Element).closest('button'))onToggle()}}>
  <button type="button" className="prelive-sale-heading product-promotions-heading" aria-label={`Expand or collapse flash sales for added product ${index}`} aria-expanded={expanded} disabled={disabled} onClick={onToggle}>
   <span>{remaining} unstarted promotions</span><ChevronDown size={16} className={expanded?'is-expanded':''}/>
  </button>
  {expanded&&<div className="prelive-sale-details product-promotions-details">{sales.map((sale,k)=><div className="prelive-sale-row product-promotion-row" key={sale.id} data-created-flash-sale={sale.id}>
   <img src={flashIcon} className="product-promotion-icon flash" width={14} height={20} alt=""/>
   <div className="product-promotion-copy"><strong>LIVE Flash sale</strong><div className="prelive-sale-bottom"><p><span>Price: {sale.price.trim()?`$${Number(sale.price).toFixed(2)}`:'—'}</span><span className="promotion-meta-dot" aria-hidden="true">•</span><span>Total purchase limit: {sale.total||'—'}</span></p></div></div>
   <div className="product-promotion-actions"><button type="button" aria-label={`More flash sale ${k+1} actions for added product ${index}`} aria-expanded={menu===sale.id} disabled={disabled} onClick={()=>setMenu(menu===sale.id?null:sale.id)}><MoreHorizontal size={16}/></button><button type="button" aria-label={`${running.includes(sale.id)?'Stop':'Start'} flash sale ${k+1} for added product ${index}`} disabled={disabled} onClick={()=>{setMenu(null);setRunning(s=>s.includes(sale.id)?s.filter(id=>id!==sale.id):[...s,sale.id])}}>{running.includes(sale.id)?'Stop':'Start'}</button></div>
   {menu===sale.id&&<div className="product-promotion-menu" role="menu" aria-label={`Flash sale ${k+1} actions for added product ${index}`} onKeyDown={e=>{if(e.key==='Escape')setMenu(null)}}><button type="button" role="menuitem" aria-label={`Edit flash sale ${k+1} for added product ${index}`} onClick={e=>{const trigger=e.currentTarget.closest('.product-promotion-row')!.querySelector<HTMLButtonElement>('.product-promotion-actions button')!;setMenu(null);onEdit(sale,trigger)}}>Edit promotion</button><button type="button" role="menuitem" aria-label={`Delete flash sale ${k+1} for added product ${index}`} onClick={e=>{const trigger=e.currentTarget.closest('article')?.querySelector<HTMLButtonElement>('.product-promo-trigger');onDelete(sale);setMenu(null);requestAnimationFrame(()=>trigger?.focus())}}>Remove promotion</button><button type="button" role="menuitem" onClick={()=>setMenu(null)}>Cancel</button></div>}
  </div>)}</div>}
 </section>;
}
