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

export function SkillDetail(props: PropsWithChildren<SkillProp>) {
  return (
    <>
      <div className="skill-desc">{props.desc}</div>
      <div className="skill-content">{props.children}</div>
</>
  )

}

let dec = (num: number, pos: number = 2): number => {
  return Math.round(num * 10 ^ pos) / 10 ^ pos
}

interface SkillDetailGroupProps {
  title?: string
}

export function SkillDetailGroup({ title, children }: PropsWithChildren<SkillDetailGroupProps>) {
  return (
    <div className='skill-detail-group'>
      {title && <div className="skill-subtitle">{title}</div>}
      <div className='skill-detail-group-content'>
        {children}
      </div>
    </div>
  )
}

function SkillDetails(props: PropsWithChildren<Props>) {
  let { skill } = props
  return (
    <div className="skill-details">
      <div className="skill-title">{skill.dname}</div>
      <SkillDetailGroup>
        <SkillDetail desc="Avg. Pick">{dec(skill.stats.mean, 0)}</SkillDetail>
        <SkillDetail desc="Pick Variation">{dec(skill.stats.std, 0)}</SkillDetail>
        <SkillDetail desc="Win Rate">{`${(skill.stats.winRate * 100).toFixed(1)}%`}</SkillDetail>
        {skill.stats.shardWinW && skill.stats.shardWinWo && <SkillDetail desc="Shard Win Delta">{`${((skill.stats.shardWinW - skill.stats.winRate) * 100).toFixed(1)}%`}</SkillDetail>}
        {skill.stats.scepterWinW && skill.stats.scepterWinWo && <SkillDetail desc="Scepter Win Delta">{`${((skill.stats.scepterWinW - skill.stats.winRate) * 100).toFixed(1)}%`}</SkillDetail>}
        <SkillDetail desc="ID">{skill.abilityId}</SkillDetail>
      </SkillDetailGroup>
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
