import React, { PropsWithChildren } from 'react';
import Skill, { SkillClick } from '../types/Skill'
import './index.css';
import SkillImage from '../SkillImage';
import Card from '../Card'

interface Props {
  skills: Array<Skill>
  turn: number
  pickSkill: SkillClick
}

function SkillDatatable({ skills, turn, pickSkill }: PropsWithChildren<Props>) {
  return (
    <Card title='Top Picks'>
      <div className='datatable-container'>
      {skills.sort((el1, el2) => el1.stats.mean - el2.stats.mean)
        .slice(0,20)
        .map(el => <SkillImage skill={el} showPick onClick={pickSkill(el)}/>)
      }
      </div>
  </Card>
  )
}

export default SkillDatatable;