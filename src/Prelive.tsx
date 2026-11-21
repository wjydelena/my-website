import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Search,X,ChevronDown,Plus,Send,Globe,Settings} from 'lucide-react';
import {useConsoleLayout,ResizeHandle} from './ResizableLayout';
import {useModuleHeader} from './ModuleDrag';
import {ModuleTitle,RemovePanelButton} from './LayoutEditor';
import SellingModes from './SellingModes';
import couponLabelFill from './assets/prelive/coupon-label-fill.png';
import PromotionTools from './PromotionTools';
import PreliveProductList,{type AddedItem} from './PreliveProductList';
import basket from './assets/prelive/basket.png';
import addIcon from './assets/prelive/add.png';
import copyIcon from './assets/prelive/copy.png';
import arrow from './assets/prelive/arrow.png';
import smart from './assets/prelive/smart.png';
import billboard from './assets/prelive/billboard.png';
import dashboard from './assets/prelive/dashboard.png';
import messages from './assets/prelive/messages.png';
import filter from './assets/annotation-filter.png';
import collapse from './assets/video-collapse.png';
import shop0 from './assets/prelive/shop-0.png';
import shop1 from './assets/prelive/shop-1.png';
import shop2 from './assets/prelive/shop-2.png';
import shop3 from './assets/prelive/shop-3.png';
import shop4 from './assets/prelive/shop-4.png';
import show0 from './assets/prelive/showcase-0.png';
import show1 from './assets/prelive/showcase-1.png';
import show2 from './assets/prelive/showcase-2.png';
import show3 from './assets/prelive/showcase-3.png';
import './prelive.css';

import { PRODUCT_PRICE } from './product-pricing';
import PriceCutDrawer from './PriceCutDrawer';
type Item=AddedItem;
const idText='23324124341232332';
const shop:Item[]=[
 {id:'shop-0',name:'Classic Red Satin Lipstick bun...',image:shop0,sku:'Green',price:PRODUCT_PRICE,updated:'5'},
 {id:'shop-1',name:'Silver Beaded Hoop Earrings',image:shop1,sku:'10 variants',price:PRODUCT_PRICE,old:PRODUCT_PRICE,updated:'100k'},
 {id:'shop-2',name:'Soft-Blending Makeup Sponge...',image:shop2,sku:'Yellow',price:PRODUCT_PRICE,updated:'100k'},
 {id:'shop-3',name:'Black Wireless Support Bra',image:shop3,sku:'10 variants',price:PRODUCT_PRICE,updated:'100k'},
 {id:'shop-4',name:'Retro Tortoiseshell Sunglasses...',image:shop4,sku:'Women',price:PRODUCT_PRICE,updated:'100k'}];
const showcase:Item[]=[
 {id:'showcase-0',name:'Light Blue Double-Breasted Bl...',image:show0,sku:'10 variants',price:PRODUCT_PRICE,old:PRODUCT_PRICE,updated:'100k'},
 {id:'showcase-1',name:'Classic Gray Everyday Backpack',image:show1,sku:'Variants',price:PRODUCT_PRICE,old:PRODUCT_PRICE,updated:'100k'},
 {id:'showcase-2',name:'Golden Bloom Eau de Parfum',image:show2,sku:'Variants',price:PRODUCT_PRICE,updated:'100k'},
 {id:'showcase-3',name:'Blue & Navy Retro Sneakers',image:show3,sku:'Variants',price:PRODUCT_PRICE,updated:'100k',badge:true}];

function ProductPicker({close,commit,existing,initialTab='My shop'}:{close:()=>void;commit:(rows:Item[])=>void;existing:Item[];initialTab?:string}){
 const [tab,setTab]=useState(initialTab);const [selected,setSelected]=useState<string[]>([]);const [query,setQuery]=useState('');
 const dialog=useRef<HTMLDivElement>(null);const first=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const restore=document.activeElement as HTMLElement;first.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const els=[...dialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled)')];if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0]?.focus();}}};document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);restore?.focus();};},[]);
 const rows=(tab==='My shop'?shop:showcase).filter(i=>(!query||`${i.name} ${idText}`.toLowerCase().includes(query.toLowerCase())));
 const selectable=rows.filter(i=>!existing.some(e=>e.id===i.id));const all=selectable.length>0&&selectable.every(i=>selected.includes(i.id));const some=selectable.some(i=>selected.includes(i.id));
 const toggle=(id:string)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 return createPortal(<div className="prelive-picker-shade" onPointerDown={e=>{if(e.target===e.currentTarget)close();}}><div className="prelive-picker" ref={dialog} role="dialog" aria-modal="true" aria-label="Add products">
  <header><h2>Add products</h2><button type="button" ref={first} aria-label="Close Add products" onClick={close}><X size={18}/></button></header>
  <div className="prelive-picker-tabs" role="tablist" aria-label="Product source">{['My shop','Showcase products','LIVE product set','Product URL'].map(name=><button type="button" role="tab" aria-selected={tab===name} disabled={name==='LIVE product set'||name==='Product URL'} key={name} onClick={()=>{setTab(name);setQuery('');}}>{name}</button>)}</div>
  <div className="prelive-picker-filters"><label className="picker-search"><input type="search" aria-label="Search products to add" placeholder="Search product ID or name" value={query} onChange={e=>setQuery(e.target.value)}/><Search size={18}/></label><label><select aria-label="Price" disabled title="Filter options are not included in this demo"><option>Price</option></select><ChevronDown size={16}/></label><label><select aria-label="Category" disabled title="Filter options are not included in this demo"><option>Category</option></select><ChevronDown size={16}/></label><button type="button" aria-label="More product filters" disabled title="Filter options are not included in this demo"><img src={filter} alt=""/></button><button type="button" onClick={()=>setQuery('')}>Reset</button></div>
  <div className="prelive-picker-scroll"><table className="prelive-picker-table"><colgroup><col className="check-col"/><col className="product-col"/><col className="sku-col"/><col className="stock-col"/><col className="price-col"/><col className="updated-col"/></colgroup><thead><tr><th><input type="checkbox" aria-label="Select all available products" checked={all} ref={el=>{if(el)el.indeterminate=some&&!all;}} onChange={()=>setSelected(s=>all?s.filter(id=>!selectable.some(i=>i.id===id)):[...new Set([...s,...selectable.map(i=>i.id)])])}/></th><th>Product</th><th>SKU</th><th>Stock</th><th>Price</th><th>Updated</th></tr></thead><tbody>{rows.map(i=><tr key={i.id} data-picker-product={i.id}><td><input type="checkbox" aria-label={`Select ${i.name}`} checked={selected.includes(i.id)||existing.some(e=>e.id===i.id)} disabled={existing.some(e=>e.id===i.id)} onChange={()=>toggle(i.id)}/></td><td><label className="picker-product-info"><img src={i.image} alt=""/><span><span className="picker-product-name">{i.name}{i.badge&&<b>ID</b>}</span>{!i.badge&&<span className="picker-product-id">ID: {idText}</span>}</span></label></td><td>{i.sku}</td><td>100k</td><td><span>$ {i.price}</span>{i.old&&<del>${i.old}</del>}</td><td>{i.updated}</td></tr>)}</tbody></table>{!rows.length&&<p className="picker-no-results">No products found</p>}</div>
  <footer><button type="button" onClick={close}>Cancel</button><button type="button" className="picker-add" aria-label="Add selected products" onClick={()=>{if(!selected.length)return;commit([...shop,...showcase].filter(i=>selected.includes(i.id)));close();}}>Add products</button></footer>
 </div></div>,document.body);
}

export function PreliveProducts({onProductsChange}:{onProductsChange:(products:any[])=>void}){
 const {editing,moduleStyle}=useConsoleLayout();const drag=useModuleHeader('products');const [tab,setTab]=useState('Buy now');const [picker,setPicker]=useState(false);const [initialTab,setInitialTab]=useState('My shop');const [products,setProducts]=useState<Item[]>([]);const [checked,setChecked]=useState<string[]>([]);const [query,setQuery]=useState('');const [coupon,setCoupon]=useState(0);const couponRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>onProductsChange(products.map((i,k)=>({id:k+100,image:i.image,name:i.name,price:i.price,stock:i.stock||'100k',oldPrice:i.old,flashSales:i.flashSales,priceCuts:i.priceCuts,groupDeals:i.groupDeals}))),[products,onProductsChange]);
 const [footerCut,setFooterCut]=useState(false);const footerCutRef=useRef<HTMLButtonElement>(null);
 const savePromotions=rows=>setProducts(previous=>{const next=previous.map(item=>{const incoming=rows.find(row=>row.id===item.id);return incoming?{...item,flashSales:[...new Map([...(item.flashSales||[]),...(incoming.flashSales||[])].map(sale=>[sale.id,sale])).values()],priceCuts:[...new Map([...(item.priceCuts||[]),...(incoming.priceCuts||[])].map(cut=>[cut.id,cut])).values()],groupDeals:[...new Map([...(item.groupDeals||[]),...(incoming.groupDeals||[])].map(deal=>[deal.id,deal])).values()]}:item});return [...next,...rows.filter(row=>!previous.some(item=>item.id===row.id))]});
 const open=()=>{setInitialTab('My shop');setPicker(true);};const visible=products.filter(i=>i.name.toLowerCase().includes(query.toLowerCase()));
 return <section className={`product-column reference-product-column prelive-products${products.length?' has-added-products':''}`} data-module-id="products" style={moduleStyle('products')}>
 {editing&&<div className="editing-products-heading" {...drag}><ModuleTitle>Products</ModuleTitle><RemovePanelButton id="products"/></div>}
 <div className="reference-product-controls"><div className="reference-product-tabs" role="tablist" aria-label="Product selling mode">{['Buy now','Auction','Gift & rewards','Item sold'].map(n=><button type="button" role="tab" key={n} aria-selected={tab===n} onClick={()=>setTab(n)}>{n}</button>)}</div>{tab==='Buy now'&&<div className="reference-product-toolbar"><label className="reference-select-all"><input type="checkbox" aria-label="Select all products" checked={!!visible.length&&visible.every(i=>checked.includes(i.id))} disabled={!visible.length||editing} onChange={e=>setChecked(e.target.checked?visible.map(i=>i.id):[])}/>All</label><div className="reference-product-search"><input type="search" aria-label="Search product ID or name" placeholder="Search product ID or name" value={query} onChange={e=>setQuery(e.target.value)}/><Search size={16}/></div><button type="button" className="prelive-filter" aria-label="Product filters" disabled title="Filter options are not included in this demo"><img src={filter} alt=""/></button><div className="coupon-entry-wrap"><i/><div className="coupon-entry prelive-coupon-static"><img src={couponLabelFill} alt="Coupon" width={18} height={18}/>{products.length>0&&<b className="prelive-coupon-count">3</b>}</div></div></div>}</div>
 {tab==='Buy now'?<div className="prelive-product-body">{!products.length?<div className="prelive-buy-empty"><img className="prelive-basket" src={basket} alt=""/><h3>Add buy-now products</h3><p>Added products will appear here</p><div className="prelive-empty-actions"><button type="button" onClick={open}><span><img src={addIcon} alt=""/></span>Add products<img className="prelive-arrow" src={arrow} alt=""/></button><button type="button" disabled title="Not included in this demo"><span><img src={copyIcon} alt=""/></span>Copy from previous LIVE<img className="prelive-arrow" src={arrow} alt=""/></button></div></div>:<PreliveProductList renderPicker={(existing,close,commit)=><ProductPicker existing={existing} close={close} commit={commit}/>} items={visible} checked={checked} setChecked={setChecked} disabled={editing} update={item=>setProducts(p=>p.map(i=>i.id===item.id?item:i))} remove={id=>{setProducts(p=>p.filter(i=>i.id!==id));setChecked(p=>p.filter(i=>i!==id))}} onFlashSaleConfirm={savePromotions} move={(id,target)=>setProducts(p=>{const from=p.findIndex(i=>i.id===id),to=p.findIndex(i=>i.id===visible[target]?.id);if(from<0||to<0)return p;const next=[...p],item=next.splice(from,1)[0];next.splice(to,0,item);return next})}/>}</div>:<SellingModes mode={tab} disabled={editing} onCoupon={()=>setCoupon(c=>c+1)} couponRef={couponRef}/>}
 {tab==='Buy now'&&<div className="product-footer reference-product-footer buy-now-footer prelive-product-footer"><PromotionTools compact createPromotion couponRequest={coupon} couponReturnFocus={couponRef} onCreatePriceCut={()=>{footerCutRef.current=document.querySelector<HTMLButtonElement>('.prelive-product-footer [aria-label="Create promotion"]');setFooterCut(true)}}/><button type="button" className="footer-pill buy-now-add" aria-label="Add product" disabled={editing} onClick={open}><Plus size={16}/>Add product</button></div>}
 {footerCut&&<PriceCutDrawer initialProducts={products} returnFocus={footerCutRef} close={()=>setFooterCut(false)} renderPicker={(existing,close,commit)=><ProductPicker existing={existing} close={close} commit={commit}/>} onConfirm={savePromotions}/>}
 {picker&&<ProductPicker existing={products} initialTab={initialTab} close={()=>setPicker(false)} commit={rows=>setProducts(p=>[...p,...rows.filter(i=>!p.some(x=>x.id===i.id))])}/>}
 </section>;
}

export function PreliveMiddle({goLive}:{goLive:()=>void}){
 const {editing,moduleStyle}=useConsoleLayout();const videoDrag=useModuleHeader('video');const chatDrag=useModuleHeader('chat');const [options,setOptions]=useState(false);
 return <section className="live-column prelive-middle"><div className="video-preview prelive-video" data-module-id="video" style={moduleStyle('video')}><div className="prelive-no-video">No video</div>{editing?<div className="video-edit-label" {...videoDrag}><ModuleTitle>Video</ModuleTitle><RemovePanelButton id="video"/></div>:<img className="prelive-video-collapse" src={collapse} alt=""/>}<div className="prelive-live-buttons"><button type="button" onClick={goLive}>Go LIVE now</button><button type="button" onClick={goLive}>Practice</button></div><ResizeHandle kind="video" label="Resize live preview and chat"/></div><div className="chat reference-chat prelive-chat" data-module-id="chat" style={moduleStyle('chat')}><div className="chat-title" {...chatDrag}><ModuleTitle>Chat</ModuleTitle><RemovePanelButton id="chat"/><button type="button" aria-label="Chat filters" onClick={()=>setOptions(!options)}><img src={filter} alt=""/></button><button type="button" aria-label="Chat settings" onClick={()=>setOptions(!options)}><Settings size={16}/></button></div>{options&&<div className="reference-chat-options">Viewer comments will appear here during your LIVE.</div>}<div className="prelive-chat-empty">Viewer comments will appear here during your LIVE.</div><form className="comment-box" onSubmit={e=>e.preventDefault()}><input placeholder="Enter comment" aria-label="Enter comment" disabled/><span className="comment-count">0/100</span><button type="submit" aria-label="Send comment" disabled><Send size={19}/></button></form></div></section>;
}
export function PreliveRight(){
 const {editing,moduleStyle,toolsExpanded,toggleTools}=useConsoleLayout();const toolsDrag=useModuleHeader('tools'),analyticsDrag=useModuleHeader('analytics'),activityDrag=useModuleHeader('activity');const [tab,setTab]=useState('Activity');
 return <section className="analytics-column prelive-right"><section className="live-tools-section is-expanded" data-module-id="tools" style={moduleStyle('tools')}><header {...toolsDrag}><ModuleTitle><button type="button" onClick={toggleTools}>LIVE tools</button></ModuleTitle><RemovePanelButton id="tools"/><button type="button" className="live-tools-collapse" aria-label="Collapse LIVE tools" onClick={toggleTools}><img src={collapse} alt=""/></button></header>{toolsExpanded&&<div className="live-tool-cards">{[['Billboard',billboard],['Smart reply',smart],['Auto-post messages',messages]].map(([n,img])=><button type="button" key={n} disabled><img src={img} alt=""/><span>{n}</span></button>)}</div>}<ResizeHandle kind="tools" label="Resize LIVE tools and Analytics"/></section><div className="analytics" data-module-id="analytics" style={moduleStyle('analytics')}><div className="analytics-content-scroll"><div className="analytics-section"><div className="analytics-title" {...analyticsDrag}><ModuleTitle>Analytics</ModuleTitle><RemovePanelButton id="analytics"/><span>LIVE Dashboard<img className="prelive-dashboard-icon" src={dashboard} alt=""/></span></div><div className="metric-grid">{['GMV','Current viewers','Impressions','Enter room rate','Avg. duration','Product clicks'].map(n=><div className="metric" key={n}><strong>--</strong><span>{n}</span></div>)}</div></div></div><ResizeHandle kind="analytics" label="Resize analytics and activity"/></div><div className="activity-module" data-module-id="activity" style={moduleStyle('activity')}><div className="activity-tabs tabs" {...activityDrag}>{['Activity','Top customer'].map(n=><button type="button" role="tab" key={n} className={tab===n?'active':''} aria-selected={tab===n} onClick={()=>setTab(n)}>{n}</button>)}<RemovePanelButton id="activity"/><button type="button" className="activity-filter" aria-label="Activity filters" disabled><img src={filter} alt=""/></button></div><div className="prelive-purchase-empty">Orders placed during your LIVE will show up here</div><div className="prelive-activity-empty">Viewer activities will appear here during your LIVE.</div></div></section>;
}
