import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill, { SkillClick } from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptySkillTile from '../EmptySkillTile'
import { RecPick } from '../App';

interface Props {
  skills: Array<Skill | null>
  slot: number
  setPickedSkill: SkillClick
  pickHistory: number[]
  recPicks: RecPick[]
}



function PickSkills({ skills, setPickedSkill, pickHistory, recPicks}: PropsWithChildren<Props>) {
  let recIds = recPicks.map(el => el.skill)
  return (
    <div className="Pick-skills">
        {skills.map((skill, i) => {
          if (skill) {
            return <SkillTile
              key={skill.abilityId}
              highlight={recIds.includes(skill.abilityId)}
              picked={pickHistory.includes(skill.abilityId)}
              onClick={setPickedSkill(skill)}
              skill={skill} />
          } else {
            return <EmptySkillTile key={`Empty-pick-skill-${i}`}></EmptySkillTile>
          }
        })
        }
    </div>
  );
}

export default PickSkills;
