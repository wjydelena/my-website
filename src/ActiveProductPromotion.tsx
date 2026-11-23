import React from 'react';
import {Clock3} from 'lucide-react';
import type {AddedItem} from './PreliveProductList';
import {promotionClock, type PromotionEntry} from './usePromotionLifecycle';
import PromotionMetaIcon from './PromotionMetaIcon';
import flashIcon from './assets/annotation-icons/promotion-flash.png';
import groupIcon from './assets/annotation-icons/promotion-group.png';
import cutIcon from './assets/annotation-icons/promotion-cut.png';
import './active-product-promotion.css';

const money = (price: string) => `$${Number(price).toFixed(2)}`;
export default function ActiveProductPromotion({item, entry, seconds}: {item: AddedItem; entry: PromotionEntry; seconds: number}) {
 const kind = entry.kind, value = entry.value;
 const price = kind === 'cut' ? entry.value.starting : entry.value.price;
 const label = kind === 'flash' ? 'LIVE Flash sale' : kind === 'group' ? 'Group deal' : 'Price cut';
 return <div className="prelive-added-info active-promotion-info" data-active-promotion={value.id} data-active-kind={kind}>
  <p title={item.name}>{item.name}</p>
  <div className="active-promotion-meta">
   <span className={`active-promotion-badge is-${kind}`}><img src={kind === 'flash' ? flashIcon : kind === 'group' ? groupIcon : cutIcon} width={14} height={20} alt=""/>{label}</span>
   <i aria-hidden="true"/>
   <span>{kind === 'flash' ? `Total purchase limit: ${entry.value.total}` : `Quantity: ${entry.value.quantity}`}</span>
   {kind !== 'flash' && <><i aria-hidden="true"/><span className="active-promotion-participants" aria-label={`${kind === 'group' ? 'Group size' : 'Participants'}: ${kind === 'group' ? entry.value.size : entry.value.participants}`}><PromotionMetaIcon kind="customers"/>{kind === 'group' ? entry.value.size : entry.value.participants}</span></>}
   <i aria-hidden="true"/><span className="active-promotion-countdown" role="timer" aria-live="off"><Clock3 size={12}/>Ends in {promotionClock(seconds)}</span>
  </div>
  <div className="prelive-added-price active-promotion-price"><strong>{kind === 'cut' ? 'Now ' : ''}{money(price)}</strong>{kind === 'cut' ? <><i aria-hidden="true"/><span>0 cuts</span></> : <del>{money(item.price)}</del>}</div>
 </div>;
}
