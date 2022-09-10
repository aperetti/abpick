import React, { useMemo, PropsWithChildren, useState } from 'react';
import EmptySkillTile from '../EmptySkillTile';
import SkillImage from '../SkillImage';
import Skill from '../types/Skill';
import { arrEquals, derateSkill, filterAvailableCombos, filterAvailableSkills, filterNonNullSkills, getSkillCombos, mapPlayerSkills } from '../utils';
import './index.css';
import { Select2, ItemRenderer } from '@blueprintjs/select';
import { Card, Icon, MenuItem } from '@blueprintjs/core';
import { ComboResponse } from '../api/getCombos';
import getMetrics, { SkillMetric } from '../api/getMetrics';
import { RecPick, SkillDict } from '../App';
import { HeroSkillStats } from '../api/getAllSkills';
import TopCombo from '../TopCombo';
import { calculatePlayerScore, calculateTeamScores } from '../GameStats';
import BalanceChart from './BalanceChart'

interface PlayerSkillProps {
  pickedSkills: Array<Skill | null>
  skillDict: SkillDict
  allHeroSkillStats: (null | HeroSkillStats)[]
  setSelectedPlayer: (playerSlot: number) => void
  selectedPlayer: number
  slotHeros: (string | null)[]
  topComboDenies: ComboResponse[]
  allCombos: ComboResponse[]
  setRecPicks: (picks: RecPick[]) => void
  skills: (number | null)[],
  recPicks: RecPick[]
  turn: number
}

interface Props { }
interface PredictProps {
  category: string
}


interface HeroNameSlot {
  slot: number,
  name: string | null
}

interface PlayerSectionProps {
  title: string
}

function PlayerSection({ title, children }: PropsWithChildren<PlayerSectionProps>) {
  let [hide, setHide] = useState(false)
  return (
    <div className='player-skill-section'>
      <div className='player-skill-section-title' onClick={() => setHide(!hide)}>
        {title}
        <Icon size={12} style={{ float: "right" }} icon={hide ? "expand-all" : "minimize"} />
      </div>
      {!hide && children}
    </div>
  )
}

const HeroSlotSelect = Select2.ofType<HeroNameSlot>();

const renderHeroSlot: ItemRenderer<HeroNameSlot> = (heroSlotName, { handleClick, modifiers, query }) => {
  let { slot, name } = heroSlotName
  return (
    <MenuItem
      data-testid={slot}
      active={modifiers.active}
      disabled={modifiers.disabled || !name}
      key={`hero-slot-${slot}`}
      onClick={handleClick}
      text={`${slot % 2 === 0 ? 'R' : 'D'}${Math.floor(slot / 2) + 1} - ${name || 'Needs Selection'}`}
    />
  );
};

let sortCombo = (el1: ComboResponse, el2: ComboResponse) => (el2.winPct - el2.avgWinPct) - (el1.winPct - el1.avgWinPct)
let sortFn = (el1: HeroNameSlot, el2: HeroNameSlot) => {
  let l1 = el1.slot % 2 === 0 ? el1.slot : el1.slot + 100
  let l2 = el2.slot % 2 === 0 ? el2.slot : el2.slot + 100
  return l1 - l2
}

const defaultSkillMetrics = { gold: 0, xp: 0, damage: 0, kills: 0, deaths: 0, assists: 0, tower: 0 }

function PlayerSkillContainer({ turn, recPicks, skills, setRecPicks, allCombos, allHeroSkillStats, topComboDenies, setSelectedPlayer, slotHeros, selectedPlayer, pickedSkills, skillDict }: PropsWithChildren<PlayerSkillProps>) {
  let playerSkills = mapPlayerSkills(selectedPlayer, pickedSkills)
  let [metrics, setMetrics] = useState<SkillMetric>(defaultSkillMetrics)
  let [lastRun, setLastRun] = useState<number[]>([])

  let pickedskillIds = filterNonNullSkills(pickedSkills).map(el => el.abilityId)
  let heroSkillStats = allHeroSkillStats[selectedPlayer]

  let playerHasUlt = playerSkills[3] !== null
  let playerNeedsUlt = playerSkills.slice(0, 3).every(el => el !== null)
  let skillIds = filterNonNullSkills(playerSkills).map(el => el.abilityId)
  if (!arrEquals(skillIds, lastRun)) {
    setLastRun(skillIds)
    if (skillIds.length > 0) {
      let call = async () => {
        if (playerSkills.length > 0) {
          let newMetrics = await getMetrics(filterNonNullSkills(playerSkills).map(el => el.abilityId))
          setMetrics(newMetrics)
        }
      }
      call()
    } else if (skillIds.length === 0) {
      setMetrics(defaultSkillMetrics)
    }
  }

  let goodCombos = filterAvailableCombos(getSkillCombos(allCombos, skillIds), pickedskillIds).slice(0, 8)

  let topCombos = useMemo(() => allCombos.sort(sortCombo).slice(0, 10), [allCombos])

  let mostCombos = useMemo(() => Object.entries(allCombos.reduce<Record<number, number>>((summary, el) => {
    let skills = [el.picked, el.skill]
    skills.forEach(el => {
      if (!(el in summary)) {
        summary[el] = 0
      }
      summary[el] += 1
    })
    return summary
  }, {})).sort((el1, el2) => el2[1] - el1[1]).splice(0, 8).map(el => [Number(el[0]), el[1]]), [allCombos])

  let bestHeroModelSkills = heroSkillStats?.skills
    .filter(el => !pickedskillIds.includes(el.id) && skillDict[el.id] && skills.includes(el.id))
    .sort((el1, el2) => skillDict[el1.id].stats.mean - skillDict[el2.id].stats.mean)


  useMemo(() => {
    let team = selectedPlayer % 2 === 0 ? 'radiant' : 'dire'

    let bonusBaselines = [
          ...calculatePlayerScore(skillDict, pickedSkills.map(el => el?.abilityId || null), allCombos, allHeroSkillStats, selectedPlayer),
          ...calculateTeamScores(skills, allCombos)
        ].filter(el => el.team === team)

    let bonusBaseline = bonusBaselines.reduce((bonus, el) => {
            return bonus + el.score
          }, 0)

    let newRecPicks: RecPick[] = filterAvailableSkills(skills, pickedskillIds)
      .filter(el => !(playerHasUlt && skillDict[el].ult) && !(!skillDict[el].ult && playerNeedsUlt))
      .map(el => {
        let newPicks = [...pickedSkills].map(el => el?.abilityId || null)
        let newPlayerSkills = playerSkills.map(el => el?.abilityId || null)
        let idx = newPlayerSkills.findIndex(el => el === null)
        newPlayerSkills[idx] = el
        newPlayerSkills.forEach((el, i) => newPicks[i*10 + selectedPlayer] = el)
        let bonuses = [
          ...calculatePlayerScore(skillDict, newPicks, allCombos, allHeroSkillStats, selectedPlayer),
          ...calculateTeamScores(newPicks, allCombos)
        ].filter(el => el.team === team)

        let bonusScore = bonuses.reduce((bonus, el) => {
            return bonus + el.score
          }, 0)

        return {
          skill: el,
          bonus: (bonusScore - bonusBaseline ) * derateSkill(turn, skillDict[el].stats.mean),
          detaills: bonuses
        }
      }).sort((el1, el2) => el2.bonus - el1.bonus)
    setRecPicks(newRecPicks)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(skills), JSON.stringify(pickedSkills), selectedPlayer])

  return (
    <div className={"Player-Skill-Container"}>
      <HeroSlotSelect
        popoverTargetProps={{ className: 'hero-slot-button' }}
        itemRenderer={renderHeroSlot}
        items={slotHeros.map((el, i) => ({ slot: i, name: el })).sort(sortFn)}
        onItemSelect={(el => setSelectedPlayer(el.slot))}>
        <Card className='hero-slot-label' interactive elevation={3}>{`${selectedPlayer === 2 ? 'R' : 'D'}${Math.floor(selectedPlayer / 2) + 1} - ${slotHeros[selectedPlayer] || 'Select a hero'}`}</Card>
      </HeroSlotSelect>
      <div className={`player-skill-skills`}>
        {playerSkills.map((skillSlot, i) =>
          (
            skillSlot &&
            <SkillImage key={i} small disableAgs skill={skillSlot} />) ||
          <EmptySkillTile key={i} small />
        )}
      </div>
      <div className='player-skill-chart-container'>
        <div className='player-skill-chart'>
          <BalanceChart predictMetrics={metrics} />
        </div>
      </div>
      {recPicks.length > 0 && <PlayerSection title='Recommended Pick'>
        <div className='player-skill-combos'>
          {recPicks.slice(0, 4).map(el => <SkillImage skill={skillDict[el.skill]} synergy={el.bonus} showPick small disableAgs />)}
        </div>
      </PlayerSection>}
      {goodCombos.length > 0 && <PlayerSection title='Combos'>
        <div className='player-skill-combos'>
          {goodCombos.map((el, i) => <SkillImage key={i} synergy={el.winPct - el.avgWinPct} skill={skillDict[el.skill]} small disableAgs showPick />)}
        </div>
      </PlayerSection>}

      {topComboDenies.length > 0 && <PlayerSection title="Best Deny Picks">
        <div className='player-skill-combos'>
          {topComboDenies.map((el, i) => <SkillImage key={i} synergy={el.winPct - el.avgWinPct} skill={skillDict[el.skill]} small disableAgs showPick />)}
        </div>
      </PlayerSection>}
      {heroSkillStats && heroSkillStats.skills.length > 0 && <PlayerSection title="Best Hero Model Skills">
        <div className='player-skill-combos'>
          {bestHeroModelSkills && bestHeroModelSkills
            .filter(el => el.winRate > 0.5)
            .sort((el1, el2) => el2.winRate - el1.winRate)
            .slice(0, 4)
            .map((el, i) => <SkillImage key={i} synergy={el.winRate - .5} skill={skillDict[el.id]} small disableAgs showPick />)}
        </div>
      </PlayerSection>}
      {allCombos.length > 0 && <PlayerSection title='Best Combos'>
        <div className='player-skill-combos'>
          {topCombos.map((combo, i) => <TopCombo key={i} skillDict={skillDict} combo={combo} pickedSkills={pickedskillIds} />)}
        </div>
      </PlayerSection>}
      {allCombos.length > 0 && <PlayerSection title='Most Combos'>
        <div className='player-skill-combos'>
          {mostCombos.map(combo => <SkillImage picked={pickedskillIds.includes(combo[0])} showPick bottomText={`${combo[1]} Cs`} small skill={skillDict[combo[0]]} disableAgs />)}
        </div>
      </PlayerSection>}

    </div>
  );
}

export function PlayerPickedSkills(props: PropsWithChildren<Props>) {
  return (
    <div className={"Player-Skill-Container-Picked"}>
      <div className={"Player-Skill-Title"}>Picked Skills</div>
      <div className={"Player-Skill-Container-Picked-Skills"}>
        {props.children}
      </div>
    </div>
  );
}


export function PlayerPredictSkills(props: PropsWithChildren<PredictProps>) {
  return (
    <div className={"Player-Skill-Container-Picked"}>
      <div className={"Player-Skill-Title"}>{props.category}</div>
      <div>
        {props.children}
      </div>
    </div>
  );
}
export default PlayerSkillContainer