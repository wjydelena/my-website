import React, { useState } from 'react';
import { PanelLeft, ChevronDown } from 'lucide-react';
import home from './assets/reference-nav/home.png';
import live from './assets/reference-nav/live.png';
import events from './assets/reference-nav/events.png';
import tools from './assets/reference-nav/tools.png';
import products from './assets/reference-nav/products.png';
import campaign from './assets/reference-nav/campaign.png';
import analytics from './assets/reference-nav/analytics.png';
import account from './assets/reference-nav/account.png';
import notification from './assets/reference-nav/notification.png';
import logo from './assets/reference-nav/logo.png';
import avatar from './assets/reference-nav/avatar.png';

const entries = [
  { label: 'Home', icon: home },
  { label: 'LIVE console', icon: live },
  { label: 'LIVE Events', icon: events },
  { label: 'LIVE tools', icon: tools, children: ['LIVE giveaway', 'LIVE coupon', 'LIVE highlight'] },
  { label: 'Manage products', icon: products, children: ['Showcase', 'LIVE product sets'] },
  { label: 'Campaign', icon: campaign },
  { label: 'Analytics', icon: analytics, children: ['Data overview', 'LIVE analytics', 'Video analytics', 'Product analytics'] },
  { label: 'Account health', icon: account, children: ['Product selection score', 'Account standing'] },
];
export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [closed, setClosed] = useState<string[]>([]);
  const [selected, setSelected] = useState('LIVE console');
  const toggle = (label: string) => setClosed(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);
  return <aside className={`reference-sidebar${expanded ? ' is-expanded' : ''}`} aria-label="Main navigation">
    <div className="reference-nav-header">
      {expanded && <div className="nav-wordmark"><img src={logo} alt=""/><strong>LIVE Manager</strong></div>}
      <button className="nav-toggle" type="button" aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><PanelLeft size={18}/></button>
    </div>
    <nav className="reference-nav-list">{entries.map(entry => <div key={entry.label}>
      <button type="button" className={`reference-nav-item${selected === entry.label ? ' is-selected' : ''}`} aria-label={entry.label} aria-current={selected === entry.label ? 'page' : undefined} aria-expanded={entry.children && expanded ? !closed.includes(entry.label) : undefined}
        onClick={() => { if(entry.children) { if(!expanded) setExpanded(true); else toggle(entry.label); } else setSelected(entry.label); }}>
        <img src={entry.icon} alt=""/>{expanded && <><span>{entry.label}</span>{entry.children && <ChevronDown className={closed.includes(entry.label) ? '' : 'is-open'} size={13}/>}</>}
      </button>
      {expanded && entry.children && !closed.includes(entry.label) && <div className="reference-nav-children">{entry.children.map(child => <button type="button" key={child} className={selected === child ? 'is-selected' : ''} onClick={() => setSelected(child)}>{child}</button>)}</div>}
    </div>)}</nav>
    <div className="reference-nav-footer">
      <button type="button" className="reference-nav-item" aria-label="Notification" onClick={() => setSelected('Notification')}><img src={notification} alt=""/>{expanded && <span>Notification</span>}</button>
      <button type="button" className="reference-profile" aria-label="Account zlf_us846" onClick={() => {setExpanded(true);setClosed(prev => prev.filter(x => x !== 'Account health'));}}><img src={avatar} alt=""/>{expanded && <span>zlf_us846</span>}</button>
    </div>
  </aside>;
}
