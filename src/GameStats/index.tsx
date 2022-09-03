import React, { PropsWithChildren } from 'react';
import './index.css';
import Card from '../Card'
import { filterNonNullSkills, getActiveComboes, mapPlayerSkills, mapTeamSkills } from '../utils';
import { H2 } from '@blueprintjs/core';
import CountUp from 'react-countup'
import { ComboResponse } from '../api/getCombos';
import { HeroSkillStats } from '../api/getAllSkills';
import { SkillDict } from '../App';

interface Props {
  picks: (number | null)[]
  heros: (null | HeroSkillStats)[]
  allCombos: ComboResponse[]
  skillDict: SkillDict
}

export const teams = ['dire', 'radiant'] as const;

export type Teams = typeof teams[number];
export interface ScoreMetric {
  label: string
  score: number
  team: Teams
  player?: number
}

const getPlayerSkills = (slot: number, picks: (number | null)[]) => filterNonNullSkills(mapPlayerSkills(slot, picks))

export function calculatePlayerScore(skillDict: SkillDict , skills: (number|null)[], allCombos: ComboResponse[], heros: (null | HeroSkillStats)[], player: number) {
  let scores: ScoreMetric[] = []
  let team: Teams = player % 2 === 0 ? 'radiant' : 'dire'
  let playerSkills = getPlayerSkills(player, skills)

  // Combo Score
  let comboScore = getActiveComboes(allCombos, playerSkills)
    .reduce((score, combo) => score + combo.synergy, 0)
  if (comboScore !== 0)
    scores.push({ label: "Combo Score", score: comboScore, team, player })

  // Skill Score
  let skillScore = playerSkills.reduce((score, el) => {
    return score + skillDict[el].stats.winRate - .5
  }, 0)
  if (skillScore !== 0)
    scores.push({ label: "Skill Win Rate", score: skillScore, team, player })


  let heroStats = heros[player]
  if (heroStats) {

    // Hero Model Score
    let heroScore = heroStats.winRate - .5
    scores.push({ label: "Hero Model Score", score: heroScore, team, player })

    // Hero Skill Score
    let heroSkillScore = heroStats.skills
      .filter(el => playerSkills.includes(el.id))
      .reduce((score, skill) => score + skill.winRate - .5, 0)

    if (heroSkillScore !== 0)
      scores.push({ label: "Hero Skill Synergy", score: heroSkillScore, team, player })

  }
  // Skill Pick Win Rate
  // TODO

  return scores
}

export function calculateTeamScores(picks: (number | null)[], allCombos: ComboResponse[]): ScoreMetric[] {
  let label = "Team Combo Score"
  return teams.map(team => ({
    team,
    label,
    score: getActiveComboes(allCombos, filterNonNullSkills(mapTeamSkills(team, picks))).reduce((score, el) => el.synergy + score, 0) / 5,
  })
  )
}

interface ScoreCardProps {
  scores: ScoreMetric[]
  team: Teams
}

function ScoreCard({scores, team}: PropsWithChildren<ScoreCardProps>) {
  let teamScores = scores.filter(el => el.team === team)
  let teamScore = teamScores.length > 0 ? teamScores.reduce((score, el) => el.score + score, 0): 0
  return (
    <div className='gamestat-scorecard'>
      <div className='gamestat-scorecard-label'>{team} Score</div>
      <H2><CountUp end={teamScore * 1000 + 1000} preserveValue={true} /></H2>
    </div>
  )
}

function GameStats({ picks, allCombos, heros, skillDict }: PropsWithChildren<Props>) {
  let turn = filterNonNullSkills(picks).length + 1

  let scores: ScoreMetric[] = [
    ...Array(10).fill(0).reduce((scores, el, i) => [...scores, ...calculatePlayerScore(skillDict, picks, allCombos, heros, i)], [] as ScoreMetric[]),
    ...calculateTeamScores(picks, allCombos)
  ]

  return (
    <div className="Gamestat-container">
      <Card title="GameStats">
        <div className='gamestat-content'>
          <ScoreCard scores={scores} team='radiant' />
          <div className='gamestat-turn-counter'><H2>{turn > 40 ? '--' : turn}</H2><div>Pick</div></div>
          <ScoreCard scores={scores} team='dire' />
        </div>
      </Card>
    </div>
  );
}

export default GameStats;
