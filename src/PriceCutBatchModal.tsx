import React,{useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import './price-cut-batch.css';

export type PriceCutBatchField='lowest'|'participants'|'quantity';
const labels={lowest:'Batch edit lowest price',participants:'Batch edit participants',quantity:'Batch edit quantities'};
const inputLabels={lowest:'Batch lowest price',participants:'Batch participants',quantity:'Batch quantities'};
const required={lowest:'Enter a lowest price.',participants:'Enter target participants.',quantity:'Enter a quantity.'};

export default function PriceCutBatchModal({field,count,close,confirm,returnFocus}:{field:PriceCutBatchField;count:number;close:()=>void;confirm:(value:string)=>void;returnFocus:React.RefObject<HTMLButtonElement>}){
 const [value,setValue]=useState(''),[submitted,setSubmitted]=useState(false);
 const dialog=useRef<HTMLFormElement>(null),closeButton=useRef<HTMLButtonElement>(null);
 const numeric=Number(value);
 const error=!value.trim()?(submitted?required[field]:''):!Number.isFinite(numeric)||numeric<0?'Enter a valid non-negative number.':field!=='lowest'&&(!Number.isInteger(numeric)||numeric<=0)?'Enter a whole number greater than zero.':'';
 useEffect(()=>{closeButton.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}else if(e.key==='Tab'){const items=[...dialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus()}}};document.addEventListener('keydown',key,true);return()=>{document.removeEventListener('keydown',key,true);requestAnimationFrame(()=>returnFocus.current?.focus())}},[]);
 return <div className="pc-batch-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)close()}}><form className={`pc-batch-modal pc-batch-modal-${field}`} role="dialog" aria-modal="true" aria-labelledby="pc-batch-title" ref={dialog} onSubmit={e=>{e.preventDefault();setSubmitted(true);if(!value.trim()||error||!count)return;confirm(value.trim())}}>
  <header><h2 id="pc-batch-title">{labels[field]}</h2><button type="button" className="pc-batch-close" aria-label={`Close ${labels[field]}`} ref={closeButton} onClick={close}><X size={20}/></button></header>
  <div className="pc-batch-field"><label className={`pc-batch-input${error?' is-error':''}`}>{field==='lowest'&&<span aria-hidden="true">$</span>}<input aria-label={inputLabels[field]} aria-invalid={!!error} aria-describedby={error?'pc-batch-error':field==='lowest'?'pc-batch-guidance':undefined} value={value} onChange={e=>setValue(e.target.value)} inputMode={field==='lowest'?'decimal':'numeric'} placeholder={field==='lowest'?'Lowest price':undefined}/></label>{error&&<p className="pc-batch-error" id="pc-batch-error" role="alert">{error}</p>}{field==='lowest'&&<p className="pc-batch-guidance" id="pc-batch-guidance">For better results, set the Price Cut lowest price below your 30-day lowest discounted price to attract more customers.</p>}</div>
  <footer><span>Editing {count} {count===1?'product':'products'}</span><button type="button" onClick={close}>Cancel</button><button type="submit" className="pc-batch-confirm" disabled={!value.trim()||!!error||!count}>Confirm</button></footer>
 </form></div>;
}
