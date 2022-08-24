import { Popover2 } from '@blueprintjs/popover2';
import React, { PropsWithChildren, useEffect, useState, useMemo } from 'react';
import { ComboResponse } from '../api/getCombos';
import { NullableSkillList, SkillDict } from '../App';
import EmptySkillTile from '../EmptySkillTile';
import SkillImage from '../SkillImage';
import './index.css';
import Card from '../Card'
import { filterNonNullSkills, getSkillCombos, mapPlayerSkills } from '../utils';

interface Props {
  onClick: () => void,
  hero: string | null,
  slot: number,
  skills: NullableSkillList,
  activePick: number,
  availableSkills: number[],
  allSkills: SkillDict,
  isUlt: (skillId: number) => boolean
  setCombo: (slot: number, combos: ComboResponse[]) => void
  allCombos: ComboResponse[]
}

interface ComboProps {
  combos: ComboResponse[],
  allSkills: SkillDict,
}

function ComboContent({ combos, allSkills }: PropsWithChildren<ComboProps>) {
  return (
    <>
      {combos.length > 0 && <Card title='Combo'>
        <div className='hero-search-combo-container'>
          {combos.map((el) => {
            let skill = allSkills[el.skill]
            let synergy = el.winPct - el.avgWinPct
            return (
              <><SkillImage showPick synergy={synergy} disableAgs skill={skill} /></>
            )
          })}
        </div>
      </Card>}
    </>
  )
}

function HeroSearchName({ allCombos, onClick, hero, slot, skills, activePick, availableSkills, allSkills, isUlt }: PropsWithChildren<Props>) {
  let selectedSlot = activePick % 10 === slot && activePick < 40
  let [combos, setCombos] = useState<ComboResponse[]>([])

  let slotSkills = mapPlayerSkills(slot, skills)
  let slotSkillIds = filterNonNullSkills(slotSkills).map(el => el.abilityId)
  let skillString =useMemo(() => JSON.stringify(slotSkills.map(el => el?.abilityId)), [slotSkills])

  let noPickedSkills = useMemo(() => slotSkills.filter(el => el === null || el === undefined).length === 4, [slotSkills])

  useEffect(() => {
    if (noPickedSkills)
      return

    setCombos(getSkillCombos(allCombos, slotSkillIds))

  // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [skillString])

  let filteredCombos = useMemo(() => {
    if (![10, 11].includes(slot))
      return combos.reduce<ComboResponse[]>((filteredCombos, combo) => {
        let foundDuplicate = filteredCombos.find(el => el.skill === combo.skill)
        if (foundDuplicate === undefined)
          return [...filteredCombos, combo]
        else if (foundDuplicate.winPct < combo.winPct)
          return [...filteredCombos.filter(filterCombo => filterCombo.skill !== combo.skill), combo]
        else
          return filteredCombos
      }, [])
    else
      return []
  }, [combos, slot])
    .filter(el => availableSkills.includes(el.skill) && (Math.abs(el.winPct - el.avgWinPct) > .03))
    .sort((el1, el2) => Math.abs(el2.winPct) - el1.winPct)

  return (
    <div className="hero-name-container" onClick={onClick}>
      <Popover2
        position={slot % 2 !== 0 ? 'right' : 'left'}
        disabled={filteredCombos.length === 0}
        isOpen={(selectedSlot && filteredCombos.length > 0) || undefined}
        interactionKind='hover'
        content={<ComboContent combos={filteredCombos} allSkills={allSkills} />} >
        <div className={`hero-name-skills-container ${selectedSlot ? 'hero-name-skills-glow' : ''}`}>
          {slot !== 10 && slot !== 11 && slotSkills.map((skillSlot, i) =>
            (
              skillSlot &&
              <SkillImage key={i} small disableAgs skill={skillSlot} />) ||
            <EmptySkillTile key={i} small />

          )}
        </div>
      </Popover2>
      <div className='hero-name-text '>
        {hero || "--Select Hero--"}
      </div>

    </div>)
}

export default HeroSearchName;
