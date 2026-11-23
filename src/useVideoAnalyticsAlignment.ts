import {useLayoutEffect, useRef} from 'react';
import {useConsoleLayout} from './ResizableLayout';

// The balanced layout starts both columns at the same y coordinate. Align to
// the metric panel only; Activity below it is deliberately not included.
export default function useVideoAnalyticsAlignment(){
  const {values, change, arrangement, docked, editing} = useConsoleLayout();
  const changeRef = useRef(change);
  changeRef.current = change;
  useLayoutEffect(()=>{
    if(editing || docked || arrangement !== 'balanced') return;
    changeRef.current('video', values.tools + values.analytics);
  }, [values.tools, values.analytics, arrangement, docked, editing]);
  // Do not depend on video height: its manual resize handle remains usable.
}
