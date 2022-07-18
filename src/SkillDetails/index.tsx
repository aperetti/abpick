import React, { useMemo, PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import { VictoryArea, VictoryChart, VictoryLabel, VictoryAxis } from 'victory'
import SkillImage from '../SkillImage';

interface Props {
  skill: Skill;
  skills: Skill[]
}

interface SkillProp {
  desc: string;
}

function SkillDetail(props: PropsWithChildren<SkillProp>) {
  return (
    <div className="skill-detail">
      <div className="skill-desc">{props.desc}</div>
      <div className="skill-content">{props.children}</div>
    </div>
  )

}

let dec = (num: number, pos: number = 2): number => {
  return Math.round(num * 10 ^ pos) / 10 ^ pos
}
interface SkillSynergy {
  skill: Skill
  synergy: number
  winPct: number
}

function SkillDetails(props: PropsWithChildren<Props>) {
  let { skill, skills } = props
  let combos = useMemo(() => (
    skill.stats.combos && Object.entries(skill.stats.combos)
      .reduce<SkillSynergy[]>((comboSkills, el) => {
        let foundCombo = skills.find((skill) => Number(el[0]) === skill.abilityId)
        if (foundCombo) {
          let skillSynergy = { synergy: el[1].synergy, winPct: el[1].winPct, skill: foundCombo }
          return [...comboSkills, skillSynergy]
        } else {
          return comboSkills
        }
      }, []).sort((el1, el2) => el2.synergy - el1.synergy)
  ), [skill, skills])
  return (
    <div className="skill-details">
      <div className="skill-title">{skill.dname}</div>
      <SkillDetail desc="Avg. Pick">{dec(skill.stats.mean, 0)}</SkillDetail>
      <SkillDetail desc="Pick Variation">{dec(skill.stats.std, 0)}</SkillDetail>
      <SkillDetail desc="Win Rate">{`${(skill.stats.winRate * 100).toFixed(1)}%`}</SkillDetail>
      {skill.stats.shardWinW && skill.stats.shardWinWo && <SkillDetail desc="Shard Win Delta">{`${((skill.stats.shardWinW - skill.stats.shardWinWo) * 100).toFixed(1)}%`}</SkillDetail>}
      {skill.stats.scepterWinW && skill.stats.scepterWinWo && <SkillDetail desc="Scepter Win Delta">{`${((skill.stats.scepterWinW - skill.stats.scepterWinWo) * 100).toFixed(1)}%`}</SkillDetail>}
      <div className="skill-subtitle">Predictions</div>
      {skill.predict && <SkillDetail desc="Win">{`${(skill.predict.win * 100).toFixed(1)}%`}</SkillDetail>}
      {skill.predict && <SkillDetail desc="Damage">{`${(skill.predict.damage * 45).toFixed(0)}`}</SkillDetail>}
      {skill.predict && <SkillDetail desc="K/D">{`${(skill.predict.kills * 45).toFixed(0)}\\${(skill.predict.deaths * 45).toFixed(0)}`}</SkillDetail>}
      {skill.predict && <SkillDetail desc="Gold">{`${(skill.predict.gold * 45).toFixed(0)}`}</SkillDetail>}
      <div>
        <div className='skill-subtitle'>Combos</div>
        <div className="skill-detail-combo">{combos && combos.map(comboSkill => <SkillImage disableAgs {...comboSkill}/>)}</div>
      </div>
      <VictoryChart>
        <VictoryLabel
          textAnchor="start" verticalAnchor="middle"
          x={5} y={25}
          style={{ fontSize: '20px', fill: "darkgrey", color: "darkgrey", fontWeight: 800 }}
          text="Skill Survival"
          className="skill-title"
        />
        <VictoryAxis dependentAxis style={{
          axisLabel: { stroke: "#c43a31" },
          axis: { stroke: "#c43a31" },
          tickLabels: { stroke: "#c43a31" },
          ticks: { stroke: "#c43a31", },
        }} />
        <VictoryArea
          name="Survival Rate"
          style={{
            data: { fill: "#c43a31" },
          }}
          data={skill.stats.survival.map((percent, i) => {
            return { pick: i + 1, percent: Math.round(percent * 1000) / 10 }
          })
          }
          x='pick'
          y='percent'
        />
      </VictoryChart>
    </div>
  );
}

export default SkillDetails;
