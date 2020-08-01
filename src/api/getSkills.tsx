import Skill from "../types/Skill"


async function getSkills(skillIds: number[]) {
    let res = await fetch(`/api/getSkills`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(skillIds)
    })
    let json: Skill[] = await res.json() 
    console.log(json)
    return json
}

export default getSkills