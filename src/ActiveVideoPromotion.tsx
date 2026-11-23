import React from 'react';
import {usePrompter} from './PrompterContext';
import {useConsoleLayout} from './ResizableLayout';
import {promotionClock} from './usePromotionLifecycle';
import groupCountdown from './assets/group-countdown-live.png';
import './active-video-promotion.css';
import PriceCutVideoPin from './PriceCutVideoPin';

export default function ActiveVideoPromotion(){
 const {products}=usePrompter();
 const {editing}=useConsoleLayout();
 // Flash Sale remains active in the product list, but has no video Pin card.
 const product=products.filter(p=>p.activePromotion&&p.activePromotion.entry.kind!=='flash').sort((a,b)=>b.activePromotion!.startedOrder-a.activePromotion!.startedOrder)[0];
 const endedProduct=products.filter(p=>p.endedPriceCut).sort((a,b)=>b.endedPriceCut!.startedOrder-a.endedPriceCut!.startedOrder)[0];
 if(editing)return null;
 if(!product?.activePromotion)return endedProduct?<PriceCutVideoPin key={`ended-${endedProduct.id}-${endedProduct.endedPriceCut!.startedOrder}`} product={endedProduct} entry={endedProduct.endedPriceCut!.entry} seconds={0} ended/>:null;
 const {entry,seconds}=product.activePromotion;
 if(entry.kind==='cut')return <PriceCutVideoPin key={`${product.id}-${entry.value.id}-${product.activePromotion.startedOrder}`} product={product} entry={entry} seconds={seconds}/>;
 const price=entry.value.price;
 if(entry.kind==='group'){
  const size=Math.max(1,Number(entry.value.size)||1);
  return <div className="active-video-promotion group-video-pin" data-video-promotion={entry.value.id} data-video-promotion-kind="group" aria-label="Active Group deal in video" onPointerDown={event=>event.stopPropagation()}>
   <div className="group-video-thumbnail"><img src={product.image} alt={product.name}/><div className="group-video-countdown"><img src={groupCountdown} alt=""/><span role="timer" aria-live="off" aria-label={`Ends in ${promotionClock(seconds)}`}>{promotionClock(seconds)}</span></div></div>
   <div className="group-video-copy"><div className="group-video-price"><b>${Number(price).toFixed(2)}</b><del>${Number(product.price).toFixed(2)}</del></div>
    <div className="group-video-members" aria-label={`Group size: ${size}; ${size} more to go`}><div className="group-video-slots" aria-hidden="true">{Array.from({length:size},(_,index)=><span key={index}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5"/></svg></span>)}</div><span className="group-video-remaining">{size} more to go</span></div>
    <div className="group-video-name" title={product.name}>{product.name}</div>
   </div>
  </div>;
 }
 return null;
}
