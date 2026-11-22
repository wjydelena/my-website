import React from 'react';
import editIcon from './assets/prelive/promotion-edit.png';
import deleteIcon from './assets/prelive/promotion-delete.png';
export default function PromotionRowActions({kind,index,number,disabled,onEdit,onDelete}:{kind:string;index:number;number:number;disabled:boolean;onEdit:(button:HTMLButtonElement)=>void;onDelete:()=>void}){
 return <div className="product-promotion-actions direct-promotion-actions"><button type="button" aria-label={`Delete ${kind} ${number} for added product ${index}`} title="Delete promotion" disabled={disabled} onClick={e=>{const focus=e.currentTarget.closest('article')?.querySelector<HTMLButtonElement>('.product-promo-trigger');onDelete();requestAnimationFrame(()=>focus?.focus())}}><img className="promotion-action-icon" src={deleteIcon} width={16} height={16} alt="" aria-hidden="true" draggable={false}/></button><button type="button" aria-label={`Edit ${kind} ${number} for added product ${index}`} title="Edit settings" disabled={disabled} onClick={e=>onEdit(e.currentTarget)}><img className="promotion-action-icon" src={editIcon} width={16} height={16} alt="" aria-hidden="true" draggable={false}/></button></div>;
}
