import React from 'react';
import cart from './assets/annotation-icons/cart.png';
import bag from './assets/annotation-icons/bag.png';
import customer from './assets/annotation-icons/customer.png';
import moderator from './assets/annotation-icons/moderator.png';

function ImageIcon({kind,src,size=13}:{kind:string;src:string;size?:number}) {
  return <img className={`attachment-icon attachment-${kind}`} src={src} width={size} height={size} style={{objectFit:'contain',flexShrink:0,filter:'none'}} alt=""/>;
}
export const CartIcon = () => <ImageIcon kind="cart" src={cart}/>;
export const BagIcon = () => <ImageIcon kind="bag" src={bag}/>;
export const CustomerIcon = () => <ImageIcon kind="customer" src={customer}/>;
export const ModeratorIcon = () => <ImageIcon kind="moderator" src={moderator} size={16}/>;
