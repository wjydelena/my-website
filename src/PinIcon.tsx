import React from 'react';
import pinImage from './assets/annotation-pin.png';

export function UnpinIcon(){
  return <span aria-hidden="true" style={{position:'relative',display:'inline-flex',width:16,height:16,flexShrink:0}}><PinIcon/><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{position:'absolute',inset:0}}><path d="M2 2L14 14" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/><path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>;
}

export default function PinIcon({className=''}:{className?:string}) {
  const image = `url("${pinImage}")`;
  return <span aria-hidden="true" className={`annotation-pin-icon ${className}`} style={{display:'inline-block',width:16,height:16,flexShrink:0,backgroundColor:'currentColor',maskImage:image,WebkitMaskImage:image,maskSize:'contain',WebkitMaskSize:'contain',maskPosition:'center',WebkitMaskPosition:'center',maskRepeat:'no-repeat',WebkitMaskRepeat:'no-repeat'}}/>;
}
