import React from 'react';
import './product-identity.css';
/** One presentation for selectable products and drawer echoes; data stays on the original record. */
export default function ProductIdentity({product,className='',children}:{product:{id:string;name:string;image:string;displayId?:string};className?:string;children?:React.ReactNode}){
 const id=product.displayId||product.id;
 return <div className={`demo-product-identity ${className}`} data-product-identity={product.id}><img src={product.image} alt=""/><div className="demo-product-text"><div className="demo-product-label"><span className="demo-product-name" title={product.name}>{product.name}</span><span className="demo-product-id" title={`ID: ${id}`} aria-label={`Product ID: ${id}`}>ID</span></div>{children&&<div className="demo-product-details">{children}</div>}</div></div>;
}
