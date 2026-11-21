import React from 'react';
import {Check} from 'lucide-react';
import type {AddedItem} from './PreliveProductList';
export type PromotionKind='Flash Sale'|'Price Cut'|'Group Deal';
export type PromotionWizardConfig={hidden:boolean;products:AddedItem[];back:(products:AddedItem[])=>void};
export default function PromotionWizardSteps({kind,step}:{kind:PromotionKind;step:1|2}){return <div className={`fw-steps${step===2?' is-second':''}`} aria-label={`Step ${step} of 2`}><div className="fw-first">{step===2&&<i className="fw-complete"><Check size={13}/></i>}<span className="fw-step-label"><span className="fw-index">01</span>{' '}<span>{step===1?'Select products':'Add products'}</span></span><i className="fw-dots"/></div><span className={`fw-step-label${step===1?' fw-future':''}`}><span className="fw-index">02</span>{' '}<span>{step===1?'Configure settings':kind==='Flash Sale'?'Configure LIVE Flash sale':kind==='Price Cut'?'Configure Price cut settings':'Configure Group deal settings'}</span></span></div>}
