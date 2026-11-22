import React,{useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import NumericSelect from './GroupDealSizeSelect';
import './price-cut-batch.css';
import './group-deal-bulk.css';
export type GroupDealBulkField='size'|'price'|'quantity';
const titles={size:'Bulk edit group size',price:'Bulk edit Group Deal price',quantity:'Bulk edit quantity'};
const labels={size:'Bulk Group Deal group size',price:'Bulk Group Deal price',quantity:'Bulk Group Deal quantity'};
export default function GroupDealBulkModal({field,count,validate,confirm,close,returnFocus}:{field:GroupDealBulkField;count:number;validate:(value:string)=>string;confirm:(value:string)=>void;close:()=>void;returnFocus:React.RefObject<HTMLButtonElement>}){
 const [value,setValue]=useState(''),[submitted,setSubmitted]=useState(false),dialog=useRef<HTMLFormElement>(null);
 const error=value.trim()||submitted?validate(value):'';
 useEffect(()=>{dialog.current?.querySelector<HTMLElement>(field==='size'?'.gd-select':'input')?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(dialog.current?.querySelector('.gd-number-menu'))return;e.preventDefault();e.stopImmediatePropagation();close()}else if(e.key==='Tab'){const items=[...dialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus()}}};document.addEventListener('keydown',key,true);return()=>{document.removeEventListener('keydown',key,true);requestAnimationFrame(()=>{if(!dialog.current?.isConnected)returnFocus.current?.focus()})}},[]);
 return <div className="pc-batch-backdrop gd-bulk-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)close()}}><form ref={dialog} className={`pc-batch-modal gd-bulk-modal gd-bulk-modal-${field}`} role="dialog" aria-modal="true" aria-labelledby="gd-bulk-title" onSubmit={e=>{e.preventDefault();setSubmitted(true);if(!value.trim()||validate(value)||!count)return;confirm(value.trim())}}>
  <header><h2 id="gd-bulk-title">{titles[field]}</h2><button type="button" className="pc-batch-close" aria-label={`Close ${titles[field]}`} onClick={close}><X size={20}/></button></header>
  <div className="pc-batch-field">{field==='size'?<NumericSelect label={labels.size} value={value} placeholder="Select" choose={setValue} invalid={!!error} describedBy={error?'gd-bulk-error':undefined}/>:<label className={`pc-batch-input${error?' is-error':''}`}>{field==='price'&&<span aria-hidden="true">$</span>}<input aria-label={labels[field]} aria-invalid={!!error} aria-describedby={error?'gd-bulk-error':field==='price'?'gd-bulk-guidance':undefined} value={value} onChange={e=>setValue(e.target.value)} inputMode={field==='price'?'decimal':'numeric'} placeholder={field==='price'?'Enter lowest price':'Enter Group Deal quantity'}/></label>}
   {error&&<p className="pc-batch-error" id="gd-bulk-error" role="alert">{error}</p>}{field==='price'&&<p className="pc-batch-guidance" id="gd-bulk-guidance">For better results, set the Group Deal price below your 30-day lowest discounted price to attract more customers.</p>}
  </div>
  <footer><span>Editing {count} {count===1?'product':'products'}</span><button type="button" onClick={close}>Cancel</button><button type="submit" className="pc-batch-confirm" disabled={!!error||!count}>Confirm</button></footer>
 </form></div>;
}
