import React, { useRef, useState } from 'react';
import { Settings, SlidersHorizontal, ShoppingCart, ShoppingBag, UserRoundCheck, UserRoundCog, Send, ExternalLink, GripVertical, Power, Mic, MicOff, Timer } from 'lucide-react';
import { useConsoleLayout, ResizeHandle } from './ResizableLayout';
import { useModuleHeader } from './ModuleDrag';
import { ModuleTitle, RemovePanelButton } from './LayoutEditor';
import liveVideo from './assets/live-loop.mp4';
import videoCollapse from './assets/video-collapse.png';
import videoLiveIndicator from './assets/video-live-indicator.png';
import customerIcon from './assets/customer.png';
import chat0 from './assets/reference-panels/chat-0.png';
import chat1 from './assets/reference-panels/chat-1.png';
import chat2 from './assets/reference-panels/chat-2.png';
import chat3 from './assets/reference-panels/chat-3.png';
import chat4 from './assets/reference-panels/chat-4.png';
import chat5 from './assets/reference-panels/chat-5.png';
import chat6 from './assets/reference-panels/chat-6.png';
import gladys from './assets/reference-panels/gladys.png';
import bessie from './assets/reference-panels/bessie.png';
import jason from './assets/reference-panels/jason.png';
import cody from './assets/reference-panels/cody.png';
import esther from './assets/reference-panels/esther.png';
import debra from './assets/reference-panels/debra.png';
import baii from './assets/reference-panels/baii.png';
import shoe from './assets/reference-panels/shoe.png';
import pancakes from './assets/reference-panels/pancakes.png';

const initialMessages = [
  { name:'Bobbie Dickinson', image:chat0, role:'customer', customer:1, bag:true, text:"The Air Jordan 3 is no longer a top-of-the-line on-court performer, but it's still one of the sleekest and most sought-after models of the Jordan line" },
  { name:'Jeanlovescat', image:chat1, role:'fan', text:'Can you please take a look at the Jordan 3?' },
  { name:'Alex Johnson', image:chat2, role:'mod', text:'This product is $9.99, only in today’s LIVE' },
  { name:'Jeanlovescat', image:chat3, role:'fan', customer:2, text:'Can you please take a look at the Jordan 3?' },
  { name:'SandyHukins', image:chat4, role:'normal', text:'170/62kg, which size to choose?' },
  { name:'Bobbie Dickinson', image:chat5, role:'customer', customer:3, text:'Next round please' },
  { name:'Alex Johnson', image:chat6, role:'mod', text:'This product is $9.99, only in today’s LIVE' },
];
function Chat() {
  const {editing,moduleStyle}=useConsoleLayout(); const drag=useModuleHeader('chat');
  const [comment,setComment]=useState(''); const [sent,setSent]=useState<string[]>([]);
  const [options,setOptions]=useState(false); const [showBadges,setShowBadges]=useState(true);
  const messages=[...initialMessages,...sent.map(text=>({name:'You',image:chat0,role:'normal',text}))];
  const submit=()=>{if(comment.trim()){setSent(v=>[...v,comment.trim()]);setComment('');}};
  return <div className="chat reference-chat" data-module-id="chat" style={moduleStyle('chat')}>
    <div className="chat-title" {...drag}><ModuleTitle>Chat</ModuleTitle><RemovePanelButton id="chat"/><button type="button" aria-label="Chat filters" disabled={editing} onClick={()=>setOptions(!options)}><SlidersHorizontal size={16}/></button><button type="button" aria-label="Chat settings" disabled={editing} onClick={()=>setOptions(!options)}><Settings size={16}/></button></div>
    {options&&!editing&&<div className="reference-chat-options"><label><input type="checkbox" checked={showBadges} onChange={e=>setShowBadges(e.target.checked)}/>Show user badges</label></div>}
    <div className="chat-scroll">{messages.map((m,i)=><div className="message" key={i}><img className="avatar" src={m.image} alt=""/><div className="message-content"><div className="name-line"><span>{m.name}</span>{showBadges&&<>
      {m.role==='fan'&&<span className="fan-icon"><UserRoundCheck size={14} fill="currentColor"/><b>♥</b></span>}{m.role==='mod'&&<UserRoundCog size={14} fill="currentColor"/>}
      {(m.role==='fan'||m.role==='normal')&&<><span className="divider"/><span className="chat-tag"><ShoppingCart size={13}/>3</span></>}
      {(m.role==='fan'||m.role==='normal'||('bag' in m&&m.bag))&&<span className="chat-tag"><ShoppingBag size={13}/>2</span>}
      {'customer' in m&&m.customer&&<span className="customer-tag"><Timer size={13}/>No.{m.customer} Customer</span>}
    </>}</div><p>{m.text}</p></div></div>)}</div>
    <form className="comment-box" onSubmit={e=>{e.preventDefault();submit();}}><input aria-label="Enter comment" placeholder="Enter comment" maxLength={100} disabled={editing} value={comment} onChange={e=>setComment(e.target.value)}/><span className="comment-count">{comment.length}/100</span><button type="submit" aria-label="Send comment" disabled={editing||!comment.trim()}><Send size={19}/></button></form>
  </div>;
}
export function LiveColumn(){
  const {editing,arrangement,moduleStyle}=useConsoleLayout();const drag=useModuleHeader('video');
  const [scripts,setScripts]=useState(true);const [microphone,setMicrophone]=useState(true);const [playing,setPlaying]=useState(true);const video=useRef<HTMLVideoElement>(null);
  return <section className="live-column"><div className="video-preview" data-module-id="video" style={moduleStyle('video')}><video ref={video} className="live-image" src={liveVideo} autoPlay loop muted playsInline preload="auto" aria-label="LIVE video preview"/>{editing&&<div className="video-edit-label" {...drag}><ModuleTitle>Video</ModuleTitle><RemovePanelButton id="video"/></div>}<div className="video-control-bar"><img className="video-collapse-icon" src={videoCollapse} width={16} height={16} alt=""/><span className="divider"/><label className="scripts-control">Scripts<button type="button" role="switch" aria-label="Scripts" aria-checked={scripts} disabled={editing} onClick={()=>setScripts(!scripts)}><i/></button></label><span className="divider"/><button type="button" className="video-mic" aria-label={microphone?'Mute microphone preview':'Unmute microphone preview'} aria-pressed={!microphone} disabled={editing} onClick={()=>setMicrophone(!microphone)}>{microphone?<Mic size={18}/>:<MicOff size={18}/>}</button><span className="control-space"/><img className="live-indicator" src={videoLiveIndicator} width={24} height={14} alt="Live"/><span className="timer">01:12:05</span><span className="divider"/><button type="button" aria-label={playing?'Pause video preview':'Play video preview'} disabled={editing} onClick={()=>{if(playing)video.current?.pause();else video.current?.play();setPlaying(!playing);}}><Power size={19}/></button></div><ResizeHandle kind="video" label={arrangement==='chat-focus'?'Resize live preview and analytics':'Resize live preview and chat'}/></div><Chat/></section>;
}
const metrics=[['$0','GMV'],['123','Current viewers'],['2.7K','Impressions'],['3.00%','Enter room rate'],['25s','Avg. duration'],['79','Product clicks']];
const purchases=[{name:'Gladys',image:gladys},{name:'Bessie',image:bessie},{name:'Jason',image:jason}];
const events=[
  {name:'Cody',image:cody,action:'followed you'}, {name:'Esther',image:esther,action:'joined your livestream'},
  {name:'Jason',image:jason,action:'subscribed to you for 5 months'}, {name:'Debra',image:debra,action:'won the giveaway',product:true},
  {name:'Bali',image:baii,action:'sent Pancakes',gift:true}, {name:'Gladys',image:gladys,action:'added a product to cart',product:true,no:true},
  {name:'Bali',image:baii,action:'is viewing a product',product:true,no:true}, {name:'Jason',image:jason,action:'asked to show product',product:true,no:true},
  {name:'Jason',image:jason,action:'subscribed to you for 5 months'}, {name:'Gladys',image:gladys,action:'added a product to cart',product:true,no:true},
  {name:'Bali',image:baii,action:'is viewing a product',product:true,no:true},
];
export function AnalyticsColumn(){
  const {editing,moduleStyle}=useConsoleLayout();const analyticsDrag=useModuleHeader('analytics');const activityDrag=useModuleHeader('activity');
  const [tab,setTab]=useState('Activity');const [filters,setFilters]=useState(false);const [purchasesOnly,setPurchasesOnly]=useState(false);
  return <section className="analytics-column"><div className="analytics" data-module-id="analytics" style={moduleStyle('analytics')}><div className="analytics-title" {...analyticsDrag}><ModuleTitle>Analytics</ModuleTitle><RemovePanelButton id="analytics"/><span>LIVE Dashboard<ExternalLink size={15}/></span></div><div className="metric-grid">{metrics.map(([value,label])=><div className="metric" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><ResizeHandle kind="analytics" label="Resize analytics and activity"/></div>
    <div className="activity-module" data-module-id="activity" style={moduleStyle('activity')}><div className="activity-tabs tabs" {...activityDrag}>{['Activity','Top customer'].map(value=><button type="button" role="tab" aria-selected={tab===value} className={tab===value?'active':''} disabled={editing} key={value} onClick={()=>setTab(value)}>{editing&&value==='Activity'&&<GripVertical className="activity-edit-grip" size={16}/>} {value}</button>)}<RemovePanelButton id="activity"/><button type="button" className="activity-filter" aria-label="Activity filters" disabled={editing} onClick={()=>setFilters(!filters)}><SlidersHorizontal size={16}/></button></div>
      {filters&&!editing&&<div className="reference-activity-options"><label><input type="checkbox" checked={purchasesOnly} onChange={e=>setPurchasesOnly(e.target.checked)}/>Purchases only</label></div>}
      <div className="activity-list">{purchases.map((p,i)=><div className="activity" key={p.name}><img className="avatar" src={p.image} alt=""/><p><span className="person-name">{p.name}</span>{tab==='Activity'?' made a purchase ':` · No.${i+1} customer `}<img className="mini-product" src={shoe} alt="Shoe"/><strong> No.6</strong><span className="purchase-divider"/><strong>$100.00</strong></p></div>)}</div>
      <div className="event-feed"><ResizeHandle kind="feed" label="Resize activity and event feed"/><div className="feed-scroll">{!purchasesOnly&&tab==='Activity'&&events.map((e,i)=><div className={'feed-item'+(i<2?' plain-event':'')} key={i}><img className="avatar" src={e.image} alt=""/><p><span className="person-name">{e.name}</span> {e.action} {e.product&&<img className="mini-product" src={shoe} alt="Shoe"/>}{e.no&&<strong> No.6</strong>}{e.gift&&<><img className="gift-product" src={pancakes} alt="Pancakes"/><strong> x4</strong></>}</p></div>)}</div></div>
    </div></section>;
}
