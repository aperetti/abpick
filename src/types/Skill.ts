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
}

export default Skill