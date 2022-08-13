import { GenericType } from "typescript"

export type SkillClick = (skill: Skill) => (ctrlClick: boolean) => void

export interface Predict {
    gold: number
    win: number
    damage: number
    kills: number
    deaths: number
}
interface ComboSkill {
    sample_size: number
    winPct: number
    synergy: number
}

interface Skill {
    abilityId: number
    abilityName: number
    dname: string
    behavior: string
    desc: string
    img: string
    ult: boolean
    stats: {
        mean: number
        pickRate: number
        pickRateRounds: number[]
        std: number
        winRate: number
        winRateRounds: number[]
        survival: number[]
        combos?: Record<string, ComboSkill>
        scepterPickupRate?: number,
        scepterWinW?: number,
        scepterWinWo?: number,
        shardPickupRate?: number,
        shardWinW?: number,
        shardWinWo?: number,
    }
    predict?: Predict
}

export default Skill