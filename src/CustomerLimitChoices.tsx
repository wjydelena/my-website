import React,{useId} from 'react';
import FlashEditChoices from './FlashEditChoices';
export default function CustomerLimitChoices({mode,changeMode,value,changeValue,label,error}:{mode:string;changeMode:(v:string)=>void;value:string;changeValue:(v:string)=>void;label:string;error:string}){
 const errorId=useId();
 return <><FlashEditChoices label="Customer purchase limit options" value={mode} change={changeMode} options={[{value:'none',label:'No limit'},{value:'one',label:'1 item'},{value:'custom',label:'Customize'}]}/>{mode==='custom'&&<div className="fs-edit-custom"><label className={`pc-batch-input${error?' is-error':''}`}><input inputMode="numeric" aria-label={label} aria-invalid={!!error} aria-describedby={error?errorId:undefined} placeholder="Required" value={value} onChange={e=>changeValue(e.target.value)}/></label></div>}{error&&<p className="pc-batch-error" id={errorId} role="alert">{error}</p>}</>;
}
