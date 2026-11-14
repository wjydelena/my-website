import React, {createContext, useCallback, useContext, useState} from 'react';

export type PrompterProduct = {id:number;image:string;name:string;price:string};
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
  open:()=>void;
  close:()=>void;
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
  const [videoPreviewVisible,setVideoPreviewVisible]=useState(true);
  const setPinned=useCallback((value:React.SetStateAction<number|null>)=>{
    setPinnedState(value);setVideoPreviewVisible(true);
  },[]);
  const [visible,setVisible]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const [handled,setHandled]=useState(false);
  const open=useCallback(()=>{setVisible(true);setCollapsed(false);},[]);
  const close=useCallback(()=>{setVisible(false);setCollapsed(false);},[]);
  const pinSuggestion=useCallback((id:number)=>{
    setPinned(id);setHandled(true);setCollapsed(true);
  },[setPinned]);
  return <Context.Provider value={{layoutCompleted,setLayoutCompleted,products,setProducts,pinned,setPinned,videoPreviewVisible,setVideoPreviewVisible,visible,collapsed,setCollapsed,handled,open,close,pinSuggestion}}>{children}</Context.Provider>;
}
