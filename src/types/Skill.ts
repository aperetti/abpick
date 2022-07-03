
export type SkillClick = (skill: Skill) => (ctrlClick: boolean) => void

export interface Predict {
    gold: number
    win: number
    damage: number
    kills: number
    deaths: number
}
interface Skill {
    abilityId: number
    abilityName: number
    dname: string
    behavior: string
    desc: string
    img: string
    stats: {
        mean: number
        pickRate: number
        pickRateRounds: number[]
        std: number
        winRate: number
        winRateRounds: number[]
        survival: number[]
    }
    predict?: Predict
}

export default Skill