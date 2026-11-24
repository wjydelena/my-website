import {useEffect, useState} from 'react';
import type {AddedItem} from './PreliveProductList';
import {orderedProductPromotions} from './promotion-creation-order';

export type PromotionEntry = ReturnType<typeof orderedProductPromotions>[number];
export type ProductPromotionRuntime = {active: {id: string; deadline: number; startedOrder?:number} | null; ended: Record<string, number>; lastFinished?: {id:string;startedOrder:number;finishedAt:number}};
export type PromotionRuntimeState = {sequence: number; startSequence?:number; products: Record<string, ProductPromotionRuntime>};
const emptyState = (): PromotionRuntimeState => ({sequence: 0, products: {}});
export const productPromotions = (item: AddedItem) => orderedProductPromotions(item.flashSales || [], item.priceCuts || [], item.groupDeals || []);
export const promotionSeconds = (entry: PromotionEntry) => Number(entry.value.duration);
export function promotionClock(seconds: number) {
 const n = Math.max(0, Math.ceil(seconds)), pad = (v: number) => String(v).padStart(2, '0');
 return n >= 3600 ? `${pad(Math.floor(n / 3600))}:${pad(Math.floor(n / 60) % 60)}:${pad(n % 60)}` : `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
}
export function finishPromotion(state: PromotionRuntimeState, productId: string, expectedId?: string, finishedAt=Date.now()): PromotionRuntimeState {
 const product = state.products[productId];
 if (!product?.active || (expectedId && expectedId !== product.active.id)) return state;
 const sequence = state.sequence + 1;
 return {...state, sequence, products: {...state.products, [productId]: {active: null, ended: {...product.ended, [product.active.id]: sequence},lastFinished:{id:product.active.id,startedOrder:product.active.startedOrder||0,finishedAt}}}};
}
export function expirePromotions(state: PromotionRuntimeState, now: number): PromotionRuntimeState {
 // Resolve simultaneous expiries by their deadlines, then by stable product order.
 const expired = Object.entries(state.products).filter(([, p]) => p.active && p.active.deadline <= now).sort((a, b) => a[1].active!.deadline - b[1].active!.deadline);
 return expired.reduce((next, [id, p]) => finishPromotion(next, id, p.active!.id, p.active!.deadline), state);
}
function pruneRuntime(state: PromotionRuntimeState, items: AddedItem[]) {
 let changed = false;
 const products: Record<string, ProductPromotionRuntime> = {};
 for (const [id, runtime] of Object.entries(state.products)) {
  const item = items.find(p => p.id === id);
  if (!item) { changed = true; continue; }
  const ids = new Set(productPromotions(item).map(p => p.value.id));
  const active = runtime.active && ids.has(runtime.active.id) ? runtime.active : null;
  const ended = Object.fromEntries(Object.entries(runtime.ended).filter(([promoId]) => ids.has(promoId)));
  const lastFinished=runtime.lastFinished&&ids.has(runtime.lastFinished.id)?runtime.lastFinished:undefined;
  if (active !== runtime.active || Object.keys(ended).length !== Object.keys(runtime.ended).length || lastFinished!==runtime.lastFinished) changed = true;
  products[id] = active === runtime.active && Object.keys(ended).length === Object.keys(runtime.ended).length && lastFinished===runtime.lastFinished ? runtime : {active, ended,lastFinished};
 }
 return changed ? {...state, products} : state;
}
export default function usePromotionLifecycle(items: AddedItem[], live: boolean) {
 const [state, setState] = useState<PromotionRuntimeState>(emptyState);
 const [now, setNow] = useState(() => Date.now());
 const running = Object.values(state.products).some(p => p.active);
 useEffect(() => {
  setState(previous => live ? pruneRuntime(previous, items) : Object.keys(previous.products).length ? emptyState() : previous);
 }, [items, live]);
 useEffect(() => {
  if (!live || !running) return;
  const tick = () => {const time = Date.now(); setNow(time); setState(previous => expirePromotions(previous, time));};
  const timer = window.setInterval(tick, 250);
  // Deadlines are absolute: filtering, tab switches and delayed browser ticks do not reset them.
  const resume = () => {if (!document.hidden) tick();};
  document.addEventListener('visibilitychange', resume);
  return () => {window.clearInterval(timer); document.removeEventListener('visibilitychange', resume);};
 }, [live, running]);
 const start = (productId: string, promoId: string): 'started' | 'busy' | 'invalid' => {
  const item = items.find(p => p.id === productId), entry = item && productPromotions(item).find(p => p.value.id === promoId);
  if (!live || !entry || !Number.isFinite(promotionSeconds(entry)) || promotionSeconds(entry) <= 0) return 'invalid';
  if (state.products[productId]?.active) return 'busy';
  const time = Date.now(), deadline = time + promotionSeconds(entry) * 1000;
  setNow(time);
  setState(previous => {
   const product = previous.products[productId];
   if (product?.active) return previous;
   const ended = Object.fromEntries(Object.entries(product?.ended || {}).filter(([id]) => id !== promoId));
   const startSequence=(previous.startSequence||0)+1;
   return {...previous, startSequence, products: {...previous.products, [productId]: {active: {id: promoId, deadline, startedOrder:startSequence}, ended}}};
  });
  return 'started';
 };
 return {state, now, start, end: (productId: string, promoId?: string) => setState(previous => finishPromotion(previous, productId, promoId))};
}
export type PromotionLifecycle = ReturnType<typeof usePromotionLifecycle>;
