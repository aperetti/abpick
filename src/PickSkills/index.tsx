import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill, { SkillClick } from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptySkillTile from '../EmptySkillTile'

interface Props {
  skills: Array<Skill | null>
  slot: number;
  setPickedSkill: SkillClick
  pickHistory: number[];
  turn: number
}

function PickSkills(props: PropsWithChildren<Props>) {
  let { skills, setPickedSkill, pickHistory, turn} = props
  return (
    <div className="Pick-skills">
        {skills.map((skill, i) => {
          if (skill) {
            return <SkillTile skills={skills.filter((el): el is Skill => el !== null)} turn={turn} key={`Pick-skill-${skill.abilityId}`} picked={pickHistory.includes(skill.abilityId)} onClick={setPickedSkill(skill)} skill={skill}></SkillTile>
          } else {
            return <EmptySkillTile key={`Empty-pick-skill-${i}`}></EmptySkillTile>
          }
        })
        }
    </div>
  );
}

export default PickSkills;
