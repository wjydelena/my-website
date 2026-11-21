import React, {useEffect, useLayoutEffect, useState} from 'react';
import flashSale from './assets/create-promotion/flash-sale.png';
import groupDeal from './assets/create-promotion/group-deal.png';
import priceCut from './assets/create-promotion/price-cut.png';
import './create-promotion-popover.css';

const sections=[
  {title:'Product-level promotions',items:[
    {title:'LIVE flash sale',description:'Offer limited-time deals to incentivize swift purchases',icon:flashSale},
    {title:'Group deal',description:'Let people team up to buy with limited-time deal',icon:groupDeal},
    {title:'Price cut',description:'Let people collectively cut to a lower deal with fun',icon:priceCut},
  ]},
];

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
    {sections.map((section,index)=><section className={`create-promotion-section${index?' is-order-level':''}`} key={section.title} role="group" aria-label={section.title}>
      <h2>{section.title}</h2>
      {section.items.map(item=><button type="button" role="menuitem" className="create-promotion-option" key={item.title} aria-label={item.title} onClick={item.title==='Price cut'?onPriceCut:item.title==='LIVE flash sale'?onFlashSale:onGroupDeal}>
        <img src={item.icon} width={32} height={32} alt="" draggable={false}/>
        <span><strong>{item.title}</strong><span className="create-promotion-description">{item.description}</span></span>
      </button>)}
    </section>)}
  </div>;
}
