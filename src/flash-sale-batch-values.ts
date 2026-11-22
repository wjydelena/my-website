import type {AddedItem} from './PreliveProductList';
import {stockOf,purchaseLimitError} from './promotion-validation';
export type FlashBatchField='deal'|'total'|'customer';
export type FlashEditMode='fixed'|'percentage'|'none'|'one'|'custom';
export function flashBatchValues(products:AddedItem[],field:FlashBatchField,mode:FlashEditMode,value:string){
 const n=Number(value),result:Record<string,string>={};
 if(!products.length)return {error:'Select at least one product.',values:result};
 if(field==='customer'&&mode==='none')return {error:'',values:Object.fromEntries(products.map(p=>[p.id,'']))};
 if(!(field==='customer'&&mode==='one')&&!value.trim())return {error:'Enter a value.',values:result};
 if(mode==='percentage'&&(!Number.isFinite(n)||n<1||n>100))return {error:'Enter a percentage from 1 to 100.',values:result};
 if(mode!=='percentage'&&!(field==='customer'&&mode==='one')&&(!Number.isFinite(n)||n<0))return {error:'Enter a valid non-negative number.',values:result};
 for(const p of products){
  const stock=stockOf(p);let candidate='';
  if(field==='deal'){
   const price=mode==='percentage'?Math.round(Number(p.price)*(1-n/100)*100)/100:n;
   const known=[Number(p.price),...(p.flashSales||[]).map(s=>Number(s.price))].filter(v=>Number.isFinite(v)&&v>=0);
   if(!Number.isFinite(price)||price>Math.min(...known))return {error:`${p.name}: Price cannot exceed the lowest known product or current flash sale price.`,values:result};
   candidate=price.toFixed(2);
  }else if(field==='total'){
   if(stock<1)return {error:`${p.name}: No available stock.`,values:result};
   if(mode!=='percentage'&&(!Number.isInteger(n)||n<1))return {error:'Enter a whole number greater than zero.',values:result};
   candidate=String(mode==='percentage'?Math.max(1,Math.floor(stock*n/100)):Math.min(n,stock));
  }else{
   candidate=mode==='one'?'1':value.trim();const error=purchaseLimitError(candidate,stock,true);
   if(error)return {error:`${p.name}: ${error}`,values:result};
  }
  result[p.id]=candidate;
 }
 return {error:'',values:result};
}
