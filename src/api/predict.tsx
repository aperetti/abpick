import {SkillDict, State} from '../App'
import { Dispatch, SetStateAction } from "react"
import { Predict } from "../types/Skill"

interface Predicts {
    [i: number]: Predict
}

async function predict(playerSkills: number[], availableSkills: number[], dispatch: Dispatch<SetStateAction<State>>) {
    let res = await fetch(`/api/predict`,
        {
            headers: {'Content-Type': 'application/json'},
            method: 'post',
            body: JSON.stringify({
                picked: playerSkills,
                available: availableSkills
            })
        }
    )

    let predictions: Predicts = await res.json()

    dispatch(state => {
        let updatedSkillDict: SkillDict = {...state.skillDict}
        for (const [skillId, pred] of Object.entries(predictions)) {
            if (skillId in updatedSkillDict && skillId)
                updatedSkillDict[Number(skillId)].predict = pred
        }

        return {...state, skillDict: updatedSkillDict}
    })
}

export default predict