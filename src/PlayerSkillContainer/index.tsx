import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
}

function PlayerSkillContainer(props: PropsWithChildren<Props>){
  return (
    <div className={"Player-Skill-Container"}>
        {props.children}
    </div>
  );
}

export default PlayerSkillContainer;
