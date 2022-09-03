
import { VictoryChart, VictoryTheme, VictoryArea, VictoryPolarAxis } from 'victory'
import React, { PropsWithChildren } from 'react';
import { SkillMetric } from '../api/getMetrics';

interface BalanceChartProps {
  predictMetrics: SkillMetric
}

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

export default BalanceChart