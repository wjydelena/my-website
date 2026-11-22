import React, {useEffect, useLayoutEffect, useState} from 'react';
import type {PromotionKind} from './PromotionWizardSteps';
import flashSale from './assets/create-promotion/flash-sale.png';
import groupDeal from './assets/create-promotion/group-deal.png';
import priceCut from './assets/create-promotion/price-cut.png';
import './create-promotion-popover.css';

const items=[
  {kind:'Flash Sale',title:'LIVE flash sale',description:'Offer limited-time deals to incentivize swift purchases',icon:flashSale},
  {kind:'Group Deal',title:'Group deal',description:'Let people team up to buy with limited-time deal',icon:groupDeal},
  {kind:'Price Cut',title:'Price cut',description:'Let people collectively cut to a lower deal with fun',icon:priceCut},
] as const;

export function PromotionOptions({onSelect,isBlocked}:{onSelect:(kind:PromotionKind)=>void;isBlocked?:(kind:PromotionKind)=>boolean}){
  return <div className="promotion-options">{items.map(item=>{
    const blocked=isBlocked?.(item.kind)||false;
    return <button type="button" role="menuitem" className="create-promotion-option" key={item.kind} aria-label={item.title} disabled={blocked} title={blocked?`A selected product already has a ${item.kind}. Edit or delete it first.`:undefined} onClick={()=>onSelect(item.kind)}>
      <img src={item.icon} width={32} height={32} alt="" draggable={false}/>
      <span><strong>{item.title}</strong><span className="create-promotion-description">{item.description}</span></span>
    </button>;
  })}</div>;
}

export default function CreatePromotionPopover({anchor,panelRef,onPriceCut,onFlashSale,onGroupDeal}:{anchor:React.RefObject<HTMLButtonElement>;panelRef:React.RefObject<HTMLDivElement>;onPriceCut?:()=>void;onFlashSale?:()=>void;onGroupDeal?:()=>void}){
  const [position,setPosition]=useState<{left:number;top:number}|null>(null);
  const placed=position!==null;
  useEffect(()=>{if(placed)panelRef.current?.focus({preventScroll:true});},[placed,panelRef]);
  useLayoutEffect(()=>{
    const element=panelRef.current;
    if(!element)return;
    const place=()=>{
      const button=anchor.current;if(!button)return;
      const bounds=button.getBoundingClientRect();
      const left=Math.max(8,Math.min(bounds.right-element.offsetWidth,window.innerWidth-element.offsetWidth-8));
      const top=Math.max(8,Math.min(bounds.top-element.offsetHeight-6,window.innerHeight-element.offsetHeight-8));
      setPosition(previous=>previous?.left===left&&previous?.top===top?previous:{left,top});
    };
    place();
    const observer=new ResizeObserver(place);observer.observe(element);
    if(anchor.current)observer.observe(anchor.current);
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    return()=>{observer.disconnect();window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
  },[anchor,panelRef]);
  return <div className="create-promotion-popover" id="create-promotion-menu" ref={panelRef} role="menu" aria-label="Create promotion options" tabIndex={-1}
    style={position?{left:position.left,top:position.top}:{visibility:'hidden'}} onPointerDown={event=>event.stopPropagation()}
    onKeyDown={event=>{
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      event.preventDefault();
      const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
      const current=buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:event.key==='ArrowDown'?(current+1)%buttons.length:(current<0?buttons.length-1:(current-1+buttons.length)%buttons.length);
      buttons[next]?.focus();
    }}>
    <PromotionOptions onSelect={kind=>{if(kind==='Flash Sale')onFlashSale?.();else if(kind==='Price Cut')onPriceCut?.();else onGroupDeal?.();}}/>
  </div>;
}
