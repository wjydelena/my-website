import React,{useEffect,useState} from 'react';
import type {PrompterProduct} from './PrompterContext';
import {promotionClock,type PromotionEntry} from './usePromotionLifecycle';
import countdownStrip from './assets/price-cut-countdown-strip.png';
import countdownScissors from './assets/price-cut-bag-scissors.png';
import yellowBagEnded from './assets/price-cut-yellow-bag-ended.png';
import './price-cut-video-pin.css';

export default function PriceCutVideoPin({product,entry,seconds,ended=false}:{product:PrompterProduct;entry:Extract<PromotionEntry,{kind:'cut'}>;seconds:number;ended?:boolean}){
 const [line,setLine]=useState(0);
 useEffect(()=>{if(ended)return;const timer=window.setInterval(()=>setLine(value=>1-value),2500);return()=>window.clearInterval(timer);},[ended]);
 const value=entry.value,starting=Number(value.starting).toFixed(2),lowest=Number(value.lowest).toFixed(2);
 const cuts=Math.max(1,Number(value.participants)||1);
 // No buyer events exist in this local demo. The first-cut offer uses an even split of the configured discount.
 const firstCut=(Math.max(0,Number(value.starting)-Number(value.lowest))/cuts).toFixed(2);
 const [whole,decimal]=starting.split('.');
 return <div className={`active-video-promotion price-cut-video-pin${ended?' is-ended':''}`} data-video-promotion={value.id} data-video-promotion-kind="cut" data-price-cut-state={ended?'ended':'running'} aria-label={ended?'Ended Price cut in video':'Active Price cut in video'} onPointerDown={event=>event.stopPropagation()}>
  <div className="cut-video-thumbnail"><img className={ended?'cut-video-bag-ended':'cut-video-bag-composite'} src={yellowBagEnded} alt="Yellow handbag"/>
   {ended?<span className="cut-video-ended-badge">Price cut</span>:<><img className="cut-video-countdown-strip" src={countdownStrip} alt=""/><img className="cut-video-countdown-scissors" src={countdownScissors} alt=""/><div className="cut-video-countdown"><span role="timer" aria-live="off" aria-label={`Ends in ${promotionClock(seconds)}`}>{promotionClock(seconds)}</span></div></>}
  </div>
  <div className="cut-video-copy">
   <div className="cut-video-prices"><strong aria-label={`Current price $${starting}`}>${whole}<small>.{decimal}</small></strong>{!ended&&<span>${lowest}</span>}</div>
   {!ended&&<div className="cut-video-price-track" aria-hidden="true"><span/><i/></div>}
   {ended?<div className="cut-video-ended-copy">No one joined the Price Cut</div>:<div className="cut-video-ticker" data-current-line={line}>
    <div className="cut-video-ticker-track" style={{transform:`translateY(-${line*50}%)`}}>
     <div aria-hidden={line!==0}>1st cut gets <em>${firstCut}</em> off</div>
     <div aria-hidden={line!==1}>{cuts} {cuts===1?'cut':'cuts'} to ${lowest}</div>
    </div>
   </div>}
   <div className="cut-video-name" title={product.name}>{product.name}</div>
  </div>
 </div>;
}
