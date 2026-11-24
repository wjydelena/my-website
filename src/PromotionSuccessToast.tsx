import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {PromotionKind} from './PromotionWizardSteps';
import './promotion-success-toast.css';

const eventName='live-console:promotion-created';
type SuccessDetail={kind:PromotionKind;count:number};
const names:Record<PromotionKind,string>={'Flash Sale':'flash sales','Price Cut':'price cuts','Group Deal':'group deals'};

export function notifyPromotionCreated(kind:PromotionKind,products:readonly {id:string}[]){
 const count=new Set(products.map(product=>product.id)).size;
 if(count)window.dispatchEvent(new CustomEvent<SuccessDetail>(eventName,{detail:{kind,count}}));
}

export default function PromotionSuccessToast(){
 const [toast,setToast]=useState<(SuccessDetail&{id:number})|null>(null);
 const sequence=useRef(0);
 useEffect(()=>{
  let timeout:number|undefined;
  const show=(event:Event)=>{
   const detail=(event as CustomEvent<SuccessDetail>).detail;
   window.clearTimeout(timeout);
   setToast({...detail,id:++sequence.current});
   timeout=window.setTimeout(()=>setToast(null),3000);
  };
  window.addEventListener(eventName,show);
  return()=>{window.removeEventListener(eventName,show);window.clearTimeout(timeout)};
 },[]);
 return createPortal(<div className="promotion-success-announcer" role="status" aria-live="polite" aria-atomic="true">{toast&&<div key={toast.id} className="promotion-success-toast" data-testid="promotion-success-toast" data-promotion-kind={toast.kind} data-product-count={toast.count}>
  <svg className="promotion-success-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#25a244"/><path d="m4 7 2 2 4-4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  <span>Successfully created {names[toast.kind]} for {toast.count===1?'a product':`${toast.count} products`}.</span>
 </div>}</div>,document.body);
}
