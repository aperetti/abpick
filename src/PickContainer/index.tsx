import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {} 

function PickContainer(props: PropsWithChildren<Props>){
  return (
    <div className="Pick-container">
        {props.children}
    </div>
  );
}

export default PickContainer;
