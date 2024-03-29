import React, { PropsWithChildren, useState } from 'react';
import './index.css';
import { SkillClick } from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptyUltTile from '../EmptyUltTile'
import Ultimate from '../types/Ultimate';
import { Tag } from '@blueprintjs/core';
import { NullableSkillList, RecPick } from '../App';


interface Props {
  skills: NullableSkillList
  ultimates: Array<Ultimate>
  setHero: (ult: Ultimate, slot: number) => void
  setPickedSkill: SkillClick
  pickHistory: number[]
  editMode: boolean
  recPicks: RecPick[]
}

const slotLookup = [0, 1, 2, 9, 10, 11, 3, 4, 5, 6, 7, 8]

function UltimateSkills({ skills, ultimates, setHero, setPickedSkill, pickHistory, editMode, recPicks}: PropsWithChildren<Props>) {
  let [help, setHelp] = useState(false)
  let recIds = recPicks.map(el => el.skill)
  return (
    <div className="Ultimate-content">
      <div className="Ultimate-skills">
        {slotLookup.map(idx => skills[idx * 4 + 3]).map((skill, i) => {
          let ultOnly = skill && skill.abilityId === -1 ? true : false
          if (!skill || editMode || ultOnly) {
            return <EmptyUltTile ultOnly={ultOnly} skill={skill} setHero={setHero} key={`empty-skill-${i}`} ultimates={ultimates} slot={slotLookup[i]}></EmptyUltTile>
          } else {
            return <SkillTile highlight={recIds.includes(skill.abilityId)} data-testid={`ultSkillTile${i}`} picked={pickHistory.includes(skill.abilityId)} onClick={setPickedSkill(skill)} skill={skill}></SkillTile>
          }
        })}
      </div>
      {(help && skills.filter(el => el).length === 0) && <div data-testid="ultHelp" className="Ultimate-help" onClick={() => setHelp(!help)}>
        <Tag large minimal icon="add">Add ults, start tracking picks!</Tag>
      </div>}

    </div>
  );
}

export default UltimateSkills;
