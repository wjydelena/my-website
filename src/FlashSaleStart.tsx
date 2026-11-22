import React,{useEffect,useRef,useState} from 'react';
import {Calendar,Clock,ChevronDown,ChevronLeft,ChevronRight,ChevronsLeft,ChevronsRight} from 'lucide-react';
import './flash-sale-start.css';

export const MANUAL_START='Manually start during LIVE';
export const SCHEDULED_START='Start at a specific time';
const pad=(n:number)=>String(n).padStart(2,'0');
export const localDate=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseDate=(s:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;const d=new Date(`${s}T00:00:00`);return Number.isFinite(d.getTime())&&localDate(d)===s?d:null};
export function scheduleError(date:string,time:string,now=new Date()){
 const d=parseDate(date);if(!d)return 'Select a valid start date.';
 const limit=new Date(now);limit.setDate(limit.getDate()+30);
 if(date<localDate(now)||date>localDate(limit))return 'Must be set within 30 days.';
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return 'Select a valid start time.';
 const start=new Date(`${date}T${time}:00`);
 if(start.getTime()<=now.getTime())return 'Start time must be in the future.';
 if(start.getTime()>limit.getTime())return 'Must be set within 30 days.';
 return '';
}

export default function FlashSaleStart({value,date,time,change,changeDate,changeTime,error,hidden}:{value:string;date:string;time:string;change:(value:string)=>void;changeDate:(value:string)=>void;changeTime:(value:string)=>void;error:string;hidden?:boolean}){
 const [open,setOpen]=useState(false),[panel,setPanel]=useState<'date'|'time'|null>(null),[month,setMonth]=useState(()=>parseDate(date)||new Date()),[hour,setHour]=useState('00'),[minute,setMinute]=useState('00');
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),dateInput=useRef<HTMLInputElement>(null),timeInput=useRef<HTMLInputElement>(null),hours=useRef<HTMLDivElement>(null),minutes=useRef<HTMLDivElement>(null);
 const scheduled=value===SCHEDULED_START;
 const openDate=()=>{setMonth(parseDate(date)||new Date());setPanel('date')};
 const openTime=()=>{const now=new Date(),valid=/^([01]\d|2[0-3]):[0-5]\d$/.test(time);setHour(valid?time.slice(0,2):pad(now.getHours()));setMinute(valid?time.slice(3,5):pad(now.getMinutes()));setPanel('time')};
 useEffect(()=>{if(hidden){setOpen(false);setPanel(null)}},[hidden]);
 useEffect(()=>{if(panel==='time'){hours.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({block:'start'});minutes.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({block:'start'})}},[panel]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node)){setOpen(false);setPanel(null)}};const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;e.preventDefault();e.stopImmediatePropagation();if(panel){const previous=panel;setPanel(null);requestAnimationFrame(()=> (previous==='date'?dateInput:timeInput).current?.focus())}else{setOpen(false);trigger.current?.focus()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key,true);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key,true)}},[open,panel]);
 const now=new Date(),today=localDate(now),limit=new Date(now);limit.setDate(limit.getDate()+30);const last=localDate(limit);
 const first=new Date(month.getFullYear(),month.getMonth(),1),offset=first.getDay();const days=Array.from({length:42},(_,i)=>new Date(month.getFullYear(),month.getMonth(),1-offset+i));
 const shift=(months:number)=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()+months,1));
 const room=(input:React.RefObject<HTMLInputElement>)=>Math.max(120,(root.current?.closest('.fs-content')?.getBoundingClientRect().bottom||window.innerHeight)-(input.current?.getBoundingClientRect().bottom||0)-8);
 const startOption=(name:string,index:number)=><button type="button" role="option" aria-selected={value===name} onClick={()=>{change(name);setPanel(null);if(name===MANUAL_START){setOpen(false);trigger.current?.focus()}}} onKeyDown={e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();root.current?.querySelectorAll<HTMLButtonElement>('[role=option]')[e.key==='Home'?0:e.key==='End'?1:1-index]?.focus()}}><i className="fs-start-radio"/>{name}</button>;
 return <div className="fs-start-root" ref={root}>
  <button type="button" className={`fs-start-select${open?' is-open':''}${error?' is-error':''}`} ref={trigger} aria-label="When to start flash sale" aria-haspopup="listbox" aria-expanded={open} aria-invalid={!!error} aria-describedby={error?'fs-schedule-error':undefined} onClick={()=>{setOpen(!open);setPanel(null)}}>{value}<ChevronDown size={16}/></button>
  {scheduled&&<p className="fs-schedule-summary">{date}{time&&` · ${time}`}</p>}
  {error&&<p className="fs-schedule-error" id="fs-schedule-error" role="alert">{error}</p>}
  {open&&<div className={`fs-start-menu${scheduled?' is-scheduled':''}`}>
   <div className="fs-start-choices" role="listbox" aria-label="Flash sale start options">
    <div className="fs-start-choice">{startOption(MANUAL_START,0)}</div>
    <div className={`fs-start-choice fs-scheduled-choice${scheduled?' has-fields':''}`}>{startOption(SCHEDULED_START,1)}
   {scheduled&&<><div className="fs-start-date-time">
    <div className="fs-date-root"><label className={`fs-schedule-input${panel==='date'?' is-focused':''}${error?' is-error':''}`}><input ref={dateInput} aria-label="Flash sale start date" placeholder="YYYY-MM-DD" value={date} onChange={e=>changeDate(e.target.value)} onClick={openDate} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();openDate()}}}/><button type="button" aria-label="Choose flash sale date" onClick={openDate}><Calendar size={16}/></button></label>
     {panel==='date'&&<div className="fs-calendar" style={{maxHeight:room(dateInput)}} aria-label="Flash sale calendar"><header><button type="button" aria-label="Previous year" onClick={()=>shift(-12)}><ChevronsLeft size={16}/></button><button type="button" aria-label="Previous month" onClick={()=>shift(-1)}><ChevronLeft size={16}/></button><b>{month.getMonth()+1} / {month.getFullYear()}</b><button type="button" aria-label="Next year" onClick={()=>shift(12)}><ChevronsRight size={16}/></button><button type="button" aria-label="Next month" onClick={()=>shift(1)}><ChevronRight size={16}/></button></header><div className="fs-calendar-grid"><div className="fs-calendar-week">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d}>{d}</span>)}</div><div className="fs-calendar-days" role="grid" aria-label="Choose start date">{days.map(d=>{const key=localDate(d),other=d.getMonth()!==month.getMonth();return <button type="button" role="gridcell" key={key} aria-label={key} aria-selected={date===key} disabled={key<today||key>last||other} className={`${date===key?'is-selected ':''}${key===today?'is-today':''}`} onClick={()=>{changeDate(key);setPanel(null);dateInput.current?.focus()}}>{pad(d.getDate())}</button>})}</div></div></div>}
    </div>
    <div className="fs-time-root"><label className={`fs-schedule-input${panel==='time'?' is-focused':''}${error?' is-error':''}`}><input ref={timeInput} aria-label="Flash sale start time" placeholder="Select time" value={time} onChange={e=>changeTime(e.target.value)} onClick={openTime} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();openTime()}}}/><button type="button" aria-label="Choose flash sale time" onClick={openTime}><Clock size={16}/></button></label>
     {panel==='time'&&<div className="fs-time-picker" style={{'--fs-time-height':`${Math.min(304,room(timeInput))}px`} as React.CSSProperties} aria-label="Flash sale time picker"><div className="fs-time-columns">{([{ref:hours,count:24,value:hour,set:setHour,label:'Hour'},{ref:minutes,count:60,value:minute,set:setMinute,label:'Minute'}]).map(col=><div key={col.label} ref={col.ref} role="listbox" aria-label={`Flash sale ${col.label.toLowerCase()}`}>{Array.from({length:col.count},(_,i)=>pad(i)).map(v=><button type="button" role="option" aria-label={`${col.label} ${v}`} aria-selected={col.value===v} key={v} onClick={()=>col.set(v)}>{v}</button>)}</div>)}</div><footer><button type="button" onClick={()=>{const d=new Date();setHour(pad(d.getHours()));setMinute(pad(d.getMinutes()));requestAnimationFrame(()=>{hours.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({block:'nearest'});minutes.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({block:'nearest'})})}}>Current time</button><button type="button" className="fs-time-apply" onClick={()=>{changeTime(`${hour}:${minute}`);setPanel(null);timeInput.current?.focus()}}>Apply</button></footer></div>}
    </div>
   </div><p className="fs-schedule-hint">Must be set within 30 days.</p></>}
    </div>
   </div>
  </div>}
 </div>;
}
