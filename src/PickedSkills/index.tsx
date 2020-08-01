import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptySkillTile from '../EmptySkillTile'

interface Props {
  skills: Array<Skill | null>
  slot: number;
  turn: number;
}

function PickSkills(props: PropsWithChildren<Props>) {
  let { skills, slot, turn } = props
  return (
    <div className={`Picked-skills ${turn === slot ? 'Picked-highlight' : ''}`}>
      {skills.map(skill => {
        if (skill) {
          return <SkillTile skill={skill}></SkillTile>
        } else {
          return <EmptySkillTile></EmptySkillTile>
        }
      })
      }
    </div>
  );
}

export default PickSkills;
