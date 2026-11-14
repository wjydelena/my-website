import React, { useEffect, useState } from 'react';
import { ChevronDown, Clock3, MoreHorizontal, Scissors, Users, Zap } from 'lucide-react';
import groupIcon from './assets/promotion-tools/02-group.png';

const promotions = [
  {id:'flash',title:'LIVE Flash sale',meta:'Price: $70 · Total purchase limit: 50',Icon:Zap},
  {id:'cut',title:'Price cut: 3 cuts to $80.00',meta:'Quantity: 20',Icon:Scissors},
  {id:'group',title:'Group deal: $8.00',meta:'Quantity: 20',Icon:Users},
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
      <span>{remaining} unstarted promotions</span><ChevronDown size={16} className={expanded?'is-expanded':''}/>
    </button>
    {expanded&&<div className="product-promotions-details" data-testid="product-promotions-expanded">
      {active.map(({id,title,meta,Icon})=><div className="product-promotion-row" key={id}>
        {id==='group'?<img src={groupIcon} className="product-promotion-icon group" width={16} height={16} alt=""/>:<Icon size={16} className={`product-promotion-icon ${id}`} fill={id==='flash'?'currentColor':'none'}/>}
        <div className="product-promotion-copy"><strong>{id==='cut'?<>Price cut: <span className="promotion-muted">3 cuts</span> to $80.00</>:title}</strong><p>{meta}{id!=='flash'&&<><span> · </span><Users size={12}/><span>3 · </span><Clock3 size={12}/><span>30s</span></>}</p></div>
        <div className="product-promotion-actions"><button type="button" aria-label={`More ${title} actions`} aria-expanded={menu===id} disabled={disabled} onClick={()=>setMenu(menu===id?null:id)}><MoreHorizontal size={16}/></button><button type="button" aria-label={`${running.includes(id)?'Stop':'Start'} ${title}`} disabled={disabled} onClick={()=>{setMenu(null);setRunning(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}}>{running.includes(id)?'Stop':'Start'}</button></div>
        {menu===id&&<div className="product-promotion-menu" role="menu" aria-label={`${title} actions`} onKeyDown={e=>{if(e.key==='Escape')setMenu(null);}}><button role="menuitem" type="button" onClick={()=>{setHidden(prev=>[...prev,id]);setMenu(null);}}>Remove promotion</button><button role="menuitem" type="button" onClick={()=>setMenu(null)}>Cancel</button></div>}
      </div>)}
      {!active.length&&<p className="product-promotion-empty">No promotions for this product.</p>}
    </div>}
  </section>;
}
