import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useConsoleLayout } from './ResizableLayout';
import collapseIcon from './assets/video-collapse.png';
import billboardIcon from './assets/selling-modes/live-billboard.png';
import adsIcon from './assets/selling-modes/live-ads.png';
import messageIcon from './assets/selling-modes/live-messages.png';
import './live-tools.css';
export default function LiveTools(){
  const {editing,values,change}=useConsoleLayout();
  const [expanded,setExpanded]=useState(true);const [tool,setTool]=useState<string|null>(null);const [text,setText]=useState('Welcome to our LIVE!');const [saved,setSaved]=useState(false);
  useEffect(()=>{if(editing)setTool(null);},[editing]);
  useEffect(()=>{if(!tool)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setTool(null);};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[tool]);
  const toggle=()=>{change('analytics',values.analytics+(expanded?-79:79),true);setExpanded(!expanded);};
  return <section className={`live-tools-section${expanded?' is-expanded':''}`} aria-label="LIVE tools"><header><h2><button type="button" disabled={editing} onClick={toggle} aria-expanded={expanded} aria-controls="live-tool-cards">LIVE tools</button></h2><button type="button" className="live-tools-collapse" aria-label={expanded?'Collapse LIVE tools':'Expand LIVE tools'} aria-expanded={expanded} aria-controls="live-tool-cards" disabled={editing} onClick={toggle}>{expanded?<img src={collapseIcon} width={16} height={16} alt=""/>:<ChevronDown size={16}/>}</button></header>{expanded&&<div className="live-tool-cards" id="live-tool-cards">{[['Billboard',billboardIcon],['Shop ads',adsIcon],['Auto-post messages',messageIcon]].map(([name,image])=><button type="button" key={name} disabled={editing} aria-label={`Open ${name} LIVE tool`} onClick={()=>{setTool(name);setSaved(false);}}><img src={image} width={18} height={18} alt=""/><span>{name}</span></button>)}</div>}{tool&&<div className="live-tool-dialog-shade"><section className="live-tool-dialog" role="dialog" aria-modal="true" aria-label={tool}><header><h2>{tool}</h2><button type="button" aria-label="Close LIVE tool" onClick={()=>setTool(null)}><X size={18}/></button></header>{tool==='Shop ads'?<><p>Preview your Shop ads setup for this LIVE.</p><label>Daily budget<input type="number" defaultValue="20" min="1"/></label></>:<label>{tool==='Billboard'?'Billboard text':'Message'}<textarea value={text} maxLength={100} onChange={e=>{setText(e.target.value);setSaved(false);}}/></label>}{saved&&<p role="status">Saved in this prototype preview.</p>}<footer><button type="button" onClick={()=>setTool(null)}>Cancel</button><button type="button" disabled={tool!=='Shop ads'&&!text.trim()} onClick={()=>setSaved(true)}>Save preview</button></footer></section></div>}</section>;
}
