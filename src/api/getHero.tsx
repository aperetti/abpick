import Skill from "../types/Skill"

async function getHero(id: number) {
    let res = await fetch(`/api/hero/${id}`)
    let json: Skill[] = await res.json()
    return json
}

export default getHero