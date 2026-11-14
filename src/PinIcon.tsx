import React from 'react';
import pinImage from './assets/annotation-pin.png';

export default function PinIcon({className=''}:{className?:string}) {
  const image = `url("${pinImage}")`;
  return <span aria-hidden="true" className={`annotation-pin-icon ${className}`} style={{display:'inline-block',width:16,height:16,flexShrink:0,backgroundColor:'currentColor',maskImage:image,WebkitMaskImage:image,maskSize:'contain',WebkitMaskSize:'contain',maskPosition:'center',WebkitMaskPosition:'center',maskRepeat:'no-repeat',WebkitMaskRepeat:'no-repeat'}}/>;
}
