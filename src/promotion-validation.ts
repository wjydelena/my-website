import type {AddedItem} from './PreliveProductList';
export function stockOf(product:AddedItem){
 const text=(product.stock??'100000').trim().replace(/,/g,'');
 const value=Number(text.replace(/k$/i,''))*(/k$/i.test(text)?1000:1);
 return Number.isFinite(value)&&value>=0?Math.floor(value):100000;
}
export function purchaseLimitError(value:string,stock:number,required:boolean){
 if(!value.trim())return required?'Enter a purchase limit.':'';
 const n=Number(value);
 if(!Number.isInteger(n)||n<1)return 'Enter a whole number greater than zero.';
 return n>stock?'Purchase limit cannot exceed available stock.':'';
}
