import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Plus} from 'lucide-react';
import PinIcon from './PinIcon';
import couponIcon from './assets/promotion-tools/coupon-fill.png';
import './live-coupon-popover.css';

const coupons = [
  {id:'coupon-percent', title:'6% off', description:'No minimum spend, max $6.00 off'},
  {id:'coupon-five', title:'$5.00 off', description:'No minimum spend'},
  {id:'coupon-seven', title:'$7.00 off', description:'On orders over $35.00'},
];
const pinHint = "You haven't gone LIVE yet. Once you go LIVE, you can pin coupons for more viewers to see.";

export default function LiveCouponPopover({open, live, hasProducts, anchorRef, onClose, onCreate}:{open:boolean;live:boolean;hasProducts:boolean;anchorRef:React.RefObject<HTMLButtonElement>;onClose:()=>void;onCreate:()=>void}){
  const panel = useRef<HTMLElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [position, setPosition] = useState({left:0, top:0, width:522});
  const [pinned, setPinned] = useState<string|null>(null);
  const [hint, setHint] = useState<string|null>(null);
  const [tipPosition, setTipPosition] = useState({left:0, top:0, arrow:140});

  useLayoutEffect(()=>{
    if(!open) return;
    const update=()=>{
      const anchor=anchorRef.current;
      if(!anchor) return;
      const column=anchor.closest('.prelive-products')?.getBoundingClientRect();
      const toolbar=anchor.closest('.reference-product-toolbar')?.getBoundingClientRect() || anchor.getBoundingClientRect();
      const width=Math.min(522, (column?.width || 554)-32, window.innerWidth-16);
      const left=Math.max(8, Math.min((column?.left || 0)+16, window.innerWidth-width-8));
      const height=panel.current?.getBoundingClientRect().height || 222;
      const below=toolbar.bottom+8;
      const top=below+height<=window.innerHeight-8 ? below : Math.max(8, toolbar.top-height-8);
      setPosition({left, top, width});
    };
    update();
    (hasProducts?panel.current?.querySelector<HTMLButtonElement>('.live-coupon-create'):panel.current)?.focus({preventScroll:true});
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return ()=>{window.removeEventListener('resize', update);window.removeEventListener('scroll', update, true);};
  }, [open, anchorRef, hasProducts]);

  useEffect(()=>{
    if(!open){setHint(null);return;}
    const outside=(event:PointerEvent)=>{
      const target=event.target as Node;
      if(!panel.current?.contains(target) && !anchorRef.current?.contains(target)) closeRef.current();
    };
    const escape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();closeRef.current();anchorRef.current?.focus({preventScroll:true});}
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return ()=>{document.removeEventListener('pointerdown', outside);document.removeEventListener('keydown', escape);};
  }, [open, anchorRef]);
  useEffect(()=>{setHint(null);}, [live]);
  useEffect(()=>{if(!hasProducts){setPinned(null);setHint(null);}}, [hasProducts]);
  useLayoutEffect(()=>{
    if(!hint || live || !open || !tooltip.current) return;
    const button=panel.current?.querySelector(`[data-coupon-pin-wrap="${hint}"]`);
    if(!button) return;
    const r=button.getBoundingClientRect(), t=tooltip.current.getBoundingClientRect();
    const center=r.left+r.width/2;
    const left=Math.max(8, Math.min(center-t.width/2, window.innerWidth-t.width-8));
    setTipPosition({left, top:Math.max(8, r.top-t.height-14), arrow:center-left});
  }, [hint, live, open, position.left, position.top]);

  if(!open) return null;
  const image=`url("${couponIcon}")`;
  return createPortal(<>
    <section ref={panel} id="live-coupon-popover" className="live-coupon-popover" role="dialog" aria-label={`LIVE coupons (${hasProducts?coupons.length:0})`} tabIndex={-1} style={position}>
      <header className="live-coupon-heading"><h2>LIVE coupons ({hasProducts?coupons.length:0})</h2><button type="button" className="live-coupon-create" disabled={!hasProducts} onClick={()=>{if(hasProducts)onCreate();}}><Plus size={16}/>Create coupon</button></header>
      {!hasProducts?<div className="live-coupon-empty"><span className="live-coupon-icon" aria-hidden="true" style={{maskImage:image,WebkitMaskImage:image}}/><h3>Add products first</h3><p>Coupons for your products will appear here.</p></div>:<div className="live-coupon-list">{coupons.map(coupon=><div className="live-coupon-row" key={coupon.id} data-coupon-id={coupon.id}>
        <span className="live-coupon-icon" aria-hidden="true" style={{maskImage:image, WebkitMaskImage:image}}/>
        <div className="live-coupon-copy"><h3>{coupon.title}</h3><p>{coupon.description}</p></div>
        <span className="live-coupon-pin-wrap" data-coupon-pin-wrap={coupon.id} tabIndex={!live?0:undefined} aria-label={!live?`Pin ${coupon.title}, unavailable before LIVE`:undefined} aria-describedby={!live&&hint===coupon.id?'live-coupon-pin-hint':undefined} onMouseEnter={()=>{if(!live)setHint(coupon.id);}} onMouseLeave={()=>setHint(null)} onFocus={()=>{if(!live)setHint(coupon.id);}} onBlur={()=>setHint(null)}>
          <button type="button" className={`live-coupon-pin${live&&pinned===coupon.id?' is-pinned':''}`} disabled={!live} aria-label={`${pinned===coupon.id?'Unpin':'Pin'} coupon ${coupon.title}`} aria-pressed={pinned===coupon.id} onClick={()=>{if(live)setPinned(previous=>previous===coupon.id?null:coupon.id);}}><PinIcon/>{pinned===coupon.id?'Unpin':'Pin'}</button>
        </span>
      </div>)}</div>}
    </section>
    {!live&&hint&&<div ref={tooltip} id="live-coupon-pin-hint" className="live-coupon-pin-hint" role="tooltip" style={{left:tipPosition.left, top:tipPosition.top, '--hint-arrow':`${tipPosition.arrow}px`} as React.CSSProperties}>{pinHint}</div>}
  </>, document.body);
}
