import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import { VictoryArea, VictoryChart } from 'victory'

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
      <VictoryChart>
        <VictoryArea
          style={{ data: { fill: "#c43a31" } }}
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
