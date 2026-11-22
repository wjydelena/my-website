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
import {PrompterProvider,usePrompter} from './PrompterContext';
import {PrompterLogo,PrompterOverlay} from './Prompter';
import './header.css';
import './responsive.css';
import './chat-focus.css';
import './light-theme.css';
import './reference-layout.css';
import './reference-panels.css';
import './reference-editor.css';

import './navigation-1725.css';
import './card-hover.css';
import './demo-reference.css';
import './live-console-actions.css';
import preliveGlobe from './assets/prelive/globe.png';
import {PreliveProducts,PreliveMiddle,PreliveRight} from './Prelive';
function Header({prelive=false}:{prelive?:boolean}){const {layoutCompleted,visible,open}=usePrompter();return <header className="topbar console-topnav" data-testid="console-blank-area"><strong className="console-title">LIVE console</strong><div className="quick-live">Quick LIVE<ChevronDown size={14}/></div><div className="top-actions"><button type="button" className="assistant" aria-expanded={visible} aria-controls="prompter-panel" onClick={open}><PrompterLogo/><strong>Prompter</strong></button><span className="divider"/><button type="button" className="customize" data-testid="customize-layout-inactive"><LayoutPanelLeft size={16}/>Customize layout</button><span className="divider"/><svg className="nav-utility-icon nav-fullscreen-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M21 16v4a1 1 0 0 1-1 1h-4M8 21H4a1 1 0 0 1-1-1v-4"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>{prelive&&<img className="nav-utility-icon prelive-globe" src={preliveGlobe} alt=""/>}<Settings className="nav-utility-icon" size={20}/><span className="divider"/><TriangleAlert className="nav-utility-icon" size={20}/></div></header>}
export default function App(){const [prelive,setPrelive]=React.useState(true);const [selectedProducts,setSelectedProducts]=React.useState<any[]>([]);return <PrompterProvider><div data-testid={prelive?'prelive-console':'live-console'} className={`console-shell${prelive?' is-prelive':' is-live'}`}><Sidebar/><main className="workspace"><ResizableColumns header={<Header prelive={prelive}/>}><PreliveProducts live={!prelive} onProductsChange={setSelectedProducts}/> {prelive?<PreliveMiddle goLive={()=>setPrelive(false)}/>:<LiveColumn/>}{prelive?<PreliveRight/>:<AnalyticsColumn/>}<PrompterOverlay/></ResizableColumns></main></div></PrompterProvider>}
