import {useLayoutEffect, useRef} from 'react';
import {useConsoleLayout} from './ResizableLayout';

// Pre-LIVE follows the metric panel. During LIVE, initialize that same default
// once, then leave the video height entirely to its manual resize handle.
export default function useVideoAnalyticsAlignment(followChanges=true){
  const {values, change, arrangement, docked, editing} = useConsoleLayout();
  const initialized = useRef(false);
  const changeRef = useRef(change);
  changeRef.current = change;
  useLayoutEffect(()=>{
    if(editing || docked || arrangement !== 'balanced') return;
    if(!followChanges && initialized.current) return;
    initialized.current = true;
    changeRef.current('video', values.tools + values.analytics);
  }, [values.tools, values.analytics, arrangement, docked, editing, followChanges]);
  // Do not depend on video height: its manual resize handle remains usable.
}
