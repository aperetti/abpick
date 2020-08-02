import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {} 

function WinContainer(props: PropsWithChildren<Props>){
  return (
    <div className="Win-container">
        {props.children}
    </div>
  );
}

export default WinContainer;
