import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptySkillTile from '../EmptySkillTile'

interface Props {
  skills: Array<Skill | null>
  slot: number;
  setPickedSkill: (skill: Skill, idx: number) => void
  pickHistory: number[];
}

function PickSkills(props: PropsWithChildren<Props>) {
  let { skills, setPickedSkill, slot, pickHistory} = props
  return (
    <div className="Pick-skills">
      {skills.map((skill, i) => {
        if (skill) {
          return <SkillTile key={`Pick-skill-${skill.abilityId}`} picked={pickHistory.includes(skill.abilityId)} onClick={() => setPickedSkill(skill, slot*4+i)} skill={skill}></SkillTile>
        } else {
          return <EmptySkillTile key={`Empty-pick-skill-${i}`}></EmptySkillTile>
        }
      })
      }
    </div>
  );
}

export default PickSkills;
