import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {}
interface PropsColumn {
  location: "left" | "right" | "center" | "overview"
}
function DraftBoard(props: PropsWithChildren<Props>){
  return (
    <div className="Draft-board">
        {props.children}
    </div>
  );
}

export function DraftBoardColumn(props: PropsWithChildren<PropsColumn>){
  return (
    <div className={`Draft-board-${props.location}`}>
        {props.children}
    </div>
  )
}


export default DraftBoard;
