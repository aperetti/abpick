import React, { useMemo, PropsWithChildren } from 'react';
import { NullableSkillList } from '../App';
import SkillImage from '../SkillImage';
import Skill from '../types/Skill';
import './index.css';
import { DraftBoardColumn } from '../DraftBoard'
import Card from '../Card'

interface Props {
  skills: NullableSkillList
}

function TopCombos(props: PropsWithChildren<Props>) {
  let nnSkills = useMemo(() => props.skills.filter((el): el is Skill => el !== null), [props.skills])
  let combos = useMemo(() => (
    nnSkills.reduce<[Skill, Skill, number][]>((comboRed, skill) => {
      let newComboRed = [...comboRed]
      if (skill.stats.combos) {
        Object.entries(skill.stats.combos).forEach((el) => {
          let [id, comboSkill] = el
          let foundSkill = nnSkills.find(el => el.abilityId === Number(id))
          if (foundSkill && comboSkill.synergy > .04) {
            newComboRed = [...newComboRed, [skill, foundSkill, comboSkill.synergy]]
          }
        })
      }
      return newComboRed
    }, []).sort((el1, el2) => el2[2] - el1[2])

  ), [nnSkills])
  console.log(combos)
  return (
    (combos.length > 0 &&
      <DraftBoardColumn location='combos'>
        <Card title="Combos" contentClass='combo-card'>
          {combos.map(([skill1, skill2, synergi], i) => (
            i % 2 === 0 && <div>
              <div className='top-combos-combo'>
                <SkillImage skill={skill1} disableAgs/>
                <SkillImage skill={skill2} disableAgs/>
                <div className='top-combos-overlay'>Win +{(100 * synergi).toFixed(0)}%</div>
              </div>
            </div>
          ))}
      </Card>
    </DraftBoardColumn >) || <></>
  );
}

export default TopCombos
