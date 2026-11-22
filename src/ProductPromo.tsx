import {hasPromotion,promotionUnavailable} from './promotion-eligibility';
import type {PromotionKind} from './PromotionWizardSteps';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Plus} from 'lucide-react';
import flash from './assets/flash-sale/flash.png';
import price from './assets/flash-sale/price.png';
import group from './assets/flash-sale/group.png';
import FlashSaleDrawer from './FlashSaleDrawer';
import PriceCutDrawer from './PriceCutDrawer';
import GroupDealDrawer from './GroupDealDrawer';
import type {AddedItem} from './PreliveProductList';
import './flash-sale.css';

export type ProductPickerOptions={kind?:'add-more';promotionKind?:PromotionKind;returnFocus?:React.RefObject<HTMLButtonElement>};
export type ProductPickerRenderer=(existing:AddedItem[],close:()=>void,commit:(items:AddedItem[])=>void,options?:ProductPickerOptions)=>React.ReactNode;
const kinds:PromotionKind[]=['Flash Sale','Price Cut','Group Deal'];
const options=[{label:'Create Flash Sale',icon:flash},{label:'Create Price Cut',icon:price},{label:'Create Group Deal',icon:group}];

export default function ProductPromo({product,index,disabled,renderPicker,onConfirm}:{product:AddedItem;index:number;disabled:boolean;renderPicker:ProductPickerRenderer;onConfirm:(products:AddedItem[])=>void}){
 const [open,setOpen]=useState(false),[sale,setSale]=useState(false),[priceCut,setPriceCut]=useState(false),[groupDeal,setGroupDeal]=useState(false),[position,setPosition]=useState({left:0,top:0});
 const trigger=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null);
 const dismiss=()=>{setOpen(false);trigger.current?.focus()};
 useLayoutEffect(()=>{if(!open)return;const place=()=>{const b=trigger.current!.getBoundingClientRect(),m=menu.current!;setPosition({left:Math.max(8,Math.min(b.right-m.offsetWidth,innerWidth-m.offsetWidth-8)),top:b.bottom+7+m.offsetHeight<=innerHeight-8?b.bottom+7:Math.max(8,b.top-m.offsetHeight-7)})};place();menu.current?.focus();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true)}},[open]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!trigger.current?.contains(e.target as Node)&&!menu.current?.contains(e.target as Node))dismiss()};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();dismiss()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[open]);
 useEffect(()=>{if(disabled){setOpen(false);setSale(false);setPriceCut(false);setGroupDeal(false)}},[disabled]);
 return <><button type="button" className="product-promo-trigger" ref={trigger} aria-label={`Promo for added product ${index}`} disabled={disabled} aria-haspopup="menu" aria-expanded={open} onClick={()=>open?dismiss():setOpen(true)}><Plus size={16}/>Promo</button>
 {open&&createPortal(<div className="product-promo-menu" ref={menu} role="menu" aria-label={`Promotions for added product ${index}`} tabIndex={-1} style={position} onKeyDown={e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role=menuitem]:not(:disabled)')];if(!buttons.length)return;const at=buttons.indexOf(document.activeElement as HTMLButtonElement),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?(at+1)%buttons.length:(at<0?buttons.length-1:(at+buttons.length-1)%buttons.length);buttons[next].focus()}}>{options.map((option,k)=><button type="button" role="menuitem" key={option.label} disabled={hasPromotion(product,kinds[k])} title={hasPromotion(product,kinds[k])?promotionUnavailable(kinds[k]):undefined} onClick={()=>{if(k===0){setOpen(false);setSale(true)}else if(k===1){setOpen(false);setPriceCut(true)}else if(k===2){setOpen(false);setGroupDeal(true)}}}><img src={option.icon} alt="" width={16} height={16}/>{option.label}</button>)}</div>,document.body)}
 {sale&&<FlashSaleDrawer product={product} returnFocus={trigger} close={()=>setSale(false)} renderPicker={renderPicker} onConfirm={onConfirm}/>}
 {priceCut&&<PriceCutDrawer product={product} returnFocus={trigger} close={()=>setPriceCut(false)} renderPicker={renderPicker} onConfirm={onConfirm}/>}
 {groupDeal&&<GroupDealDrawer product={product} returnFocus={trigger} close={()=>setGroupDeal(false)} renderPicker={renderPicker} onConfirm={onConfirm}/>}
 </>;
}
