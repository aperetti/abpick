import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
}

function PlayerSkillContainer(props: PropsWithChildren<Props>) {
  return (
    <div className={"Player-Skill-Container"}>
      {props.children}
    </div>
  );
}

export function PlayerPickedSkills(props: PropsWithChildren<Props>) {
  return (
    <div className={"Player-Skill-Container-Picked"}>
      <div className={"Player-Skill-Title"}>Picked Skills</div>
      <div className={"Player-Skill-Container-Picked-Skills"}>
        {props.children}
      </div>
    </div>
  );
}

export function PredictLabel(props: PropsWithChildren<Props>) {
return (
  <div className="card-title player-skill-predict-label" style={{justifyContent: 'center', textOrientation: "upright", writingMode:"sideways-lr"}}>Predict</div>
)
}

interface PredictProps {
  category: string
}

export function PlayerPredictSkills(props: PropsWithChildren<PredictProps>) {
  return (
    <div className={"Player-Skill-Container-Picked"}>
      <div className={"Player-Skill-Title"}>{props.category}</div>
      <div>
        {props.children}
      </div>
    </div>
  );
}
export default PlayerSkillContainer;
