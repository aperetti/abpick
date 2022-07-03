import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import { VictoryArea, VictoryChart, VictoryLabel, VictoryAxis } from 'victory'

interface Props {
  skill: Skill;
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

function SkillDetails(props: PropsWithChildren<Props>) {
  let { skill } = props

  return (
    <div className="skill-details">
      <div className="skill-title">{skill.dname}</div>
      <SkillDetail desc="Avg. Pick">{dec(skill.stats.mean, 0)}</SkillDetail>
      <SkillDetail desc="Pick Variation">{dec(skill.stats.std, 0)}</SkillDetail>
      <SkillDetail desc="Win Rate">{`${(skill.stats.winRate * 100).toFixed(1)}%`}</SkillDetail>
      <div className="skill-subtitle">Predictions</div>
      {skill.predict && <SkillDetail desc="Win">{`${(skill.predict.win * 100).toFixed(1)}%`}</SkillDetail>}
      {skill.predict && <SkillDetail desc="Damage">{`${(skill.predict.damage * 45).toFixed(0)}`}</SkillDetail>}
      {skill.predict && <SkillDetail desc="K/D">{`${(skill.predict.kills * 45).toFixed(0)}\\${(skill.predict.deaths * 45).toFixed(0)}`}</SkillDetail>}
      {skill.predict && <SkillDetail desc="Gold">{`${(skill.predict.gold * 45).toFixed(0)}`}</SkillDetail>}

      <VictoryChart>
        <VictoryLabel
          textAnchor="start" verticalAnchor="middle"
          x={5} y={25}
          style={{ fontSize: 20, fill: "white", color: "white", fontWeight: 400 }}
          text="Skill Survival"
          className="skill-graph-title"
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
