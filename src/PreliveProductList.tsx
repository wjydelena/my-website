import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import ProductPromo,{type ProductPickerRenderer} from './ProductPromo';
import FlashSaleDrawer from './FlashSaleDrawer';
import PreliveFlashSales from './PreliveFlashSales';
import type {ProductFlashSale} from './flash-sale-types';
import type {ProductPriceCut} from './price-cut-types';
import PriceCutDrawer from './PriceCutDrawer';
import GroupDealDrawer from './GroupDealDrawer';
import type {ProductGroupDeal} from './group-deal-types';
import reorderIcon from './assets/prelive/added/reorder.png';
import editIcon from './assets/prelive/added/edit.png';
import moreIcon from './assets/prelive/added/more.png';
import top from './assets/prelive/added/shop-0.png';
import pants from './assets/prelive/added/shop-1.png';
import bag from './assets/prelive/added/shop-2.png';
import bra from './assets/prelive/added/shop-3.png';
import glasses from './assets/prelive/added/shop-4.png';
import blazer from './assets/prelive/added/showcase-0.png';

export type AddedItem={id:string;name:string;image:string;sku:string;price:string;old?:string;updated:string;badge?:boolean;displayId?:string;stock?:string;flashSales?:ProductFlashSale[];priceCuts?:ProductPriceCut[];groupDeals?:ProductGroupDeal[]};
const images:Record<string,string>={'shop-0':top,'shop-1':pants,'shop-2':bag,'shop-3':bra,'shop-4':glasses,'showcase-0':blazer};

export default function PreliveProductList({items,checked,setChecked,disabled,update,remove,move,renderPicker,onFlashSaleConfirm}:{items:AddedItem[];checked:string[];setChecked:React.Dispatch<React.SetStateAction<string[]>>;disabled:boolean;update:(item:AddedItem)=>void;remove:(id:string)=>void;move:(id:string,target:number)=>void;renderPicker:ProductPickerRenderer;onFlashSaleConfirm:(products:AddedItem[])=>void}){
 const [menu,setMenu]=useState<string|null>(null),[draft,setDraft]=useState<AddedItem|null>(null),[deleting,setDeleting]=useState<AddedItem|null>(null);
 const [expanded,setExpanded]=useState<Record<string,boolean>>({});
 const toggleSale=(id:string)=>setExpanded(s=>({...s,[id]:!s[id]}));
 const moving=useRef<string|null>(null),modal=useRef<HTMLElement>(null);
 const [editingSale,setEditingSale]=useState<{product:AddedItem;sale:ProductFlashSale}|null>(null);
 const [editingCut,setEditingCut]=useState<{product:AddedItem;cut:ProductPriceCut}|null>(null);
 const [editingGroup,setEditingGroup]=useState<{product:AddedItem;deal:ProductGroupDeal}|null>(null);
 const hasPromotions=(item:AddedItem)=>Boolean(item.flashSales?.length||item.priceCuts?.length||item.groupDeals?.length);
 const saleReturnFocus=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{const active=new Set(items.filter(hasPromotions).map(item=>item.id));setExpanded(old=>Object.keys(old).some(id=>!active.has(id))?Object.fromEntries(Object.entries(old).filter(([id])=>active.has(id))):old)},[items]);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!(e.target as Element).closest('.prelive-row-more'))setMenu(null)};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(null);setDraft(null);setDeleting(null)}};document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)}},[]);
 useEffect(()=>{if(disabled){setMenu(null);setDraft(null);setDeleting(null);setEditingSale(null);setEditingCut(null);setEditingGroup(null)}},[disabled]);
 useEffect(()=>{if(!draft&&!deleting)return;const previous=document.activeElement as HTMLElement;const first=modal.current?.querySelector<HTMLElement>('input,button');first?.focus();const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const list=[...modal.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')];if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0]?.focus()}};document.addEventListener('keydown',trap);return()=>{document.removeEventListener('keydown',trap);previous?.focus()}},[!!draft,!!deleting]);
 const edit=(item:AddedItem)=>{setMenu(null);setDraft({...item,stock:item.stock||'100k'})};
 return <><div className="prelive-added-list">{items.map((item,k)=><article key={item.id} className={`prelive-reference-card${hasPromotions(item)?' has-flash-sales':''}${hasPromotions(item)&&expanded[item.id]?' is-expanded':''}`} data-added-product={item.id} onDragOver={e=>{if(!disabled&&moving.current)e.preventDefault()}} onDrop={e=>{e.preventDefault();if(moving.current&&!disabled)move(moving.current,k);moving.current=null}}>
  {hasPromotions(item)&&<button type="button" className="prelive-card-promotion-toggle" aria-label={`Toggle promotions for added product ${k+1}`} aria-expanded={!!expanded[item.id]} disabled={disabled} onClick={()=>toggleSale(item.id)}/>}
  <div className="prelive-added-rank"><span>{k+1}</span><button type="button" aria-label={`Reorder added product ${k+1}`} disabled={disabled} draggable={!disabled} onDragStart={e=>{moving.current=item.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',item.id)}} onDragEnd={()=>moving.current=null} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();move(item.id,Math.max(0,Math.min(items.length-1,k+(e.key==='ArrowUp'?-1:1))))}}}><img src={reorderIcon} alt=""/></button></div>
  <label className="prelive-added-thumbnail"><img src={images[item.id]||item.image} alt={item.name}/><input type="checkbox" aria-label={`Select added ${item.name}`} disabled={disabled} checked={checked.includes(item.id)} onChange={()=>setChecked(s=>s.includes(item.id)?s.filter(id=>id!==item.id):[...s,item.id])}/></label>
  <div className="prelive-added-info"><p title={item.name}>{item.name}</p><small>Stocks: {item.stock||'100k'}</small><div className="prelive-added-price"><strong>${item.price}</strong>{item.old&&<del>${item.old}</del>}</div></div>
  <div className="prelive-added-actions"><div className="prelive-row-promotion"><ProductPromo product={{...item,image:images[item.id]||item.image}} index={k+1} disabled={disabled} renderPicker={renderPicker} onConfirm={onFlashSaleConfirm}/></div><button type="button" className="prelive-row-edit" aria-label={`Edit added product ${k+1}`} disabled={disabled} onClick={()=>edit(item)}><img src={editIcon} alt=""/></button><div className="prelive-row-more"><button type="button" aria-label={`More actions for added product ${k+1}`} disabled={disabled} aria-haspopup="menu" aria-expanded={menu===item.id} onClick={()=>setMenu(menu===item.id?null:item.id)}><img src={moreIcon} alt=""/></button>{menu===item.id&&<div className="prelive-added-menu" role="menu" aria-label={`Actions for added product ${k+1}`}>{k>0&&<button type="button" role="menuitem" onClick={()=>{setMenu(null);move(item.id,0)}}>Move to top</button>}<button type="button" role="menuitem" onClick={()=>{setMenu(null);setDeleting(item)}}>Delete</button></div>}</div></div>
 {hasPromotions(item)&&<PreliveFlashSales sales={item.flashSales||[]} cuts={item.priceCuts||[]} deals={item.groupDeals||[]} onEditGroup={(deal,button)=>{saleReturnFocus.current=button;setEditingGroup({product:{...item,image:images[item.id]||item.image},deal})}} onDeleteGroup={deal=>update({...item,groupDeals:item.groupDeals!.filter(g=>g.id!==deal.id)})} onEditCut={(cut,button)=>{saleReturnFocus.current=button;setEditingCut({product:{...item,image:images[item.id]||item.image},cut})}} onDeleteCut={cut=>update({...item,priceCuts:item.priceCuts!.filter(p=>p.id!==cut.id)})} expanded={!!expanded[item.id]} onToggle={()=>toggleSale(item.id)} index={k+1} disabled={disabled} onEdit={(sale,button)=>{saleReturnFocus.current=button;setEditingSale({product:{...item,image:images[item.id]||item.image},sale})}} onDelete={sale=>update({...item,flashSales:item.flashSales!.filter(p=>p.id!==sale.id)})}/>}
 </article>)}{!items.length&&<p className="prelive-added-no-results">No products found</p>}</div>
 {editingSale&&<FlashSaleDrawer product={editingSale.product} initialSale={editingSale.sale} returnFocus={saleReturnFocus} renderPicker={renderPicker} onConfirm={onFlashSaleConfirm} close={()=>setEditingSale(null)}/>}
 {editingCut&&<PriceCutDrawer product={editingCut.product} initialCut={editingCut.cut} returnFocus={saleReturnFocus} renderPicker={renderPicker} onConfirm={onFlashSaleConfirm} close={()=>setEditingCut(null)}/>}
 {editingGroup&&<GroupDealDrawer product={editingGroup.product} initialDeal={editingGroup.deal} returnFocus={saleReturnFocus} renderPicker={renderPicker} onConfirm={onFlashSaleConfirm} close={()=>setEditingGroup(null)}/>}
 {(draft||deleting)&&createPortal(<div className="reference-product-modal prelive-added-modal" onPointerDown={e=>{if(e.target===e.currentTarget){setDraft(null);setDeleting(null)}}}><section ref={modal} role="dialog" aria-modal="true" aria-label={draft?'Edit product':'Delete product'}>{draft?<><header><h2>Edit product</h2><button type="button" aria-label="Close product editor" onClick={()=>setDraft(null)}><X size={18}/></button></header><label>Product name<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Price<input value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})}/></label><label>In stock<input value={draft.stock} onChange={e=>setDraft({...draft,stock:e.target.value})}/></label><footer><button type="button" onClick={()=>setDraft(null)}>Cancel</button><button type="button" disabled={!draft.name.trim()||!draft.price.trim()} onClick={()=>{update(draft);setDraft(null)}}>Save product</button></footer></>:<><h2>Delete product?</h2><p>This removes the product from this prototype’s list.</p><footer><button type="button" onClick={()=>setDeleting(null)}>Cancel</button><button type="button" onClick={()=>{remove(deleting!.id);setDeleting(null)}}>Delete</button></footer></>}</section></div>,document.body)}
 </>;
}
