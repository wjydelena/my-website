import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Plus } from 'lucide-react';
import PinIcon from './PinIcon';
import priceIcon from './assets/promotion-tools/01-price-cut.png';
import groupIcon from './assets/promotion-tools/02-group.png';
import rushIcon from './assets/promotion-tools/rush-reward.png';
import surpriseIcon from './assets/promotion-tools/surprise-set.png';
import giveawayIcon from './assets/promotion-tools/giveaway.png';
import billboardIcon from './assets/promotion-tools/billboard.png';
import boltIcon from './assets/promotion-tools/bolt-fill.png';
import couponIcon from './assets/promotion-tools/coupon-fill.png';
import toolboxIcon from './assets/promotion-tools/toolbox-fill.png';
import cardsIcon from './assets/promotion-tools/templates-cards-fill.png';
import adsIcon from './assets/promotion-tools/advertisement-fill.png';
import { useConsoleLayout } from './ResizableLayout';
import couponEmpty from './assets/promotion-tools/coupon-empty.png';
import PinnedTools from './PinnedTools';
import CreatePromotionPopover from './CreatePromotionPopover';
import './promotion-tools.css';

const common = 'Let viewers team up to buy your products at a great price.';
const items = [
  { label: 'Group Deal', image: groupIcon, description: common },
  { label: 'Price Cut', image: priceIcon, description: 'Let audience cut price together. The more they cut, the better the deal' },
  { label: 'Rush reward', image: rushIcon, description: 'Encourage purchases by giving buyers a chance to win prizes.' },
  { label: 'Surprise set', image: surpriseIcon, description: common },
  { label: 'Giveaway', image: giveawayIcon, description: 'Use prize to create excitement and reward your audience' },
  { label: 'Billboard', image: billboardIcon, description: 'Highlight key information on screen during your LIVE.' },
  { label: 'Flashsale', image: boltIcon, description: 'Drive instant purchases by offering limited-time deals' },
  { label: 'Coupon', image: couponIcon, description: 'Coupons could attract more new customers purchase your products.' },
  { label: 'Reward ladder', image: surpriseIcon, description: 'Offer higher-value rewards when shoppers buy more items.' },
  { label: 'Buy more save more', image: toolboxIcon, description: 'Offer bigger discounts when buyers buy more items.' },
  { label: 'Card Break', image: cardsIcon, description: 'Lower the barrier to buying and keep viewers watching with team-based card breaks.' },
  { label: 'Shop ads', image: adsIcon, description: 'Promote your products to reach more shoppers and drive sales.' },
];
const groups = [
  { title: 'Promote hero products', labels: ['Group Deal', 'Price Cut', 'Flashsale'] },
  { title: 'Promote multiple products', labels: ['Coupon', 'Rush reward', 'Reward ladder', 'Buy more save more'] },
  { title: 'Auction tools', labels: ['Surprise set', 'Card Break'] },
  { title: 'Boost LIVE engagement and traffic', labels: ['Shop ads', 'Giveaway'] },
  { title: 'Decorate LIVE room', labels: ['Billboard'] },
];

const pinnedStorageKey = 'live-console.pinned-tools.v199';
const initialPinned = () => {
  const fallback = ['Group Deal', 'Price Cut', 'Rush reward', 'Reward ladder', 'Surprise set', 'Giveaway', 'Billboard'];
  try {
    const saved = JSON.parse(localStorage.getItem(pinnedStorageKey) || 'null');
    if (!Array.isArray(saved)) return fallback;
    return [...new Set(saved.filter((label: unknown): label is string => typeof label === 'string' && items.some(item => item.label === label)))];
  } catch { return fallback; }
};

export default function PromotionTools({compact=false,createPromotion=false,couponRequest=0,couponReturnFocus,listPinned=false,onToggleListPin,triggerLabel,triggerAriaLabel,onCreatePriceCut}:{compact?:boolean;createPromotion?:boolean;couponRequest?:number;couponReturnFocus?:React.RefObject<HTMLButtonElement>;listPinned?:boolean;onToggleListPin?:()=>void;triggerLabel?:string;triggerAriaLabel?:string;onCreatePriceCut?:()=>void}) {
  const { editing, mode } = useConsoleLayout();
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [couponActive, setCouponActive] = useState(false);
  const [couponEntry, setCouponEntry] = useState(0);
  const [couponTab, setCouponTab] = useState('My shop');
  const toolbar = useRef<HTMLDivElement>(null);
  const couponButton = useRef<HTMLButtonElement>(null);
  const scrollCoupon = useRef(false);
  const [pinned, setPinned] = useState<string[]>(initialPinned);
  useEffect(() => {
    if (!open || !customizing) { try { localStorage.setItem(pinnedStorageKey, JSON.stringify(pinned)); } catch { /* Keep the current-session order if storage is unavailable. */ } }
  }, [pinned, open, customizing]);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => setHost(root.current?.closest<HTMLElement>('.reference-product-column') || root.current?.parentElement || null), []);
  const close = () => { setOpen(false); setCustomizing(false); trigger.current?.focus(); };
  useEffect(() => { setOpen(false); setCustomizing(false); setCouponActive(false); }, [editing, mode]);
  useEffect(() => {
    if (!open) return;
    if(createPromotion)panel.current?.focus({ preventScroll: true });
    else closeButton.current?.focus({ preventScroll: true });
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);
  const togglePin = (label: string) => setPinned(previous => previous.includes(label) ? previous.filter(value => value !== label) : [...previous, label]);
  const graphic = (item: typeof items[number]) => <img className="badge-icon" src={item.image} alt="" width={16} height={16} draggable={false}/>;
  const showTool = (label: string) => {
    if (label !== 'Coupon') return;
    scrollCoupon.current = true;
    setPinned(previous => previous.includes('Coupon') ? previous : [...previous, 'Coupon']);
    setCouponEntry(previous => previous + 1);
    setOpen(false); setCustomizing(false); setCouponActive(true); setCouponTab('My shop');
  };
  useEffect(()=>{if(couponRequest>0&&!editing)showTool('Coupon');},[couponRequest]);
  useEffect(()=>{
    if(!couponActive)return;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setCouponActive(false);couponReturnFocus?.current?.focus({preventScroll:true});}};
    document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);
  },[couponActive]);
  useLayoutEffect(() => {
    if (!scrollCoupon.current || !couponActive) return;
    scrollCoupon.current = false;
    if(compact){(couponReturnFocus?.current||trigger.current)?.focus({preventScroll:true});return;}
    if (toolbar.current && couponButton.current) {
      const row = toolbar.current.getBoundingClientRect(), tab = couponButton.current.getBoundingClientRect();
      if (tab.right > row.right - 36) toolbar.current.scrollLeft += tab.right - row.right + 36;
      else if (tab.left < row.left) toolbar.current.scrollLeft -= row.left - tab.left;
    }
    couponButton.current?.focus({ preventScroll: true });
  }, [pinned, couponActive, couponEntry]);
  const closeCoupon = () => { setCouponActive(false); (couponReturnFocus?.current||(compact?trigger.current:couponButton.current))?.focus({ preventScroll: true }); };

  return <div className={`promotion-bar promotion-tools${compact?' promotion-tools-compact':''}${createPromotion?' promotion-create-entry':''}`} ref={root}>
    <div className="promotion-content" ref={toolbar} role="region" aria-label="Promotion tools" tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); event.currentTarget.scrollBy({ left: event.key === 'ArrowRight' ? 240 : -240, behavior: 'smooth' });
        }
      }}>
      {pinned.map(label => { const item = items.find(value => value.label === label)!; return <button type="button" className={`promo-pill${couponActive && label === 'Coupon' ? ' is-active' : ''}`} ref={label === 'Coupon' ? couponButton : undefined} aria-pressed={label === 'Coupon' ? couponActive : undefined} key={label} onClick={() => showTool(label)}>{graphic(item)}{label === 'Rush reward' ? 'Rush Reward' : label}</button>; })}
    </div>
    <button className="promo-more" ref={trigger} type="button" aria-label={triggerAriaLabel||(createPromotion?'Create promotion':'More promotions')} aria-expanded={open} aria-haspopup={createPromotion?'menu':undefined} aria-controls={createPromotion?'create-promotion-menu':'promotion-tools-list'} disabled={editing} onClick={() => { if (open) close(); else { setOpen(true); } }}>{compact?<Plus size={20}/>:<ChevronDown size={18}/>} {createPromotion&&(triggerLabel||'Create promotion')}</button>
    {couponActive && host && createPortal(<div className="coupon-panel-viewport"><section key={couponEntry} className="coupon-panel" aria-label="Coupon panel" onPointerDown={event => event.stopPropagation()}>
      <div className="coupon-heading"><h2>Coupon</h2><button type="button" aria-label="Close Coupon" onClick={closeCoupon}><X size={18}/></button></div>
      <div className="coupon-tabs" role="tablist" aria-label="Coupon source">{['My shop', 'Co-funded'].map(tab => <button type="button" key={tab} role="tab" aria-selected={couponTab === tab} onClick={() => setCouponTab(tab)}>{tab}</button>)}</div>
      <div className="coupon-body" role="tabpanel" aria-label={couponTab}>
        <div className="coupon-empty"><img src={couponEmpty} width={224} height={172} alt="20% off coupon illustration"/><h3>Attract customers through coupons!</h3><p>Create coupons to attract new customers to your store, encourage them to purchase, and boost your conversion rate.</p><div className="coupon-actions"><button type="button" className="coupon-primary">Create now</button><button type="button">Check guides</button></div></div>
      </div>
      <footer className="coupon-footer"><button type="button"><Plus size={20}/>Create new</button></footer>
    </section></div>, host)}
    {open && createPromotion && createPortal(<CreatePromotionPopover anchor={trigger} panelRef={panel} onPriceCut={onCreatePriceCut?()=>{close();onCreatePriceCut()}:undefined}/>,root.current?.closest('.console-shell')||document.body)}
    {open && !createPromotion && host && createPortal(<div className="promotion-panel-viewport"><div className={`promotion-tools-list${customizing ? ' is-customizing' : ''}`} id="promotion-tools-list" ref={panel} role="region" aria-label="All promotions" onPointerDown={event => event.stopPropagation()}>
      <div className="promotion-panel-scroll">
        <div className="promotion-panel-heading"><h2>Pinned</h2><button className="promotion-customize" onClick={() => setCustomizing(previous => !previous)}>{customizing ? 'Done' : 'Customize'}</button><span className="promotion-heading-divider"/><button className="promotion-close" ref={closeButton} aria-label="Close promotions" onClick={close}><X size={18}/></button></div>
        <PinnedTools labels={pinned} customizing={customizing} onOrderChange={setPinned} onOpen={showTool} graphic={label => graphic(items.find(item => item.label === label)!)} />
        {onToggleListPin&&<button type="button" className="catalog-list-pin" aria-pressed={listPinned} onClick={onToggleListPin}><PinIcon/>{listPinned?'Unpin product list':'Pin product list'}</button>}
        <div className="promotion-all-heading"><h2>All tools</h2><span>Click to open and pin tools</span></div>
        {groups.map(group => <section className="promotion-tool-group" key={group.title}><h3>{group.title}</h3><div className="promotion-tool-grid">{group.labels.map(label => { const item = items.find(value => value.label === label)!; return <button type="button" className="promotion-tool-card" key={label} aria-label={customizing ? `${pinned.includes(label) ? 'Unpin' : 'Pin'} ${label}` : `Open ${label}`} aria-pressed={customizing ? pinned.includes(label) : undefined} onClick={() => customizing ? togglePin(label) : showTool(label)}><span className="promotion-tool-name">{graphic(item)}{label === 'Rush reward' ? 'Rush Reward' : label}{customizing && <PinIcon className={`promotion-card-pin${pinned.includes(label) ? ' is-pinned' : ''}`}/>}</span><span className="promotion-tool-description">{item.description}</span></button>; })}</div></section>)}
      </div>
    </div></div>, host)}
  </div>;
}
