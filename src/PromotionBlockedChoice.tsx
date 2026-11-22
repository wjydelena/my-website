import React,{useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import './promotion-blocked-choice.css';
export default function PromotionBlockedChoice({message,children}:{message?:string;children:React.ReactNode}){
 const [position,setPosition]=useState<{left:number;top:number;arrow:number;below:boolean}|null>(null),anchor=useRef<HTMLSpanElement>(null),id=useId();
 const show=()=>{if(!message||!anchor.current)return;const r=anchor.current.getBoundingClientRect(),center=r.left+r.width/2,left=Math.max(8,Math.min(center-62,window.innerWidth-243)),below=r.top<72;setPosition({left,top:below?r.bottom+8:r.top-8,arrow:Math.max(8,Math.min(227,center-left)),below})};
 useEffect(()=>{if(!position)return;const hide=()=>setPosition(null);window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);return()=>{window.removeEventListener('scroll',hide,true);window.removeEventListener('resize',hide)}},[!!position]);
 if(!message)return <>{children}</>;
 return <span ref={anchor} className="promotion-blocked-choice" tabIndex={0} aria-disabled="true" aria-describedby={id} onMouseEnter={show} onMouseLeave={()=>setPosition(null)} onFocus={show} onBlur={()=>setPosition(null)} onKeyDown={e=>{if(e.key==='Escape'&&position){e.preventDefault();e.stopPropagation();setPosition(null)}}}>{children}<small id={id} className="promotion-unavailable promotion-blocked-description">{message}</small>{position&&createPortal(<div role="tooltip" className={`promotion-blocked-tooltip${position.below?' is-below':''}`} style={{left:position.left,top:position.top,'--tooltip-arrow':`${position.arrow}px`} as React.CSSProperties}>{message}</div>,document.body)}</span>;
}
