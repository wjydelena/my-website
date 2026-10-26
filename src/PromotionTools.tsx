import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Ticket, Layers, Megaphone, ChevronDown, X, Zap, BriefcaseBusiness, Pin, ArrowLeft } from 'lucide-react';
import priceIcon from './assets/promotion-tools/01-price-cut.png';
import groupIcon from './assets/promotion-tools/02-group.png';
import rushIcon from './assets/promotion-tools/rush-reward.png';
import surpriseIcon from './assets/promotion-tools/surprise-set.png';
import giveawayIcon from './assets/promotion-tools/giveaway.png';
import billboardIcon from './assets/promotion-tools/billboard.png';
import { useConsoleLayout } from './ResizableLayout';
import './promotion-tools.css';

const common = 'Let viewers team up to buy your products at a great price.';
const items = [
  { label: 'Group Deal', image: groupIcon, description: common },
  { label: 'Price Cut', image: priceIcon, description: common },
  { label: 'Rush reward', image: rushIcon, description: common },
  { label: 'Surprise set', image: surpriseIcon, description: common },
  { label: 'Giveaway', image: giveawayIcon, description: 'Reward viewers and encourage participation in your LIVE.' },
  { label: 'Billboard', image: billboardIcon, description: 'Highlight important messages and products during your LIVE.' },
  { label: 'Flashsale', icon: Zap, description: 'Drive instant purchases by offering limited-time deals' },
  { label: 'Coupon', icon: Ticket, description: common },
  { label: 'Reward ladder', icon: BriefcaseBusiness, description: 'Offer higher-value rewards when shoppers buy more items.' },
  { label: 'Buy more save more', icon: BriefcaseBusiness, description: 'Offer bigger discounts when buyers buy more items.' },
  { label: 'Card Break', icon: Layers, description: 'Lower the barrier to buying and keep viewers watching with team-based card breaks.' },
  { label: 'Shop ads', icon: Megaphone, description: 'Reach more shoppers and bring viewers to your LIVE.' },
];
const groups = [
  { title: 'Promote hero products', labels: ['Group Deal', 'Price Cut', 'Flashsale'] },
  { title: 'Promote multiple products', labels: ['Coupon', 'Rush reward', 'Reward ladder', 'Buy more save more'] },
  { title: 'Auction tools', labels: ['Surprise set', 'Card Break'] },
  { title: 'Boost LIVE engagement and traffic', labels: ['Shop ads', 'Giveaway', 'Billboard'] },
];

export default function PromotionTools() {
  const { editing, mode } = useConsoleLayout();
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pinned, setPinned] = useState(items.slice(0, 6).map(item => item.label));
  const [host, setHost] = useState<HTMLElement | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => setHost(root.current?.parentElement || null), []);
  const close = () => { setOpen(false); setCustomizing(false); setSelected(null); trigger.current?.focus(); };
  useEffect(() => { setOpen(false); setCustomizing(false); setSelected(null); }, [editing, mode]);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus({ preventScroll: true });
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);
  const togglePin = (label: string) => setPinned(previous => previous.includes(label) ? previous.filter(value => value !== label) : [...previous, label]);
  const graphic = (item: typeof items[number]) => item.image
    ? <img className="badge-icon" src={item.image} alt="" width={16} height={16}/>
    : item.icon ? <item.icon size={16} aria-hidden="true"/> : null;
  const active = items.find(item => item.label === selected);
  const showTool = (label: string) => { setSelected(label); setOpen(true); };
  return <div className="promotion-bar promotion-tools" ref={root}>
    <div className="promotion-content" role="region" aria-label="Promotion tools" tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); event.currentTarget.scrollBy({ left: event.key === 'ArrowRight' ? 240 : -240, behavior: 'smooth' });
        }
      }}>
      {pinned.map(label => { const item = items.find(value => value.label === label)!; return <button type="button" className="promo-pill" key={label} onClick={() => showTool(label)}>{graphic(item)}{label}</button>; })}
    </div>
    <button className="promo-more" ref={trigger} type="button" aria-label="More promotions" aria-expanded={open} aria-controls="promotion-tools-list" onClick={() => { if (open) close(); else { setSelected(null); setOpen(true); } }}><ChevronDown size={18}/></button>
    {open && host && createPortal(<div className="promotion-panel-viewport"><div className="promotion-tools-list" id="promotion-tools-list" ref={panel} role="region" aria-label="All promotions" onPointerDown={event => event.stopPropagation()}>
      <div className="promotion-panel-scroll">
        <div className="promotion-panel-heading"><h2>Pinned</h2><button className="promotion-customize" onClick={() => { setCustomizing(!customizing); setSelected(null); }}>{customizing ? 'Done' : 'Customize'}</button><span className="promotion-heading-divider"/><button className="promotion-close" ref={closeButton} aria-label="Close promotions" onClick={close}><X size={18}/></button></div>
        <div className="promotion-pinned">{pinned.map(label => { const item = items.find(value => value.label === label)!; return <button type="button" className="promo-pill" key={label} aria-label={customizing ? `Unpin ${label}` : label} onClick={() => customizing ? togglePin(label) : setSelected(label)}>{graphic(item)}{label}{customizing && <X size={12}/>}</button>; })}{!pinned.length && <span className="promotion-empty">Choose tools below to pin them here.</span>}</div>
        <div className="promotion-all-heading"><h2>All tools</h2><span>{customizing ? 'Select tools to pin or unpin' : 'Click to open and pin tools'}</span></div>
        {active && !customizing ? <section className="promotion-tool-detail"><button className="promotion-back" onClick={() => setSelected(null)}><ArrowLeft size={16}/>All tools</button><h3>{graphic(active)}{active.label}</h3><p>{active.description}</p><button className="promo-pill" onClick={() => togglePin(active.label)}><Pin size={16}/>{pinned.includes(active.label) ? 'Unpin tool' : 'Pin tool'}</button></section> : groups.map(group => <section className="promotion-tool-group" key={group.title}><h3>{group.title}</h3><div className="promotion-tool-grid">{group.labels.map(label => { const item = items.find(value => value.label === label)!; return <button type="button" className="promotion-tool-card" key={label} aria-label={customizing ? `${pinned.includes(label) ? 'Unpin' : 'Pin'} ${label}` : `Open ${label}`} aria-pressed={customizing ? pinned.includes(label) : undefined} onClick={() => customizing ? togglePin(label) : setSelected(label)}><span className="promotion-tool-name">{graphic(item)}{label === 'Rush reward' ? 'Rush Reward' : label}{customizing && <Pin className={pinned.includes(label) ? 'is-pinned' : ''} size={14}/>}</span><span className="promotion-tool-description">{item.description}</span></button>; })}</div></section>)}
      </div>
    </div></div>, host)}
  </div>;
}
