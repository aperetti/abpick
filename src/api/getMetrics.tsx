
export interface SkillMetric {
    gold: number,
    xp: number,
    damage: number,
    kills: number,
    deaths: number,
    assists: number,
    tower: number
}
async function getMetrics(pickedSkills: number[]) {
    let res = await fetch(`/api/skillMetrics`, {
        body: JSON.stringify(pickedSkills),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    let json: SkillMetric = await res.json()
    return json
}

export default getMetrics