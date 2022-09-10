import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
  scale: number
}
interface PropsColumn {
  location: "left" | "right" | "center" | "overview" | "combos" | "player"
}

function DraftBoard(props: PropsWithChildren<Props>){
  return (
    <div className="Draft-board" style={{transform: `scale(${props.scale})`}}>
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
