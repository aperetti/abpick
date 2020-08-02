import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {} 

function RoundContainer(props: PropsWithChildren<Props>){
  return (
    <div className="Round-container">
        {props.children}
    </div>
  );
}

export default RoundContainer;
