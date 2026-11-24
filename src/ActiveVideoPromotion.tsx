import React from 'react';
import {usePrompter,isEndedPinVisible} from './PrompterContext';
import {useConsoleLayout} from './ResizableLayout';
import {promotionClock} from './usePromotionLifecycle';
import groupCountdown from './assets/group-countdown-live.png';
import './active-video-promotion.css';
import PriceCutVideoPin from './PriceCutVideoPin';

export default function ActiveVideoPromotion(){
 const {products,pinned,videoPreviewVisible}=usePrompter();
 const {editing}=useConsoleLayout();
 // Flash Sale remains active in the product list, but has no video Pin card.
 const product=products.find(p=>p.id===pinned);
 if(editing||!videoPreviewVisible||!product)return null;
 const promotion=product.activePromotion||(isEndedPinVisible(product)?product.endedPromotion:undefined);
 if(!promotion||promotion.entry.kind==='flash')return null;
 const {entry,startedOrder}=promotion,ended=!product.activePromotion;
 const seconds=product.activePromotion?.seconds||0;
 if(entry.kind==='cut')return <PriceCutVideoPin key={`${ended?'ended':'running'}-${product.id}-${entry.value.id}-${startedOrder}`} product={product} entry={entry} seconds={seconds} ended={ended}/>;
 const price=entry.value.price;
 if(entry.kind==='group'){
  const size=Math.max(1,Number(entry.value.size)||1);
  return <div className="active-video-promotion group-video-pin" data-video-promotion={entry.value.id} data-video-promotion-kind="group" data-group-state={ended?'ended':'running'} aria-label={ended?'Ended Group deal in video':'Active Group deal in video'} onPointerDown={event=>event.stopPropagation()}>
   <div className="group-video-thumbnail"><img src={product.image} alt={product.name}/>{ended?<span className="group-video-ended-badge">Group deal</span>:<div className="group-video-countdown"><img src={groupCountdown} alt=""/><span role="timer" aria-live="off" aria-label={`Ends in ${promotionClock(seconds)}`}>{promotionClock(seconds)}</span></div>}</div>
   <div className="group-video-copy"><div className="group-video-price"><b>${Number(price).toFixed(2)}</b><del>${Number(product.price).toFixed(2)}</del></div>
    {ended?<div className="group-video-ended-message">Group deal ended</div>:<div className="group-video-members" aria-label={`Group size: ${size}; ${size} more to go`}><div className="group-video-slots" aria-hidden="true">{Array.from({length:size},(_,index)=><span key={index}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5"/></svg></span>)}</div><span className="group-video-remaining">{size} more to go</span></div>}
    <div className="group-video-name" title={product.name}>{product.name}</div>
   </div>
  </div>;
 }
 return null;
}
