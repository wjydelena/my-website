import { PRODUCT_PRICE } from './product-pricing';
import React, { useEffect, useState } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import PromotionMetaIcon from './PromotionMetaIcon';
import flashIcon from './assets/annotation-icons/promotion-flash.png';
import cutIcon from './assets/annotation-icons/promotion-cut.png';
import groupIcon from './assets/annotation-icons/promotion-group.png';

const promotions = [
  {id:'flash',title:'LIVE Flash sale',icon:flashIcon},
  {id:'group',title:`Group deal: $${PRODUCT_PRICE}`,icon:groupIcon},
  {id:'cut',title:`Price cut: $${PRODUCT_PRICE}`,icon:cutIcon},
];
export default function ProductPromotions({expanded,onToggle,disabled}:{expanded:boolean;onToggle:()=>void;disabled:boolean}) {
  const [running,setRunning]=useState<string[]>([]);
  const [menu,setMenu]=useState<string|null>(null);
  const [hidden,setHidden]=useState<string[]>([]);
  useEffect(()=>{if(disabled)setMenu(null);},[disabled]);
  const active=promotions.filter(p=>!hidden.includes(p.id));
  const remaining=active.filter(p=>!running.includes(p.id)).length;
  return <section className="product-promotions" id="product-3-promotions" aria-label="Product 3 promotions" onClick={event=>{if(!disabled&&!(event.target as Element).closest('button'))onToggle();}}>
    <button type="button" className="product-promotions-heading" aria-label="Expand or collapse product 3 promotions" aria-expanded={expanded} disabled={disabled} onClick={onToggle}>
      <span>{remaining} available promotions</span><ChevronDown size={16} className={expanded?'is-expanded':''}/>
    </button>
    {expanded&&<div className="product-promotions-details" data-testid="product-promotions-expanded">
      {active.map(({id,title,icon})=><div className="product-promotion-row" key={id} data-promotion-id={id}>
        <img src={icon} className={`product-promotion-icon ${id}`} width={14} height={20} alt=""/>
        <div className="product-promotion-copy"><strong className={id==='cut'?'promotion-cut-title':undefined}>{id==='cut'?<><span>{title}</span><i className="promotion-title-divider" aria-hidden="true"/><span><span className="promotion-muted">3 cuts to </span>${PRODUCT_PRICE}</span></>:title}</strong><p>{id==='flash'?<><span>Price: ${PRODUCT_PRICE}</span><span className="promotion-meta-dot" aria-hidden="true">•</span><span>Total purchase limit: 50</span></>:<><span>Quantity: 20</span><span className="promotion-meta-dot" aria-hidden="true">•</span><PromotionMetaIcon kind="customers"/><span>3</span><span className="promotion-meta-dot" aria-hidden="true">•</span><PromotionMetaIcon kind="duration"/><span>30s</span></>}</p></div>
        <div className="product-promotion-actions"><button type="button" aria-label={`More ${title} actions`} aria-expanded={menu===id} disabled={disabled} onClick={()=>setMenu(menu===id?null:id)}><MoreHorizontal size={16}/></button><button type="button" aria-label={`${running.includes(id)?'Stop':'Start'} ${title}`} disabled={disabled} onClick={()=>{setMenu(null);setRunning(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}}>{running.includes(id)?'Stop':'Start'}</button></div>
        {menu===id&&<div className="product-promotion-menu" role="menu" aria-label={`${title} actions`} onKeyDown={e=>{if(e.key==='Escape')setMenu(null);}}><button role="menuitem" type="button" onClick={()=>{setHidden(prev=>[...prev,id]);setMenu(null);}}>Remove promotion</button><button role="menuitem" type="button" onClick={()=>setMenu(null)}>Cancel</button></div>}
      </div>)}
      {!active.length&&<p className="product-promotion-empty">No promotions for this product.</p>}
    </div>}
  </section>;
}
