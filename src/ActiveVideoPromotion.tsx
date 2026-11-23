import React from 'react';
import {usePrompter} from './PrompterContext';
import {useConsoleLayout} from './ResizableLayout';
import {promotionClock} from './usePromotionLifecycle';
import groupIcon from './assets/annotation-icons/promotion-group.png';
import './active-video-promotion.css';

export default function ActiveVideoPromotion(){
 const {products}=usePrompter();
 const {editing}=useConsoleLayout();
 // Flash Sale remains active in the product list, but has no video Pin card.
 const product=products.filter(p=>p.activePromotion&&p.activePromotion.entry.kind!=='flash').sort((a,b)=>b.activePromotion!.startedOrder-a.activePromotion!.startedOrder)[0];
 if(editing||!product?.activePromotion)return null;
 const {entry,seconds}=product.activePromotion;
 const label=entry.kind==='group'?'Group deal':entry.kind==='flash'?'LIVE Flash sale':'Price cut';
 const price=entry.kind==='cut'?entry.value.starting:entry.value.price;
 if(entry.kind==='group'){
  const size=Math.max(1,Number(entry.value.size)||1);
  return <div className="active-video-promotion group-video-pin" data-video-promotion={entry.value.id} data-video-promotion-kind="group" aria-label="Active Group deal in video" onPointerDown={event=>event.stopPropagation()}>
   <div className="group-video-thumbnail"><img src={product.image} alt={product.name}/><div className="group-video-countdown"><img src={groupIcon} alt=""/><span role="timer" aria-live="off" aria-label={`Ends in ${promotionClock(seconds)}`}>{promotionClock(seconds)}</span></div></div>
   <div className="group-video-copy"><div className="group-video-price"><b>${Number(price).toFixed(2)}</b><del>${Number(product.price).toFixed(2)}</del></div>
    <div className="group-video-members" aria-label={`Group size: ${size}; ${size} more to go`}><div className="group-video-slots" aria-hidden="true">{Array.from({length:Math.min(size,4)},(_,index)=><span key={index}>+</span>)}</div><span className="group-video-remaining">{size} more to go</span></div>
    <div className="group-video-name" title={product.name}>{product.name}</div>
   </div>
  </div>;
 }
 return <div className="active-video-promotion" data-video-promotion={entry.value.id} data-video-promotion-kind={entry.kind} aria-label={`Active ${label} in video`} onPointerDown={event=>event.stopPropagation()}>
  <img className="active-video-promotion-image" src={product.image} alt={product.name}/>
  <div className="active-video-promotion-copy"><strong className="active-video-product-name" title={product.name}>{product.name}</strong>
   <div className="active-video-promotion-heading"><span>{label}</span><span role="timer" aria-live="off">Ends in {promotionClock(seconds)}</span></div>
   <div className="active-video-promotion-price"><b>{entry.kind==='cut'?'Now ':''}${Number(price).toFixed(2)}</b>{entry.kind!=='cut'&&<del>${Number(product.price).toFixed(2)}</del>}</div>
   <p>{entry.kind==='flash'?`Total purchase limit: ${entry.value.total}`:`0 cuts · Participants: ${entry.value.participants} · Quantity: ${entry.value.quantity}`}</p>
  </div>
 </div>;
}
