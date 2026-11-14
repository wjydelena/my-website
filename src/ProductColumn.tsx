import React, { useEffect, useRef, useState } from 'react';
import { GripVertical, PencilLine, Trash2, ArrowUpToLine, X, Search, MoreHorizontal, Plus } from 'lucide-react';
import PinIcon from './PinIcon';
import SellingModes, { CouponEntry } from './SellingModes';
import './selling-modes.css';
import ProductPromotions from './ProductPromotions';
import './product-promotions.css';
import PromotionTools from './PromotionTools';
import { useConsoleLayout } from './ResizableLayout';
import { ModuleTitle, RemovePanelButton } from './LayoutEditor';
import { useModuleHeader } from './ModuleDrag';
import { usePrompter } from './PrompterContext';
import top from './assets/reference-products/product-1.png';
import yellowBag from './assets/reference-products/product-2.png';
import redBag from './assets/reference-products/product-3.png';
import heel from './assets/reference-products/product-4.png';
import blazer from './assets/reference-products/product-5.png';
import filterIcon from './assets/annotation-filter.png';
import pants from './assets/reference-products/promotion-pants.png';
import sweater from './assets/reference-products/promotion-sweater.png';
import cosmetics from './assets/reference-products/promotion-cosmetics.png';

type Product = { id: number; image: string; name: string; price: string; stock: string; oldPrice?: string };
const defaults: Product[] = [top,pants,yellowBag,redBag,blazer,sweater,cosmetics].map((image,index) => ({id:index+1,image,name:"Skechers Men's Classic Fit Delsx Fit Delson Fit Skechers Men's Shoes",price:['100.00','40.00','60.00-80.00','60.00-80.00','69.99','100.00','100.00'][index],stock:'200',oldPrice:index===0||index===3?'150.00':undefined}));
export default function ProductColumn() {
  const { editing, moduleStyle } = useConsoleLayout();
  const drag = useModuleHeader('products');
  const [products, setProducts] = useState(defaults);
  const [checked, setChecked] = useState<number[]>([]);
  const {pinned,setPinned,setProducts:setPrompterProducts}=usePrompter();
  useEffect(()=>setPrompterProducts(products),[products,setPrompterProducts]);
  const [tab, setTab] = useState('Buy now');
  const [couponRequest, setCouponRequest] = useState(0);
  const couponEntry = useRef<HTMLButtonElement>(null);
  const [listPinned, setListPinned] = useState(false);
  const [draft, setDraft] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All products');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [actionsFor, setActionsFor] = useState<number | null>(null);
  useEffect(()=>{ if(editing){setActionsFor(null);setFiltersOpen(false);} },[editing]);
  useEffect(()=>{
    if(actionsFor===null)return;
    const close=(event:PointerEvent)=>{if(!(event.target as Element).closest('.reference-product-actions'))setActionsFor(null);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setActionsFor(null);};
    document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};
  },[actionsFor]);
  const moving = useRef<number | null>(null);
  const visible = products.filter(p => (!query.trim() || `${p.id} ${p.name}`.toLowerCase().includes(query.trim().toLowerCase())) && (filter==='All products' || (filter==='Pinned products'?pinned===p.id:checked.includes(p.id))));
  const all = visible.length > 0 && visible.every(p => checked.includes(p.id));
  const some = visible.some(p => checked.includes(p.id));
  const toggle = (id: number) => setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev,id]);
  const moveTo = (id: number, target: number) => setProducts(prev => {
    const source = prev.find(p => p.id === id); if(!source) return prev;
    const next = prev.filter(p => p.id !== id); next.splice(target,0,source); return next;
  });
  const save = () => { if(!draft || !draft.name.trim()) return; setProducts(prev => prev.some(p=>p.id===draft.id) ? prev.map(p=>p.id===draft.id?draft:p) : [...prev,draft]);setDraft(null); };
  return <section className="product-column reference-product-column" data-module-id="products" style={moduleStyle('products')}>
    {editing && <div className="editing-products-heading" {...drag}><ModuleTitle>Products</ModuleTitle><RemovePanelButton id="products"/></div>}
    <div className="reference-product-controls">
      <div className="reference-product-tabs" role="tablist" aria-label="Product selling mode">{['Buy now','Auction','Gift & rewards','Item sold'].map(value=><button type="button" role="tab" key={value} aria-selected={tab===value} onClick={()=>setTab(value)}>{value}</button>)}</div>
      <div className="reference-product-toolbar" style={tab==='Buy now'?undefined:{display:'none'}}>
        <label className="reference-select-all"><input type="checkbox" aria-label="Select all products" checked={all} disabled={editing || !visible.length} ref={el=>{if(el)el.indeterminate=!all&&some;}} onChange={()=>setChecked(prev=>all?prev.filter(id=>!visible.some(p=>p.id===id)):[...new Set([...prev,...visible.map(p=>p.id)])])}/>All</label>
        <div className="reference-product-search"><input type="search" aria-label="Search product ID or name" placeholder="Search product ID or name" value={query} disabled={editing} onChange={e=>setQuery(e.target.value)}/>{query?<button type="button" aria-label="Clear product search" disabled={editing} onClick={()=>setQuery('')}><X size={16}/></button>:<Search size={16} aria-hidden="true"/>}</div>
        <div className="reference-product-filter"><button type="button" className="reference-product-filter-trigger" data-active={filter!=='All products'} aria-label="Product filters" aria-haspopup="menu" aria-expanded={filtersOpen} disabled={editing} onClick={()=>setFiltersOpen(!filtersOpen)}><img className="annotation-console-icon" src={filterIcon} width={16} height={16} alt=""/></button>
          {filtersOpen&&<><button type="button" className="reference-product-filter-dismiss" aria-label="Close product filters" onClick={()=>setFiltersOpen(false)}/><div className="reference-product-filter-menu" role="menu" aria-label="Product filters" onKeyDown={e=>{if(e.key==='Escape'){setFiltersOpen(false);e.stopPropagation();}}}>{['All products','Pinned products','Selected products'].map(value=><button type="button" role="menuitemradio" key={value} aria-checked={filter===value} onClick={()=>{setFilter(value);setFiltersOpen(false);}}>{value}</button>)}</div></>}
        </div>
        <CouponEntry disabled={editing} buttonRef={couponEntry} onClick={()=>setCouponRequest(value=>value+1)}/>
      </div>
    </div>
    <SellingModes mode={tab} disabled={editing} onCoupon={()=>setCouponRequest(value=>value+1)} couponRef={couponEntry}/>
    <div className="reference-products" role="tabpanel" aria-label="Buy now" style={tab==='Buy now'?undefined:{display:'none'}}>
      {visible.map(product=>{const index=products.indexOf(product);const hasPromotions=product.id===3;return <article className={`reference-product-card promotion-product-card${hasPromotions?' has-promotions':''}${hasPromotions&&expanded?' is-expanded':''}${pinned===product.id?' is-pinned':''}`} key={product.id} data-product-id={product.id} onDragOver={event=>{if(moving.current!==null&&!editing)event.preventDefault();}} onDrop={event=>{event.preventDefault();if(moving.current!==null&&!editing){moveTo(moving.current,index);moving.current=null;}}}>
        {hasPromotions&&<button type="button" className="product-card-promotion-toggle" aria-label="Toggle promotions for product 3" aria-expanded={expanded} aria-controls="product-3-promotions" disabled={editing} onClick={()=>setExpanded(!expanded)}/>}
        <div className="reference-product-main">
          <div className="reference-product-top">
            <div className="reference-product-rank"><span>{index+1}</span><button type="button" aria-label={`Reorder product ${product.id}`} disabled={editing} draggable={!editing} onDragStart={event=>{moving.current=product.id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',String(product.id));}} onDragEnd={()=>{moving.current=null;}} onKeyDown={event=>{if(['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();moveTo(product.id,Math.max(0,Math.min(products.length-1,index+(event.key==='ArrowUp'?-1:1))));}}}><GripVertical size={16}/></button></div>
            <div className="reference-product-thumb"><img src={product.image} alt={['Green knit top','Beige pants','Yellow handbag','Red handbag','Blue blazer','Beige sweater','Cosmetics'][(product.id-1)%7]}/><input type="checkbox" checked={checked.includes(product.id)} disabled={editing} aria-label={`Select product ${product.id}`} onChange={()=>toggle(product.id)}/></div>
            <div className="reference-product-info"><p className="reference-product-name">{product.name}</p><span className="reference-product-stock">Stocks: {product.stock}</span><div className="product-price-line"><strong className="reference-product-price">${product.price}</strong>{product.oldPrice&&<del>${product.oldPrice}</del>}</div></div>
          </div>
          <button type="button" className="reference-product-pin" aria-label={`${pinned===product.id?'Unpin':'Pin'} product ${product.id}`} aria-pressed={pinned===product.id} disabled={editing} onClick={()=>setPinned(pinned===product.id?null:product.id)}><PinIcon/>Pin</button>
          <div className="reference-product-stats"><span>Clicks <b>0</b></span><i/><span>Add to cart <b>0</b></span><i/><span>Items sold <b>0</b></span></div>
        </div>
        <div className="reference-product-actions"><button type="button" className="product-actions-trigger" aria-label={`More actions for product ${product.id}`} aria-haspopup="menu" aria-expanded={actionsFor===product.id} disabled={editing} onClick={()=>setActionsFor(actionsFor===product.id?null:product.id)}><MoreHorizontal size={18}/></button>{actionsFor===product.id&&<div className="product-actions-menu" role="menu" aria-label={`Actions for product ${product.id}`}><button type="button" role="menuitem" aria-label={`Edit product ${product.id}`} onClick={()=>{setActionsFor(null);setDraft({...product});}}><PencilLine size={16}/>Edit</button><button type="button" role="menuitem" aria-label={`Delete product ${product.id}`} onClick={()=>{setActionsFor(null);setDeleting(product);}}><Trash2 size={16}/>Delete</button><button type="button" role="menuitem" aria-label={`Move product ${product.id} to top`} onClick={()=>{setActionsFor(null);moveTo(product.id,0);}}><ArrowUpToLine size={16}/>Move to top</button></div>}</div>
        {pinned===product.id&&<div className="pinned-product-status"><PinIcon/>Pinned</div>}
        {hasPromotions&&<ProductPromotions expanded={expanded} onToggle={()=>setExpanded(!expanded)} disabled={editing}/>}
      </article>})}
      {!visible.length&&<div className="reference-products-empty" role="status">{products.length?<><p>No products found.</p><button type="button" onClick={()=>{setQuery('');setFilter('All products');}}>Clear search and filters</button></>:<p>No products yet. Add a product to get started.</p>}</div>}
    </div>
    <div className="product-footer reference-product-footer buy-now-footer" style={tab==='Buy now'?undefined:{display:'none'}}><PromotionTools compact createPromotion couponRequest={couponRequest} couponReturnFocus={couponEntry} listPinned={listPinned} onToggleListPin={()=>setListPinned(!listPinned)}/><button type="button" className="footer-pill buy-now-add" disabled={editing} onClick={()=>setDraft({...defaults[0],id:Math.max(0,...products.map(p=>p.id))+1})}><Plus size={16} color="#ffffff" aria-hidden="true"/>Add product</button></div>
    {draft&&<div className="reference-product-modal"><section role="dialog" aria-modal="true" aria-label="Edit product"><header><h2>{products.some(p=>p.id===draft.id)?'Edit product':'Add product'}</h2><button type="button" aria-label="Close product editor" onClick={()=>setDraft(null)}><X size={18}/></button></header><label>Product name<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Price<input value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})}/></label><label>In stock<input value={draft.stock} onChange={e=>setDraft({...draft,stock:e.target.value})}/></label><footer><button type="button" onClick={()=>setDraft(null)}>Cancel</button><button type="button" onClick={save}>Save product</button></footer></section></div>}
    {deleting&&<div className="reference-product-modal"><section role="dialog" aria-modal="true" aria-label="Delete product"><h2>Delete product?</h2><p>This removes the product from this prototype’s list.</p><footer><button type="button" onClick={()=>setDeleting(null)}>Cancel</button><button type="button" onClick={()=>{setProducts(prev=>prev.filter(p=>p.id!==deleting.id));setChecked(prev=>prev.filter(id=>id!==deleting.id));setDeleting(null);}}>Delete</button></footer></section></div>}
  </section>;
}
