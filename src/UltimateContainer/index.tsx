import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {} 

function UltimateContainer(props: PropsWithChildren<Props>){
  return (
    <div className="Ultimate-container">
        {props.children}
    </div>
  );
}

export default UltimateContainer;
