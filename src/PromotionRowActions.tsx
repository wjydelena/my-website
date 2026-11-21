import React from 'react';
import {SquarePen,Trash2} from 'lucide-react';
export default function PromotionRowActions({kind,index,number,disabled,onEdit,onDelete}:{kind:string;index:number;number:number;disabled:boolean;onEdit:(button:HTMLButtonElement)=>void;onDelete:()=>void}){
 return <div className="product-promotion-actions direct-promotion-actions"><button type="button" aria-label={`Delete ${kind} ${number} for added product ${index}`} title="Delete promotion" disabled={disabled} onClick={e=>{const focus=e.currentTarget.closest('article')?.querySelector<HTMLButtonElement>('.product-promo-trigger');onDelete();requestAnimationFrame(()=>focus?.focus())}}><Trash2 size={16}/></button><button type="button" aria-label={`Edit ${kind} ${number} for added product ${index}`} title="Edit settings" disabled={disabled} onClick={e=>onEdit(e.currentTarget)}><SquarePen size={16}/></button></div>;
}
