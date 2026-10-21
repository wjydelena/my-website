import React, { useEffect, useRef, useState } from 'react';
import { Gift, Presentation, Ticket, Package, Layers, Megaphone, ChevronDown } from 'lucide-react';
import firstIcon from './assets/promotion-tools/01-price-cut.png';
import secondIcon from './assets/promotion-tools/02-group.png';
import thirdIcon from './assets/promotion-tools/03-group.svg';
import fourthIcon from './assets/promotion-tools/04-flashsale.png';
import './promotion-tools.css';

// Match the reference prototype's explicit attachment-to-label mapping.
const items = [
  { label: 'Group Deal', image: firstIcon },
  { label: 'Price Cut', image: secondIcon },
  { label: 'Rush reward', image: thirdIcon },
  { label: 'Flashsale', image: fourthIcon },
  { label: 'Giveaway', icon: Gift },
  { label: 'Billboard', icon: Presentation },
  { label: 'Coupon', icon: Ticket },
  { label: 'Surprise set', icon: Package },
  { label: 'Card Break', icon: Layers },
  { label: 'Shop ads', icon: Megaphone },
];

export default function PromotionTools() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  const graphic = (item: typeof items[number]) => item.image
    ? <img className="badge-icon" src={item.image} alt="" width={16} height={16}/>
    : item.icon ? <item.icon size={16} aria-hidden="true"/> : null;
  return <div className="promotion-bar promotion-tools" ref={root}>
    <div className="promotion-content" role="region" aria-label="Promotion tools" tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          event.currentTarget.scrollBy({left: event.key === 'ArrowRight' ? 240 : -240, behavior: 'smooth'});
        }
      }}>
      {items.map(item => <div className="promo-pill" style={{fontSize:'14px'}} key={item.label}>{graphic(item)}{item.label}</div>)}
    </div>
    <button className="promo-more" ref={trigger} type="button" aria-label="More promotions" aria-expanded={open} aria-controls="promotion-tools-list" onClick={() => setOpen(!open)}><ChevronDown size={18}/></button>
    {open && <div className="promotion-tools-list" id="promotion-tools-list" role="region" aria-label="All promotions">
      {items.map(item => <div className="promotion-list-item" key={item.label}>{graphic(item)}{item.label}</div>)}
    </div>}
  </div>;
}
