import React, { useMemo, PropsWithChildren, useCallback, useState } from 'react';
import EmptySkillTile from '../EmptySkillTile';
import SkillImage from '../SkillImage';
import Skill from '../types/Skill';
import { arrEquals, derateSkill, filterAvailableCombos, filterAvailableSkills, filterNonNullSkills, getSkillCombos, mapPlayerSkills } from '../utils';
import './index.css';
import { VictoryChart, VictoryTheme, VictoryArea, VictoryPolarAxis } from 'victory'
import { Select2, ItemRenderer } from '@blueprintjs/select';
import { Card, Icon, MenuItem } from '@blueprintjs/core';
import { ComboResponse } from '../api/getCombos';
import getMetrics, { SkillMetric } from '../api/getMetrics';
import { RecPick, SkillDict } from '../App';
import { HeroSkillStats } from '../api/getAllSkills';
import TopCombo from '../TopCombo';


interface PlayerSkillProps {
  pickedSkills: Array<Skill | null>
  skillDict: SkillDict
  heroSkillStats: null | HeroSkillStats
  setSelectedPlayer: (playerSlot: number) => void
  selectedPlayer: number
  slotHeros: (string | null)[]
  topComboDenies: ComboResponse[]
  allCombos: ComboResponse[]
  setRecPicks: (picks: RecPick[]) => void
  skills: (number | null)[],
  nextPlayerTurn?: number,
  recPicks: RecPick[]
  turn: number
}

interface Props { }
interface PredictProps {
  category: string
}

interface BalanceChartProps {
  predictMetrics: SkillMetric
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

const maxMetrics: SkillMetric = {
  gold: 867, damage: 1438,
  kills: 0.44, deaths: 0.09,
  assists: 0.63, xp: 882, tower: 401
}

const minMetrics: SkillMetric = {
  gold: 318, damage: 270,
  kills: .06, deaths: 0.27,
  assists: 0.17, xp: 445, tower: 8.4
}

type MetricKey = keyof SkillMetric

function BalanceChart({ predictMetrics }: PropsWithChildren<BalanceChartProps>) {
  let data = Object.entries(predictMetrics).map(([metric, value]) => {
    let maxMet = maxMetrics[metric as MetricKey]
    let minMet = minMetrics[metric as MetricKey]
    let newValue = (value - minMet) / (maxMet - minMet)
    if (value === 0) {
      newValue = 0
    }

    return { x: metric, y: newValue }
  })
  return (
    <VictoryChart polar
      theme={VictoryTheme.grayscale}
      domain={{ y: [0, 1] }}
    >
      <VictoryArea key={0} data={data} style={{ data: { fillOpacity: 0.2, strokeWidth: 2, fill: 'darkgrey' } }} />
      {data.map((el, i) =>
        <VictoryPolarAxis key={i} dependentAxis
          style={{
            axisLabel: { padding: 20, fill: "darkgrey" },
            axis: { stroke: "none" },
            grid: { stroke: "grey", strokeWidth: 0.25, opacity: 0.5 }
          }}
          labelPlacement="perpendicular"
          axisValue={i + 1} label={el.x === "deaths" ? "survival" : el.x}
          tickCount={4}
          tickFormat={el => ''}
          tickValues={[.25, .5, .75]}
        />
      )}
      <VictoryPolarAxis
        labelPlacement="parallel"
        tickFormat={() => ""}
        style={{
          axis: { stroke: "none" },
          grid: { stroke: "grey", opacity: 0.5 }
        }}
      />
    </VictoryChart>
  )
}
const defaultSkillMetrics = { gold: 0, xp: 0, damage: 0, kills: 0, deaths: 0, assists: 0, tower: 0 }

function PlayerSkillContainer({ turn, recPicks, nextPlayerTurn, skills, setRecPicks, allCombos, heroSkillStats, topComboDenies, setSelectedPlayer, slotHeros, selectedPlayer, pickedSkills, skillDict }: PropsWithChildren<PlayerSkillProps>) {
  let playerSkills = mapPlayerSkills(selectedPlayer, pickedSkills)
  let [metrics, setMetrics] = useState<SkillMetric>(defaultSkillMetrics)
  let [lastRun, setLastRun] = useState<number[]>([])

  let pickedskillIds = filterNonNullSkills(pickedSkills).map(el => el.abilityId)
  let sortFn = useCallback((el1: HeroNameSlot, el2: HeroNameSlot) => {
    let l1 = el1.slot % 2 === 0 ? el1.slot : el1.slot + 100
    let l2 = el2.slot % 2 === 0 ? el2.slot : el2.slot + 100
    return l1 - l2
  }, [])

  let playerHasUlt = playerSkills[3] !== null
  let playerNeedsUlt = playerSkills.slice(0,3).every(el => el !== null)
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

  let sortCombo = useCallback((el1: ComboResponse, el2: ComboResponse) => (el2.winPct - el2.avgWinPct) - (el1.winPct - el1.avgWinPct), [])
  let goodCombos = filterAvailableCombos(getSkillCombos(allCombos, skillIds), pickedskillIds).slice(0, 8)

  let topCombos = useMemo(() => allCombos.sort(sortCombo).slice(0, 10), [allCombos, sortCombo])

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
    .filter(el => !pickedskillIds.includes(el.id))
    .sort((el1, el2) => skillDict[el1.id].stats.mean - skillDict[el2.id].stats.mean)

  useMemo(() => {
    let skillRate = filterNonNullSkills(skills).reduce((dict, el) => {
      dict[el] = 0
      return dict
    }, {} as Record<number, number>)

    bestHeroModelSkills?.forEach(el => {
      skillRate[el.id] += el.winRate - .5
    })

    goodCombos.forEach(el => {
      skillRate[el.skill] += el.winPct - .5
    })

    topComboDenies.forEach(el => {
      skillRate[el.skill] += el.synergy
    })

    filterAvailableSkills(skills, pickedskillIds).forEach(el => {
      let skill = skillDict[el]
      if (nextPlayerTurn && skill.stats.mean < nextPlayerTurn) {
        skillRate[el] += skill.stats.winRate - .45
      }
    })

    let newRecPicks = Object.entries(skillRate).map(entries => {
      let [id, number] = entries
      let el = skillDict[Number(id)]
      if (el)
        return [Number(id), derateSkill(turn, el.stats.mean) * number]
      else
        return [Number(id), 0]
    }).sort((el1, el2) => - el1[1] + el2[1])
      .map(el => ({ skill: el[0], bonus: el[1] }))
      .filter(el => el.bonus > .01 && !(playerHasUlt && skillDict[el.skill].ult) && !(!skillDict[el.skill].ult && playerNeedsUlt))

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