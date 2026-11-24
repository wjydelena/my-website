import React,{createContext,useContext,useEffect,useState} from 'react';
import pants from './assets/reference-products/promotion-pants.png';
import redBag from './assets/selling-modes/red-gift-clean.png';
import sweater from './assets/selling-modes/giveaway-sweater-clean.png';
import badge from './assets/giveaway-live-badge.png';
import './giveaway-live.css';
export type GiveawayItem={id:number;name:string;image:string;published?:boolean;review?:boolean;ended?:boolean;price?:string;stock?:string;deadline?:number};
const name="Skechers Men's Classic Fit Delsx Fit Delson Fit Skechers Men's lore...";
type GiveawayState={live:boolean;giveaways:GiveawayItem[];setGiveaways:React.Dispatch<React.SetStateAction<GiveawayItem[]>>;giftFilter:string;setGiftFilter:React.Dispatch<React.SetStateAction<string>>;now:number;active:GiveawayItem|undefined;start:(id:number)=>boolean};
const Context=createContext<GiveawayState|null>(null);
export function useGiveaway(){const state=useContext(Context);if(!state)throw Error('Giveaway requires provider');return state;}
export function giveawayTime(deadline:number|undefined,now:number){const s=Math.max(0,Math.ceil(((deadline||now)-now)/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
export function GiveawayProvider({live,children}:{live:boolean;children:React.ReactNode}){
 const [giveaways,setGiveaways]=useState<GiveawayItem[]>([{id:1,name,image:pants},{id:2,name,image:redBag},{id:3,name,image:sweater,review:true}]);
 const [giftFilter,setGiftFilter]=useState('Unpublish');const [now,setNow]=useState(Date.now);
 const active=giveaways.find(row=>row.published&&!row.ended&&!!row.deadline&&row.deadline>now);
 useEffect(()=>{if(!active?.deadline)return;const tick=()=>{const time=Date.now();setNow(time);if(time>=active.deadline!)setGiveaways(rows=>rows.map(row=>row.published&&!row.ended&&row.deadline&&row.deadline<=time?{...row,ended:true}:row))};tick();const timer=window.setInterval(tick,250);return()=>window.clearInterval(timer)},[active?.deadline]);
 const start=(id:number)=>{const row=giveaways.find(row=>row.id===id);const time=Date.now();if(!live||!row||row.review||row.published||giveaways.some(row=>row.published&&!row.ended&&(row.deadline||0)>time))return false;setNow(time);setGiveaways(rows=>rows.some(row=>row.published&&!row.ended&&(row.deadline||0)>time)?rows:rows.map(row=>row.id===id&&!row.review&&!row.published?{...row,published:true,ended:false,deadline:time+300000}:row));setGiftFilter('Published');return true};
 return <Context.Provider value={{live,giveaways,setGiveaways,giftFilter,setGiftFilter,now,active,start}}>{children}</Context.Provider>
}
export function GiveawayVideoBadge(){const {live,active,now}=useGiveaway();if(!live||!active)return null;return <div className="giveaway-video-badge" aria-label={`Giveaway ends in ${giveawayTime(active.deadline,now)}`}><img src={badge} alt=""/><span>{giveawayTime(active.deadline,now)}</span></div>}
