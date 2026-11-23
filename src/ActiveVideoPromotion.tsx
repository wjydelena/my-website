import React from 'react';
import {usePrompter} from './PrompterContext';
import {useConsoleLayout} from './ResizableLayout';
import {promotionClock} from './usePromotionLifecycle';
import './active-video-promotion.css';

export default function ActiveVideoPromotion(){
 const {products}=usePrompter();
 const {editing}=useConsoleLayout();
 const product=products.filter(p=>p.activePromotion).sort((a,b)=>b.activePromotion!.startedOrder-a.activePromotion!.startedOrder)[0];
 if(editing||!product?.activePromotion)return null;
 const {entry,seconds}=product.activePromotion;
 const label=entry.kind==='group'?'Group deal':entry.kind==='flash'?'LIVE Flash sale':'Price cut';
 const price=entry.kind==='cut'?entry.value.starting:entry.value.price;
 return <div className="active-video-promotion" data-video-promotion={entry.value.id} data-video-promotion-kind={entry.kind} aria-label={`Active ${label} in video`} onPointerDown={event=>event.stopPropagation()}>
  <img className="active-video-promotion-image" src={product.image} alt={product.name}/>
  <div className="active-video-promotion-copy"><strong className="active-video-product-name" title={product.name}>{product.name}</strong>
   <div className="active-video-promotion-heading"><span>{label}</span><span role="timer" aria-live="off">Ends in {promotionClock(seconds)}</span></div>
   <div className="active-video-promotion-price"><b>{entry.kind==='cut'?'Now ':''}${Number(price).toFixed(2)}</b>{entry.kind!=='cut'&&<del>${Number(product.price).toFixed(2)}</del>}</div>
   <p>{entry.kind==='group'?`Group size: ${entry.value.size} · Quantity: ${entry.value.quantity}`:entry.kind==='flash'?`Total purchase limit: ${entry.value.total}`:`0 cuts · Participants: ${entry.value.participants} · Quantity: ${entry.value.quantity}`}</p>
  </div>
 </div>;
}
