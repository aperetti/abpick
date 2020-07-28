import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {} 

function SurvivalContainer(props: PropsWithChildren<Props>){
  return (
    <div className="Survival-container">
        {props.children}
    </div>
  );
}

export default SurvivalContainer;
