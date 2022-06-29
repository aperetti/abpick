import Skill from "../types/Skill"

async function parseConsole(consoleText: string) {
    let res = await fetch(`/api/parseConsole`, {method: 'post', body: consoleText})
    let json: Skill[][] = await res.json()
    return json
}

export default parseConsole