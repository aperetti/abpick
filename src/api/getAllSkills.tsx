import HeroDict from "../types/HeroDict"
import {SkillDict, State} from '../App'
import { Dispatch, SetStateAction } from "react"

async function getAllSkills(dispatch: Dispatch<SetStateAction<State>>) {
    let res = await fetch(`/api/hero`, {headers: {'Content-Type': 'application/json'}})
    let json: HeroDict = await res.json()
    let skills: SkillDict = {}
    for (const [, heroSkills] of Object.entries(json)) {
       heroSkills.forEach(el => {
        skills[el.abilityId] = el
       })
    }
    dispatch(state => ({...state, heroDict: json, skillDict: skills, changeId: state.changeId + 1, skillsHydrated: true}))
}

export default getAllSkills