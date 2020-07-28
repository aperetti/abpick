import Ultimate from "../types/Ultimate"
import { Dispatch, SetStateAction } from "react"

async function getUltimates(dispatch: Dispatch<SetStateAction<Ultimate[]>>) {
    let res = await fetch("/api/ultimates", {headers: {'Content-Type': 'application/json'}})
    let json = await res.json()
    dispatch(json.ultimates)
}

export default getUltimates