import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {} 

function DraftBoard(props: PropsWithChildren<Props>){
  return (
    <div className="Draft-board">
        {props.children}
    </div>
  );
}

export default DraftBoard;
