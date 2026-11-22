import {nextPromotionCreation} from './promotion-creation-order';
import ProductIdentity from './ProductIdentity';
import FlashSaleBatchModal from './FlashSaleBatchModal';
import CustomerLimitEditor from './CustomerLimitEditor';
import RequiredMark from './RequiredMark';
import {hasManualFlashSale} from './promotion-eligibility';
import {stockOf,purchaseLimitError} from './promotion-validation';
import FlashSaleStart,{MANUAL_START,SCHEDULED_START,localDate,scheduleError} from './FlashSaleStart';
import PromotionWizardSteps,{type PromotionWizardConfig} from './PromotionWizardSteps';
import './promotion-wizard.css';
import { PRODUCT_PRICE } from './product-pricing';
import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ChevronDown,Plus} from 'lucide-react';
import type {AddedItem} from './PreliveProductList';
import type {ProductPickerRenderer} from './ProductPromo';
import helpIcon from './assets/flash-sale/help.png';
import closeIcon from './assets/flash-sale/close.png';

const stockNumber=stockOf;
const Help=()=> <img className="fs-help" src={helpIcon} width={16} height={16} alt=""/>;
type Values={deal:string;total:string;customer:string};
import type {ProductFlashSale} from './flash-sale-types';

export default function FlashSaleDrawer({product,close,returnFocus,renderPicker,onConfirm,initialSale,initialProducts,wizard}:{product?:AddedItem;initialProducts?:AddedItem[];wizard?:PromotionWizardConfig;close:()=>void;returnFocus:React.RefObject<HTMLButtonElement>;renderPicker:ProductPickerRenderer;onConfirm:(products:AddedItem[])=>void;initialSale?:ProductFlashSale}){
 const drawerTitle=`${initialSale?'Edit':'Create'} Flash Sale`;
 const [batchOpen,setBatchOpen]=useState(false),[products,setProducts]=useState(initialProducts||(product?[product]:[])),[selected,setSelected]=useState<string[]>([]),[values,setValues]=useState<Record<string,Values>>(()=>initialSale&&product?{[product.id]:{deal:initialSale.price,total:initialSale.total,customer:initialSale.customer}}:{}),[level,setLevel]=useState(initialSale?.level||'Product-level'),[recurring,setRecurring]=useState(initialSale?.recurring||false),[picker,setPicker]=useState(false),[batch,setBatch]=useState<keyof Values|null>(null),[start,setStart]=useState(initialSale?.start==='Start at a specified time'?SCHEDULED_START:(initialSale?initialSale.start||MANUAL_START:'')),[startDate,setStartDate]=useState(initialSale?.startDate||localDate(new Date())),[startTime,setStartTime]=useState(initialSale?.startTime||''),[scheduleSubmitted,setScheduleSubmitted]=useState(false),[countdown,setCountdown]=useState(initialSale?.countdown??'10'),[durationMinutes,setDurationMinutes]=useState(()=>initialSale?(initialSale.duration===''?'':String(Number(initialSale.duration)/60)):'20');
 const dialog=useRef<HTMLDivElement>(null),closeButton=useRef<HTMLButtonElement>(null),addButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(wizard){setProducts(wizard.products);setSelected(old=>old.filter(id=>wizard.products.some(p=>p.id===id))) }},[wizard?.products]);
 useEffect(()=>{if(wizard&&!wizard.hidden)closeButton.current?.focus()},[wizard?.hidden]);
 useEffect(()=>{closeButton.current?.focus();return()=>returnFocus.current?.focus()},[]);
 useEffect(()=>{if(picker||batch||wizard?.hidden)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();if(batchOpen){setBatchOpen(false);requestAnimationFrame(()=>dialog.current?.querySelector<HTMLButtonElement>('.fs-batch-trigger')?.focus());return}close()}if(e.key==='Tab'){const all=[...dialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')];if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===all.at(-1)){e.preventDefault();all[0]?.focus()}}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[picker,close,batchOpen,batch,wizard?.hidden]);
 useEffect(()=>{if(!batchOpen)return;const outside=(e:PointerEvent)=>{if(!(e.target as Element).closest('.fs-batch'))setBatchOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[batchOpen]);
 useEffect(()=>{if(!selected.length)setBatch(null)},[selected.length]);
 const field=(id:string,key:keyof Values)=>values[id]?.[key]??(key==='deal'?PRODUCT_PRICE:'');
 const batchFocus=useRef<HTMLButtonElement>(null);
 const change=(id:string,key:keyof Values,value:string)=>setValues(previous=>({...previous,[id]:{deal:PRODUCT_PRICE,total:'',customer:'',...previous[id],[key]:value}}));
 const editBatch=(key:keyof Values)=>{setBatchOpen(false);setBatch(key)};
 const confirmBatch=(result:Record<string,string>)=>{if(!batch)return;const key=batch;setValues(previous=>{const next={...previous};for(const [id,value] of Object.entries(result))if(selected.includes(id)&&products.some(p=>p.id===id))next[id]={deal:PRODUCT_PRICE,total:'',customer:'',...next[id],[key]:value};return next});setBatch(null)};
 useEffect(()=>{dialog.current?.toggleAttribute('inert',!!batch);return()=>dialog.current?.removeAttribute('inert')},[batch]);
 const all=products.length>0&&products.every(p=>selected.includes(p.id));
 const manualBlockedProduct=products.find(item=>hasManualFlashSale(item,initialSale?.id));
 const manualConflict=start===MANUAL_START?manualBlockedProduct:undefined;
 const manualDisabledReason=manualBlockedProduct?"This product is already in a LIVE flash sale that's ready to start manually. Delete or use the existing LIVE flash sale or co-funded LIVE flash sale before creating a new one.":undefined;
 useEffect(()=>{if(manualConflict)setStart('')},[manualConflict?.id]);
 const changeStart=(value:string)=>{if(value===MANUAL_START&&manualBlockedProduct)return;setStart(value)};
 const totalError=(id:string)=>{const item=products.find(p=>p.id===id)!;return !field(id,'total').trim()?(scheduleSubmitted?'Enter a total purchase limit.':''):purchaseLimitError(field(id,'total'),stockOf(item),true)};
 const customerError=(id:string)=>purchaseLimitError(field(id,'customer'),stockOf(products.find(p=>p.id===id)!),false);
 const startError=scheduleSubmitted?(!start?'Select when to start.':manualConflict?manualDisabledReason!:start===SCHEDULED_START?scheduleError(startDate,startTime):''):'';
 const confirm=()=>{
  setScheduleSubmitted(true);
  const invalidProduct=products.find(item=>purchaseLimitError(field(item.id,'total'),stockOf(item),true)||purchaseLimitError(field(item.id,'customer'),stockOf(item),false));
  if(!start||invalidProduct||manualConflict||(start===SCHEDULED_START&&scheduleError(startDate,startTime))){
   if(!start)dialog.current?.querySelector<HTMLButtonElement>('.fs-start-select')?.focus();
   else if(invalidProduct){const key=purchaseLimitError(field(invalidProduct.id,'total'),stockOf(invalidProduct),true)?'total':'customer';dialog.current?.querySelector<HTMLElement>(`[data-flash-product="${invalidProduct.id}"] ${key==='customer'?'.fs-customer-label button':'[data-field="total"]'}`)?.focus()}
   return;
  }
  const id=initialSale?.id||crypto.randomUUID(),createdAt=initialSale?initialSale.createdAt:nextPromotionCreation();
  const duration=durationMinutes.trim()===''?'':String(Number(durationMinutes)*60);
  onConfirm(products.map(item=>({ ...item,flashSales:[...(item.flashSales||[]).filter(sale=>sale.id!==id),{id,createdAt,price:field(item.id,'deal').trim(),total:field(item.id,'total').trim(),customer:field(item.id,'customer').trim(),level,recurring,start,startDate:start===SCHEDULED_START?startDate:undefined,startTime:start===SCHEDULED_START?startTime:undefined,countdown,duration}] })));
  close();
 };
 return createPortal(<div className="fs-backdrop" style={wizard?.hidden?{display:'none'}:undefined} aria-hidden={wizard?.hidden||undefined} onPointerDown={e=>{if(e.target===e.currentTarget)close()}}><div className={`flash-sale-drawer fs-single${wizard?' promotion-config-wizard':''}`} ref={dialog} style={picker?{visibility:'hidden'}:undefined} aria-hidden={picker||!!batch||undefined} role="dialog" aria-modal="true" aria-label={drawerTitle}>
  <header className="fs-header"><h2>{drawerTitle}</h2><button className="fs-close" type="button" ref={closeButton} aria-label={`Close ${drawerTitle}`} onClick={close}><img src={closeIcon} alt="" width={16} height={16}/></button><p>Learn how to run a seller LIVE flash sale at <span className="fs-academy">Academy</span></p></header>
  {wizard&&<PromotionWizardSteps kind="Flash Sale" step={2}/>}
  <div className="fs-content">
   <section className="fs-config-card" aria-label="Flash sale settings"><div><h3 className="required-label"><RequiredMark/>When to start <Help/></h3><FlashSaleStart value={start} date={startDate} time={startTime} change={changeStart} manualDisabledReason={manualDisabledReason} changeDate={setStartDate} changeTime={setStartTime} error={startError} hidden={picker||!!batch||wizard?.hidden}/></div><div><h3 className="required-label"><RequiredMark/>Countdown <Help/></h3><label className="fs-config-input"><input aria-label="Countdown timer" inputMode="numeric" value={countdown} onChange={e=>setCountdown(e.target.value)}/><span>seconds</span></label></div><div><h3 className="required-label"><RequiredMark/>Duration <Help/></h3><label className="fs-config-input"><input aria-label="Duration" inputMode="decimal" value={durationMinutes} onChange={e=>setDurationMinutes(e.target.value)}/><span>minutes</span></label></div></section>
   <section className="fs-product-card" aria-label="Flash sale products">
   <div className="fs-level-bar" role="radiogroup" aria-label="Flash sale product level">{['Product-level','Variation-level'].map(name=><button type="button" role="radio" aria-checked={level===name} className={`fs-level${level===name?' is-selected':''}`} key={name} onClick={()=>setLevel(name)}><i className="fs-radio"/>{name}</button>)}<label className="fs-recurring"><button type="button" role="switch" aria-checked={recurring} aria-label="Recurring flash sales" className={`fs-switch${recurring?' is-on':''}`} onClick={()=>setRecurring(!recurring)}><i/></button>Recurring flash sales</label></div>
   <div className="fs-actions"><div className="fs-selected"><span>{selected.length}</span>Selected</div><div className="fs-batch"><button type="button" className="fs-batch-trigger" ref={batchFocus} aria-label="Flash sale batch edit" aria-haspopup="menu" aria-expanded={batchOpen} onClick={()=>setBatchOpen(!batchOpen)}>Batch edit <ChevronDown size={16}/></button>{batchOpen&&<div className="fs-batch-menu" role="menu" aria-label="Flash sale batch edit options">{([['deal','Batch edit deal price'],['total','Batch edit total purchase limit'],['customer','Batch edit customer purchase limit']] as const).map(([key,name])=><button type="button" role="menuitem" key={key} disabled={!selected.length} onClick={()=>editBatch(key)}>{name}</button>)}</div>}</div>{!wizard&&<button type="button" className="fs-add-product" ref={addButton} aria-label="Add products to flash sale" onClick={()=>{setBatchOpen(false);setPicker(true)}}><Plus size={16}/>Add more product</button>}</div>
   <div className="fs-table-wrap"><table className="fs-products-table"><colgroup>{[40,198,124,188,92,160,118].map((width,k)=><col key={k} style={{width:width+'px'}}/>)}</colgroup><thead><tr><th><input type="checkbox" aria-label="Select all flash sale products" checked={all} ref={e=>{if(e)e.indeterminate=selected.length>0&&!all}} onChange={()=>setSelected(all?[]:products.map(p=>p.id))}/></th><th>Product</th><th className="fs-number">Original Price</th><th>Deal Price <Help/></th><th className="fs-number">Stocks <Help/></th><th>Total purchase limit <Help/></th><th>Customer<br/>purchase limit <Help/></th></tr></thead><tbody>{products.map(item=><tr key={item.id} data-flash-product={item.id}><td><input type="checkbox" aria-label={`Select flash sale product ${item.name}`} checked={selected.includes(item.id)} onChange={()=>setSelected(p=>p.includes(item.id)?p.filter(id=>id!==item.id):[...p,item.id])}/></td><td><ProductIdentity product={item} className="fs-product"/></td><td className="fs-number">${Number(item.price).toFixed(2)}</td><td><label className="fs-deal"><span>$</span><input aria-label={`Deal price for ${item.name}`} data-field="deal" inputMode="decimal" placeholder={PRODUCT_PRICE} value={field(item.id,'deal')} onChange={e=>change(item.id,'deal',e.target.value)}/></label></td><td className="fs-number">{stockNumber(item).toLocaleString('en-US')}</td><td><div className="fs-total-field"><input className="fs-total" aria-label={`Total purchase limit for ${item.name}`} aria-required="true" aria-invalid={!!totalError(item.id)} aria-describedby={totalError(item.id)?`fs-total-error-${item.id}`:undefined} data-field="total" inputMode="numeric" placeholder={`1-${stockNumber(item).toLocaleString('en-US')}`} value={field(item.id,'total')} onChange={e=>change(item.id,'total',e.target.value)}/>{totalError(item.id)&&<p className="fs-total-error" id={`fs-total-error-${item.id}`} role="alert">{totalError(item.id)}</p>}</div></td><td><div className="fs-customer-field"><CustomerLimitEditor product={item} value={field(item.id,'customer')} change={value=>change(item.id,'customer',value)} hidden={picker||!!batch||wizard?.hidden}/>{customerError(item.id)&&<p className="fs-total-error" id={`fs-customer-error-${item.id}`} role="alert">{customerError(item.id)}</p>}</div></td></tr>)}</tbody></table></div>
   </section></div>
  <footer className="fs-footer fs-confirm-footer"><button type="button" className="fs-cancel" onClick={()=>wizard?wizard.back(products):close()}>Back</button><button type="button" className="fs-confirm" onClick={confirm}>Confirm</button></footer>
 </div>{batch&&<FlashSaleBatchModal field={batch} products={products.filter(p=>selected.includes(p.id))} close={()=>setBatch(null)} confirm={confirmBatch} returnFocus={batchFocus}/>}{picker&&renderPicker(products,()=>setPicker(false),rows=>setProducts(p=>[...p,...rows.filter(row=>!p.some(item=>item.id===row.id))]),{kind:'add-more',promotionKind:'Flash Sale',returnFocus:addButton})}</div>,document.body);
}
