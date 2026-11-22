import React from 'react';
import {createPortal} from 'react-dom';
import {HelpCircle,X} from 'lucide-react';
import './promotion-settings-dialog.css';

export function PromotionSettingsField({label,hint,help,children}:{label:string;hint?:React.ReactNode;help?:boolean;children:React.ReactNode}){
 return <section className="promotion-settings-field"><div className="promotion-settings-description"><div className="promotion-settings-label">{label}{help&&<HelpCircle size={16} aria-hidden="true"/>}</div>{hint&&<p className="promotion-settings-hint">{hint}</p>}</div><div className="promotion-settings-control">{children}</div></section>;
}
export default function PromotionSettingsDialog({kind,title,dialogLabel,dialogRef,closeButtonRef,close,update,children}:{kind:'cut'|'group';title:string;dialogLabel:string;dialogRef:React.RefObject<HTMLDivElement>;closeButtonRef:React.RefObject<HTMLButtonElement>;close:()=>void;update:()=>void;children:React.ReactNode}){
 return createPortal(<div className="pc-backdrop promotion-settings-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)close()}}><div className={`price-cut-drawer promotion-settings-dialog${kind==='group'?' group-deal-drawer is-group-settings':''}`} ref={dialogRef} role="dialog" aria-modal="true" aria-label={dialogLabel}><header className="pc-header promotion-settings-header"><h2>{title}</h2><button type="button" className="pc-close" aria-label={`Close ${dialogLabel}`} ref={closeButtonRef} onClick={close}><X size={16} strokeWidth={1.5}/></button></header>{children}<footer className="pc-footer promotion-settings-footer"><button type="button" onClick={close}>Cancel</button><button type="button" className="pc-primary" onClick={update}>Update</button></footer></div></div>,document.body);
}
