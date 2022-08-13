import { ComboResponse } from '../api/getCombos'
import Skill from '../types/Skill'

export const mapPlayerSkills = <T extends (Skill|number)>(slot: number, skills: Array<T|null>) => [0, 1, 2, 3].map(el => {
    let skillSlotIdx = el * 10 + slot
    return skills[skillSlotIdx]
})

export const filterNonNullSkills = <T extends (Skill|number)>(skills: Array<T|null>) => skills.filter((el): el is T => el !== null)

export const filterAvailableSkills = (skills: (null|number)[], picks: (number|null)[]) => filterNonNullSkills(skills).filter(el => !picks.includes(el) && el !== -1)
export const filterAvailableCombos = (combos: ComboResponse[], picks: (number|null)[]) => combos.filter(el => !picks.includes(el.skill))

export const nextPick = (pickArray: (number | null)[]) => {

  let summaryArray = pickArray.reduce<number[]>((summary, el, idx) => {
    summary[idx % 10] += el !== null ? 1 : 0
    return summary
  }, Array(10).fill(0))
  let minValue = Math.min(...summaryArray)
  if (minValue % 2 === 1)
    summaryArray.reverse()
  let minIdx = summaryArray.findIndex(el => el === minValue)
  let next = 0
  if (minValue % 2 === 1)
    next = 9 - minIdx + 10 * minValue
  else
    next = minIdx + 10 * minValue

  return next
}

export const arrEquals = (arr1: number[], arr2: number[]) => {
  if (arr1.length !== arr2.length)
    return false

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}