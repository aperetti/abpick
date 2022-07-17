import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptySkillTile from '../EmptySkillTile'

interface Props {
  skills: Array<Skill | null>
  slot: number;
  turn: number;
  hero?: string;
}

function PickSkills(props: PropsWithChildren<Props>) {
  let { skills, slot, turn, hero } = props
  return (
    <div >
      <div>
        {hero || "--Select Hero--"}
      </div>
      <div className={`Picked-skills ${turn === slot ? 'Picked-highlight' : ''}`}>
        {skills.map(skill => {
          if (skill) {
            return <SkillTile skills={skills} turn={turn} skill={skill}></SkillTile>
          } else {
            return <EmptySkillTile></EmptySkillTile>
          }
        })
        }
      </div>
    </div>
  );
}

export default PickSkills;
