import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import { ContextMenu2 } from '@blueprintjs/popover2';
import SkillDetails from '../SkillDetails';
import SkillImage from '../SkillImage';

interface Props {
  skill: Skill;
  onClick?: (ctrl: boolean) => void;
  picked?: boolean;
  turn: number;
}

function SkillTile(props: PropsWithChildren<Props>) {
  let { skill, onClick, picked, turn } = props
  let survive = skill?.stats?.survival && skill?.stats?.survival[Math.min(turn + 10, 47)] < .50
  let win = skill?.stats?.winRate > .5
  let winCss = !picked && win && survive
  let surviveCss = !picked && !win && survive
  let pastDue = turn > skill?.stats?.mean

  return (
    <div className={`
      skill bp4-dark ${surviveCss ? 'skill-survive' : ''} ${winCss ? 'skill-win' : ''}`}>
      {pastDue && <div className='skill-badge'>{Math.round(turn - skill?.stats?.mean)}</div>}
      <ContextMenu2  content={<SkillDetails skill={skill} ></SkillDetails>} >
        <SkillImage onClick={onClick} skill={skill} picked={picked} />
      </ContextMenu2>
      {/* <SkillImage onClick={onClick} skill={skill} picked={picked} /> */}
    </div>
  );
}

export default SkillTile;
