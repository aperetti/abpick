import React, { PropsWithChildren } from 'react';
import './index.css';
import Card from '../Card'
import { filterNonNullSkills, getActiveComboes, getComboDict, getPossibleCombos, mapPlayerSkills, mapTeamSkills } from '../utils';
import { H2, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import CountUp from 'react-countup'
import { ComboResponse } from '../api/getCombos';
import { HeroSkillStats } from '../api/getAllSkills';
import { SkillDict } from '../App';
import { Popover2 } from '@blueprintjs/popover2';

interface Props {
  picks: (number | null)[]
  heros: (null | HeroSkillStats)[]
  allCombos: ComboResponse[]
  skillDict: SkillDict
  playerHeroes: (string | null)[]
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

export function calculatePlayerScore(skillDict: SkillDict, skills: (number | null)[], allCombos: ComboResponse[], heros: (null | HeroSkillStats)[], player: number) {
  let scores: ScoreMetric[] = []
  let team: Teams = player % 2 === 0 ? 'radiant' : 'dire'
  let enemy: Teams = player % 2 !== 0 ? 'radiant' : 'dire'
  let playerSkills = getPlayerSkills(player, skills)
  let comboDict = getComboDict(allCombos)

  // Combo Score
  let comboScore = getActiveComboes(allCombos, playerSkills)
    .reduce((score, combo) => score + combo.synergy, 0)
  if (comboScore !== 0)
    scores.push({ label: "Combo Synergy", score: comboScore, team, player })

  // Combo Deny Score
  let denyCombo = playerSkills.reduce((prevScore: number, skill) => {
    let score = getPossibleCombos(comboDict, skill, filterNonNullSkills(mapTeamSkills(enemy, skills)))
      .reduce((score: number, combo) => score + combo.synergy, 0)
    return prevScore + score
  }, 0)
  if (denyCombo !== 0) {
    scores.push({ label: "Combo Deny Picks", "score": denyCombo, team, player })
  }

  // Hero Skill Deny Score
  let denyHeroSkill = playerSkills.reduce((prevScore, playerSkill) => {
    heros.forEach((hero, idx) => {
      if (idx !== player && idx !== 6 && idx !== 5) {
        let heroSkill = hero?.skills?.find(el => el.id === playerSkill)
        if (heroSkill) {
          let newScore = heroSkill.winRate - .5
          if (idx % 2 === player % 2)
            prevScore["ally"] -= newScore > 0 ? newScore : 0
          else
            prevScore["enemy"] += newScore
        }
      }
    })

    return prevScore
  }, {"enemy": 0, "ally": 0})

  if (denyHeroSkill["ally"] !== 0) {
    scores.push({ label: "Ally Deny Picks", "score": denyHeroSkill["ally"], team, player })
  }

  if (denyHeroSkill["enemy"] !== 0) {
    scores.push({ label: "Enemy Deny Picks", "score": denyHeroSkill["enemy"], team, player })
  }

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
      scores.push({ label: "Hero Model Win Rate", score: heroScore, team, player })

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
  return []
  // TODO this is going to pick up a lot of combos that aren't great.
  // or actually end up being denies. Need to actually calcluate team synergy if we're going to try this.
  let label = "Team Combo Score"
  return teams.map(team => ({
    team,
    label,
    score: getActiveComboes(allCombos, filterNonNullSkills(mapTeamSkills(team, picks))).reduce((score, el) => el.synergy + score, 0) / 5,
  })).filter(el => el.score !== 0)
}

interface ScoreCardProps {
  scores: ScoreMetric[]
  team: Teams
  playerHeroes: (string | null)[]
}


function ScoreCard({ scores, team, playerHeroes }: PropsWithChildren<ScoreCardProps>) {
  let teamScores = scores.filter(el => el.team === team)
  let teamScore = teamScores.length > 0 ? teamScores.reduce((score, el) => el.score + score, 0) : 0
  return (
    <div className='gamestat-scorecard'>
      <Popover2
        disabled={teamScores.length === 0}
        content={
          <Menu>
            {Object.entries(teamScores
              .reduce<Record<string, number>>((summary, el) => {
                if (el.label in summary)
                  summary[el.label] += el.score * 1000
                else
                  summary[el.label] = el.score * 1000
                return summary
              }, {}))
              .map(([label, score]) => (
                <MenuItem text={label} label={score.toFixed(0)} />
              ))}
            <MenuDivider />
            {Object.entries(teamScores
              .reduce<Record<string, number>>((summary, el) => {
                if (el.player === undefined)
                  return summary

                if (el.player in summary)
                  summary[el.player] += el.score * 1000
                else
                  summary[el.player] = el.score * 1000

                return summary
              }, {}))
              .map(([player, score]) => (
                <MenuItem text={playerHeroes[Number(player)]} label={score.toFixed(0)}>
                  {teamScores.filter(el => el.player === Number(player)).map(el => <MenuItem text={el.label} label={(el.score * 1000).toFixed(0)} />)}
                </MenuItem>
              ))}
          </Menu>
        }
        position={'bottom'}
        interactionKind={'hover'}>
        <div>
          <div className='gamestat-scorecard-label'>{team} Score</div>
          <H2><CountUp end={teamScore * 1000 + 1000} preserveValue={true} /></H2>
        </div>
      </Popover2>
    </div>
  )
}

function GameStats({ picks, allCombos, heros, skillDict, playerHeroes }: PropsWithChildren<Props>) {
  let turn = filterNonNullSkills(picks).length + 1

  let scores: ScoreMetric[] = [
    ...Array(10).fill(0).reduce((scores, el, i) => [...scores, ...calculatePlayerScore(skillDict, picks, allCombos, heros, i)], [] as ScoreMetric[]),
    ...calculateTeamScores(picks, allCombos)
  ]

  return (
    <div className="Gamestat-container">
      <Card title="GameStats">
        <div className='gamestat-content'>
          <ScoreCard scores={scores} team='radiant' playerHeroes={playerHeroes} />
          <div className='gamestat-turn-counter'><H2>{turn > 40 ? '--' : turn}</H2><div>Pick</div></div>
          <ScoreCard scores={scores} team='dire' playerHeroes={playerHeroes} />
        </div>
      </Card>
    </div>
  );
}

export default GameStats;
