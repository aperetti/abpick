import HeroSkillDict from "../types/HeroDict"
import {HeroNameDict, SkillDict, SkillHeroDict, State} from '../App'
import { Dispatch, SetStateAction } from "react"

interface HeroSkillStat {
    id: number
    winRate: number
    matches: number
}
export interface HeroSkillStats {
    _id: string
    winRate: number
    skills: HeroSkillStat[]
}
interface AllSkillsResponse {
    skillDict: HeroSkillDict
    heroDict: HeroNameDict,
    heroSkillStats: HeroSkillStats[]
}

export type HeroSkillStatDict = Record<string, HeroSkillStats>

async function getAllSkills(dispatch: Dispatch<SetStateAction<State>>) {
    let res = await fetch(`/api/hero`, {headers: {'Content-Type': 'application/json'}})
    let json: AllSkillsResponse = await res.json()
    let skills: SkillDict = {}
    let skillHeroDict: SkillHeroDict= {}
    for (const [heroId, heroSkills] of Object.entries(json.skillDict)) {
       heroSkills.forEach((el, idx) => {
        skills[el.abilityId] = el

        skills[el.abilityId]['ult'] = idx === 3
        skillHeroDict[el.abilityId] = Number(heroId)
       })
    }

    let heroSkillStatDict: HeroSkillStatDict = {}
    json.heroSkillStats.forEach(el => {
        heroSkillStatDict[el._id] = el
    })
    dispatch(state => ({...state, skillHeroDict, heroSkillStatDict, heroNameDict: json.heroDict, heroSkillDict: json.skillDict, skillDict: skills, changeId: state.changeId + 1, skillsHydrated: true}))
}

export default getAllSkills