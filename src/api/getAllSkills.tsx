import HeroDict from "../types/HeroDict"
import {State} from '../App'
import { Dispatch, SetStateAction } from "react"

async function getAllSkills(dispatch: Dispatch<SetStateAction<State>>) {
    let res = await fetch(`/api/hero`, {headers: {'Content-Type': 'application/json'}})
    let json: HeroDict = await res.json()
    dispatch(state => ({...state, heroDict: json, changeId: state.changeId + 1}))
}

export default getAllSkills