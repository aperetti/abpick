import React, { PropsWithChildren, useState } from 'react';
import './index.css';
import Skill from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptyUltTile from '../EmptyUltTile'
import Ultimate from '../types/Ultimate';
import { Tag } from '@blueprintjs/core';

interface Props {
  skills: Array<Skill | null>
  ultimates: Array<Ultimate>
  setHero: (heroId: number, slot: number) => void
  setPickedSkill: (skill: Skill) => void
  pickHistory: number[]
  editMode: boolean
}

const slotLookup = [0, 1, 2, 9, 10, 11, 3, 4, 5, 8, 7, 6]

function UltimateSkills(props: PropsWithChildren<Props>) {
  let { skills, ultimates, setHero, setPickedSkill, pickHistory, editMode } = props
  let [help, setHelp] = useState(true)
  return (
    <div className="Ultimate-content">
      <div className="Ultimate-skills">
        {slotLookup.map(idx => skills[idx * 4 + 3]).map((skill, i) => {
          if (!skill || editMode) {
            return <EmptyUltTile skill={skill} setHero={setHero} key={i} ultimates={ultimates} slot={slotLookup[i]}></EmptyUltTile>
          } else {
            return <SkillTile picked={pickHistory.includes(skill.abilityId)} onClick={() => setPickedSkill(skill)} skill={skill}></SkillTile>
          }
        })}
      </div>
      {(help && skills.filter(el => el).length === 0) && <div className="Ultimate-help" onClick={() => setHelp(!help)}>
        <Tag large minimal icon="add">Add ults, start tracking picks!</Tag>
      </div>}

    </div>
  );
}

export default UltimateSkills;
