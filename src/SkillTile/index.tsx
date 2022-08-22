import React, { PropsWithChildren } from 'react';
import classNames from 'classnames'
import './index.css';
import Skill from '../types/Skill';
import { ContextMenu2 } from '@blueprintjs/popover2';
import SkillDetails from '../SkillDetails';
import SkillImage from '../SkillImage';
import { NullableSkillList } from '../App';
import { Classes, Icon } from '@blueprintjs/core';

interface Props {
  skill: Skill;
  skills: NullableSkillList
  onClick?: (ctrl: boolean) => void;
  picked?: boolean
  turn: number
  playerNextTurn: number | undefined
}


function SkillTile({ skill, onClick, picked, turn, skills, playerNextTurn}: PropsWithChildren<Props>) {
  let pastDue = turn > skill?.stats?.mean
  let survival = (playerNextTurn ? skill.stats.survival[playerNextTurn] : 1)
  let survivalColor = survival < .25 ? "gold" : (survival < .5 ? "silver" : "black")

  let tileClass = classNames("skill", Classes.DARK)


  return (
    <div className={tileClass}>
      <ContextMenu2  content={<SkillDetails skills={skills.filter((el): el is Skill => el !== null)} skill={skill} ></SkillDetails>} >
        <SkillImage onClick={onClick} skill={skill} picked={picked} />
      </ContextMenu2>
      {!picked && <div className='skill-badge'>

      </div>}
    </div>
  );
}

export default SkillTile;
