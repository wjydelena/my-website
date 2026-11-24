import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';

export const PROMOTION_PIN_GRACE_MS=3500;
export type PrompterProduct = {id:number;image:string;name:string;price:string;activePromotion?:{entry:import('./usePromotionLifecycle').PromotionEntry;seconds:number;startedOrder:number};endedPromotion?:{entry:import('./usePromotionLifecycle').PromotionEntry;startedOrder:number;finishedAt:number}};
export const isEndedPinVisible=(product:PrompterProduct)=>!!product.endedPromotion&&product.endedPromotion.entry.kind!=='flash'&&Date.now()<product.endedPromotion.finishedAt+PROMOTION_PIN_GRACE_MS;
type PrompterState = {
  layoutCompleted:boolean;
  setLayoutCompleted:React.Dispatch<React.SetStateAction<boolean>>;
  products:PrompterProduct[];
  setProducts:React.Dispatch<React.SetStateAction<PrompterProduct[]>>;
  pinned:number|null;
  setPinned:React.Dispatch<React.SetStateAction<number|null>>;
  videoPreviewVisible:boolean;
  setVideoPreviewVisible:React.Dispatch<React.SetStateAction<boolean>>;
  visible:boolean;
  collapsed:boolean;
  setCollapsed:React.Dispatch<React.SetStateAction<boolean>>;
  handled:boolean;
  realTimeSuggestions:boolean;
  setRealTimeSuggestions:React.Dispatch<React.SetStateAction<boolean>>;
  smartScripts:boolean;
  setSmartScripts:React.Dispatch<React.SetStateAction<boolean>>;
  autoPostGiveaway:boolean;
  setAutoPostGiveaway:React.Dispatch<React.SetStateAction<boolean>>;
  open:()=>void;
  close:()=>void;
  scheduleLayoutSuggestion:()=>void;
  pinSuggestion:(id:number)=>void;
};
const Context=createContext<PrompterState|null>(null);
export function usePrompter(){
  const state=useContext(Context);
  if(!state)throw new Error('Prompter requires its provider');
  return state;
}
export function PrompterProvider({children}:{children:React.ReactNode}){
  const [layoutCompleted,setLayoutCompleted]=useState(false);
  const [products,setProducts]=useState<PrompterProduct[]>([]);
  const [pinned,setPinnedState]=useState<number|null>(null);
  const pinnedAt=useRef(0);
  const pinnedEnd=products.find(product=>product.id===pinned)?.endedPromotion;
  const clearAt=pinnedEnd? pinnedEnd.finishedAt+PROMOTION_PIN_GRACE_MS:undefined;
  useEffect(()=>{
    // An explicit pin after this grace period is an ordinary product pin.
    if(pinned===null||clearAt===undefined||pinnedAt.current>=clearAt)return;
    const timer=window.setTimeout(()=>setPinnedState(current=>current===pinned?null:current),Math.max(0,clearAt-Date.now()));
    return ()=>window.clearTimeout(timer);
  },[pinned,clearAt,pinnedEnd?.entry.value.id,pinnedEnd?.startedOrder]);
  useEffect(()=>{if(pinned!==null&&!products.some(product=>product.id===pinned))setPinnedState(null)},[products,pinned]);
  const [videoPreviewVisible,setVideoPreviewVisible]=useState(true);
  const setPinned=useCallback((value:React.SetStateAction<number|null>)=>{
    pinnedAt.current=Date.now();setPinnedState(value);setVideoPreviewVisible(true);
  },[]);
  const [visible,setVisible]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const [handled,setHandled]=useState(false);
  const [realTimeSuggestions,setRealTimeSuggestions]=useState(true);
  const [smartScripts,setSmartScripts]=useState(true);
  const [autoPostGiveaway,setAutoPostGiveaway]=useState(true);
  const firstLayoutSuggestion=useRef(false);
  const pushTimer=useRef<ReturnType<typeof setTimeout>>();
  const cancelPush=useCallback(()=>{clearTimeout(pushTimer.current);pushTimer.current=undefined;},[]);
  useEffect(()=>cancelPush,[cancelPush]);
  const open=useCallback(()=>{cancelPush();setVisible(true);setCollapsed(false);},[cancelPush]);
  const close=useCallback(()=>{cancelPush();setVisible(false);setCollapsed(false);},[cancelPush]);
  useEffect(()=>{if(!realTimeSuggestions)cancelPush();},[realTimeSuggestions,cancelPush]);
  const scheduleLayoutSuggestion=useCallback(()=>{
    if(firstLayoutSuggestion.current||!realTimeSuggestions)return;
    firstLayoutSuggestion.current=true;
    pushTimer.current=setTimeout(open,2000);
  },[open,realTimeSuggestions]);
  const pinSuggestion=useCallback((id:number)=>{
    setPinned(id);setHandled(true);setCollapsed(true);
  },[setPinned]);
  return <Context.Provider value={{layoutCompleted,setLayoutCompleted,products,setProducts,pinned,setPinned,videoPreviewVisible,setVideoPreviewVisible,visible,collapsed,setCollapsed,handled,realTimeSuggestions,setRealTimeSuggestions,smartScripts,setSmartScripts,autoPostGiveaway,setAutoPostGiveaway,open,close,scheduleLayoutSuggestion,pinSuggestion}}>{children}</Context.Provider>;
}
