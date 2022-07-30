import { Popover2 } from '@blueprintjs/popover2';
import React, { PropsWithChildren, useEffect, useState, useMemo} from 'react';
import getBestCombos, { ComboResponse } from '../api/getCombos';
import { NullableSkillList, SkillDict } from '../App';
import EmptySkillTile from '../EmptySkillTile';
import SkillImage from '../SkillImage';
import Skill from '../types/Skill';
import './index.css';
import Card from '../Card'

interface Props {
  onClick: () => void,
  hero: string | null,
  slot: number,
  skills: NullableSkillList,
  activePick: number,
  availableSkills: number[],
  allSkills: SkillDict,
  isUlt: (skillId: number) => boolean
}

interface ComboProps {
  combos: ComboResponse[],
  allSkills: SkillDict,
}

function ComboContent({ combos, allSkills}: PropsWithChildren<ComboProps>) {




  return (
    <>
      {combos.length > 0 && <Card title='Combo'>
        <div className='hero-search-combo-container'>
          {combos.map((el) => {
            let skill = allSkills[el.skill]
            let synergy = el.winPct - el.avgWinPct
            return (
              <><SkillImage synergy={synergy} disableAgs skill={skill} /></>
            )
          })}
        </div>
      </Card>}
    </>
  )
}

function HeroSearchName({ onClick, hero, slot, skills, activePick, availableSkills, allSkills, isUlt }: PropsWithChildren<Props>) {
  let selectedSlot = activePick % 10 === slot && activePick < 40
  let [bestCombos, setBestCombos] = useState<ComboResponse[]>([])
  let [loadingCombos, setLoadingCombos] = useState(false)
  let [lastSkillString, setLastSkillString] = useState('')

  let slotSkills = [0, 1, 2, 3].map(el => {
    let skillSlotIdx = el * 10 + slot
    return skills[skillSlotIdx]
  })

  let skillString = JSON.stringify(slotSkills.map(el => el?.abilityId))

  let noPickedSkills = slotSkills.filter(el => el === null).length === 4

  if (noPickedSkills && bestCombos.length !== 0)
    setBestCombos([])

  useEffect(() => {
    let getCombos = async () => {
      let nonNullSlotSkills = slotSkills
        .filter((el): el is Skill => el !== null)

      let hasUlt = nonNullSlotSkills
        .map(el => isUlt(el.abilityId)).some((el) => el)

      let hasAllSkills = nonNullSlotSkills
        .filter(el => !isUlt(el.abilityId)).length === 3

      let pickedSkills = nonNullSlotSkills
        .map(el => el.abilityId)

      let filteredAvailableSkills = availableSkills
        .filter(el => !((hasUlt && isUlt(el)) || (hasAllSkills && !isUlt(el)) || false))

      setLoadingCombos(true)
      let combos = await getBestCombos(pickedSkills, filteredAvailableSkills)

      setBestCombos(combos)

      setLoadingCombos(false)
    }

    if (!noPickedSkills && (selectedSlot || lastSkillString !== skillString))
      getCombos()
    setLastSkillString(skillString)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePick])

  let filteredCombos = useMemo(() => bestCombos.reduce<ComboResponse[]>((filteredCombos, combo) => {
    let foundDuplicate = filteredCombos.find(el => el.skill === combo.skill)
    if (foundDuplicate === undefined)
      return [...filteredCombos, combo]
    else if (foundDuplicate.winPct < combo.winPct)
      return [...filteredCombos.filter(filterCombo => filterCombo.skill !== combo.skill), combo]
    else
      return filteredCombos
  }, []), [bestCombos])

  .filter(el => availableSkills.includes(el.skill) && (Math.abs(el.winPct - el.avgWinPct) > .03))
  .sort((el1, el2) => Math.abs(el2.winPct) - el1.winPct)
  return (
    <div className="hero-name-container" onClick={onClick}>
      <Popover2
        position={slot % 2 !== 0 ? 'right' : 'left'}
        disabled={!Boolean(!loadingCombos && filteredCombos.length > 0)}
        isOpen={(selectedSlot && filteredCombos.length > 0) || undefined}
        interactionKind='hover'
        content={<ComboContent combos={filteredCombos} allSkills={allSkills} />} >
        <div className={`hero-name-skills-container ${selectedSlot ? 'hero-name-skills-glow' : ''}`}>
          {slot !== 10 && slot !== 11 && slotSkills.map(skillSlot =>
            (
              skillSlot &&
              <SkillImage small disableAgs skill={skillSlot} />) ||
            <EmptySkillTile small />

          )}
          {/* {![10, 11].includes(slot) && <Icon onClick={openHandler} className={`hero-search-open-combo-${position}`} icon={pinCombo ? 'star' : 'star-empty'} />} */}
        </div>
      </Popover2>
      <div className='hero-name-text '>
        {hero || "--Select Hero--"}
      </div>

    </div>)
}

export default HeroSearchName;
