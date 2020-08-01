import {State} from '../App'
import { Dispatch, SetStateAction } from "react"

async function getUltimates(dispatch: Dispatch<SetStateAction<State>>) {
    let res = await fetch("/api/ultimates", {headers: {'Content-Type': 'application/json'}})
    let json = await res.json()
    dispatch(state => ({...state, ultimates: json.ultimates, changeId: state.changeId + 1}))
}

export default getUltimates