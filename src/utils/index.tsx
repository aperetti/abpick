import { ComboResponse } from '../api/getCombos'
import Skill from '../types/Skill'
import Ultimate from '../types/Ultimate'

export const mapPlayerSkills = <T extends (Skill | number)>(slot: number, skills: Array<T | null>) => [0, 1, 2, 3].map(el => {
  let skillSlotIdx = el * 10 + slot
  return skills[skillSlotIdx]
})

export const mapTeamSkills = <T extends (Skill | number | (number | null) | (Skill | null))>(team: 'dire' | 'radiant', skills: Array<T>) =>
  skills.filter((el, i) => team === 'dire' ? i % 2 === 1 : i % 2 === 0)

export const isUlt = (skillId: number, ultimates: Ultimate[]) => ultimates.findIndex(el => el.abilityId === skillId) !== -1

export const filterNonNullSkills = <T extends (Skill | number)>(skills: Array<T | null>) => skills.filter((el): el is T => el !== null && el !== undefined)
export const filterNullsReturnIds = (skills: (Skill | null)[]) => filterNonNullSkills(skills).map(el => el.abilityId)
export const filterAvailableSkills = (skills: (null | number)[], picks: (number | null)[]) => filterNonNullSkills(skills).filter(el => !picks.includes(el) && el !== -1)
export const filterAvailableCombos = (combos: ComboResponse[], picks: (number | null)[]) => combos.filter(el => !picks.includes(el.skill))

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

export const getPlayerNextTurn = (player: number, turn: number) => {
  let playerPicks: number[] = [0, 1, 2, 3].map((el, i) => i % 2 === 0 ? el * 10 + player : el * 10 + 9 - player)
  return playerPicks.find(el => el > turn)
}

export const derateSkill = (turn: number, pick: number) => 2 / (1 + Math.exp(-.2 * (turn - pick)))

export function arrEquals<T>(arr1: T[], arr2: T[]) {
  if (arr1.length !== arr2.length)
    return false

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}


export const getActiveComboes = (allCombos: ComboResponse[], skills: number[]) => {
  let sortedSkills = skills.sort()
  let combos = sortedSkills.flatMap((skill1, i) => sortedSkills.slice(i + 1).map(skill2 => [skill1, skill2]))
    .reduce((combos, el) => {
      let foundCombo = allCombos.find(combo => combo.picked === el[0] && combo.skill === el[1])
      if (foundCombo)
        return [...combos, foundCombo]
      else
        return combos
    }, [] as ComboResponse[])
  return combos
}
type ComboDict = { [combo: string]: ComboResponse }
export const getComboDict = (allCombos: ComboResponse[]) => allCombos.reduce((prev: ComboDict, el) => {
  let key = el.skill + '|' + el.picked
  return { ...prev, [key]: el }
}, {})

export const getPossibleCombos = (allCombos: ComboDict, skill: number, skills: number[]) => {
  return skills.map(id => {
    let comboKey = skill > id ? id + "|" + skill : skill + "|" + id
    return allCombos[comboKey]
  }).filter(combos => combos)
}

export const getSkillCombos = (allCombos: ComboResponse[], skills: number[]) => {
  return allCombos.reduce((summ, el) => {
    if (skills.includes(el.picked))
      return [...summ, el]

    if (skills.includes(el.skill)) {
      let tempSkill = el.picked
      el.picked = el.skill
      el.skill = tempSkill
      return [...summ, el]
    }

    return summ

  }, [] as ComboResponse[])
}