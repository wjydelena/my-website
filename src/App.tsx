import React from 'react';
import {LiveColumn, AnalyticsColumn} from './ReferencePanels';
import Sidebar from './Sidebar';
import ProductColumn from './ProductColumn';
import { ResizableColumns, ResizeHandle, useConsoleLayout } from './ResizableLayout';
import { EditingHeader, ModuleTitle } from './LayoutEditor';
import { useModuleHeader } from './ModuleDrag';
import { PanelLeft, House, Video, LayoutGrid, Store, Megaphone, Monitor, UserRound, ChevronDown, Scan, Settings, TriangleAlert, SlidersHorizontal, Search, Gift, MoreHorizontal, GripVertical, Pin, Plus, Power, Send, ShoppingCart, ShoppingBag, UserRoundCheck, UserRoundCog, ExternalLink, LayoutPanelLeft, ChartNoAxesColumn } from 'lucide-react';
import {productImages,avatars} from './media';
import liveVideo from './assets/live-loop.mp4';
import videoCollapse from './assets/video-collapse.png';
import videoLiveIndicator from './assets/video-live-indicator.png';
import groupIcon from './assets/group.png';
import cutIcon from './assets/cut.png';
import customerIcon from './assets/customer.png';
import chair from './assets/chair.png';
import boot from './assets/boot.png';
import shirt from './assets/shirt.png';
import './styles.css';
import assistantIcon from './assets/LIVE_Ai_Assistant_Fill.svg';
import './header.css';
import './responsive.css';
import './chat-focus.css';
import './light-theme.css';
import './reference-layout.css';
import './reference-panels.css';
function Header(){const {editing,beginEdit}=useConsoleLayout();if(editing)return <EditingHeader/>;return <header className="topbar"><strong className="console-title">LIVE console</strong><span className="divider"/><div className="quick-live">Quick LIVE<ChevronDown size={16}/></div><div className="top-actions"><div className="assistant"><img className="assistant-icon" src={assistantIcon} width={16} height={16} alt=""/><strong style={{ fontSize: "14px" }}>Assistant</strong></div><span className="divider"/><button type="button" className="customize" style={{ fontSize: "14px" }} onClick={beginEdit}><LayoutPanelLeft size={16}/>Customize layout</button><span className="divider"/><Scan size={20}/><Settings size={21}/><span className="divider"/><TriangleAlert size={21}/></div></header>}
export default function App(){return <div className="console-shell"><Sidebar/><main className="workspace"><ResizableColumns header={<Header/>}><ProductColumn/><LiveColumn/><AnalyticsColumn/></ResizableColumns></main></div>}
