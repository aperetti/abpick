import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
  right?: boolean
} 

function PickedContainer(props: PropsWithChildren<Props>){
  return (
    <div className={props.right ? "Picked-container-right" : "Picked-container-left"}>
        {props.children}
    </div>
  );
}

export default PickedContainer;
