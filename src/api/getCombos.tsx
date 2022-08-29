
export interface ComboResponse {
    skill: number,
    picked: number,
    winPct: number,
    avgWinPct: number,
    synergy: number,
    matches: number,
}

async function getBestCombos(pickedSkills: number[], availableSkills: number[]) {
    let res = await fetch(`/api/bestCombos`, {
        body: JSON.stringify({pickedSkills, availableSkills}),
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
    let json: ComboResponse[] = await res.json()
    return json
}

export default getBestCombos