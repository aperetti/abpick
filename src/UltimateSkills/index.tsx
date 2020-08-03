import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import SkillTile from '../SkillTile'
import EmptyUltTile from '../EmptyUltTile'
import Ultimate from '../types/Ultimate';

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
  return (
    <div className="Ultimate-skills">
      {slotLookup.map(idx => skills[idx * 4 + 3]).map((skill, i) => {
        if (!skill || editMode) {
          return <EmptyUltTile skill={skill} setHero={setHero} key={i} ultimates={ultimates} slot={slotLookup[i]}></EmptyUltTile>
        } else {
          return <SkillTile picked={pickHistory.includes(skill.abilityId)} onClick={() => setPickedSkill(skill)} skill={skill}></SkillTile>
        }
      })}
    </div>
  );
}

export default UltimateSkills;
