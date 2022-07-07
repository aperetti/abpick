import HeroSkillDict from "../types/HeroDict"
import {HeroNameDict, SkillDict, SkillHeroDict, State} from '../App'
import { Dispatch, SetStateAction } from "react"

interface AllSkillsResponse {
    skillDict: HeroSkillDict
    heroDict: HeroNameDict
}
async function getAllSkills(dispatch: Dispatch<SetStateAction<State>>) {
    let res = await fetch(`/api/hero`, {headers: {'Content-Type': 'application/json'}})
    let json: AllSkillsResponse = await res.json()
    let skills: SkillDict = {}
    let skillHeroDict: SkillHeroDict= {}
    for (const [heroId, heroSkills] of Object.entries(json.skillDict)) {
       heroSkills.forEach(el => {
        skills[el.abilityId] = el
        skillHeroDict[el.abilityId] = Number(heroId)
       })
    }
    dispatch(state => ({...state, skillHeroDict, heroNameDict: json.heroDict, heroSkillDict: json.skillDict, skillDict: skills, changeId: state.changeId + 1, skillsHydrated: true}))
}

export default getAllSkills