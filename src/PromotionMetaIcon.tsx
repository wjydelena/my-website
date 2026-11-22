import React from 'react';
import customers from './assets/prelive/customer-group.png';
import duration from './assets/prelive/clock-circle.png';
export default function PromotionMetaIcon({kind}:{kind:'customers'|'duration'}){
 return <img className="promotion-meta-icon" src={kind==='customers'?customers:duration} alt="" aria-hidden="true" width={12} height={12}/>;
}
