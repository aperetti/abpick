import React, { PropsWithChildren, useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { SxProps, Theme } from '@mui/system';
import Skill, { SkillClick } from '../types/Skill'
import './index.css';
import SkillImage from '../SkillImage';

interface Props {
  skills: Array<Skill>
  turn: number
  pickSkill: SkillClick
}


const sx: SxProps<Theme> = {
  '& .MuiDataGrid-columnHeader:hover': {
    color: "white",
  },
  '& .MuiDataGrid-columnHeader': {
    background: "#101010",
    color: "darkgray",
    fontSize: "10px",
    textTransform: "uppercase",
    display: "block",
    padding: "4px",
    paddingLeft: "10px",
    fontWeight: "bold",
  },
  '& .MuiDataGrid-columnHeaders': {
    background: "rgba(0,0,0,.85)"
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    lineHeight: "10px",
    whiteSpace: "pre-wrap"
  },
  '& .MuiDataGrid-cell:hover': {
    color: 'white',
  },
  '& .MuiDataGrid-cell': {
    color: 'darkgray'
  },
  '& .MuiToolbar-root': {
    color: 'darkgray'
  },
  '& .MuiToolbar-root:hover': {
    color: 'white'
  },
  '& .MuiSvgIcon-root': {
    color: 'darkgoldenrod'
  },
  background: "linear-gradient(var(--bg-light), var(--bg-norm))",
  boxShadow: "2px 2px 4px #101010",
  border: "none"
}

const valueFormatter = (scale: number = 1, decimals: number = 0, suffix='') =>
  (params: GridValueFormatterParams<number|undefined>) =>
  params.value === undefined ? `--` : `${(params.value * scale).toFixed(decimals)}${suffix}`


function SkillDatatable(props: PropsWithChildren<Props>) {

  let { skills, turn, pickSkill } = props
  let round = Math.floor(turn / 10)
  let formattedSkills = skills.map((skill) => ({
    ...skill,
    avgPick: skill.stats.mean,
    pickRate: skill.stats.pickRate,
    pickRateRounds: skill.stats.pickRateRounds[round],
    winRate: skill.stats.winRate,
    winRateRounds: skill.stats.winRateRounds[round],
    survival: skill.stats.survival[turn],
    survival5: skill.stats.survival[turn + 5],
    survival10: skill.stats.survival[turn + 10],
    predictWin: skill.predict?.win,
    predictGold: skill.predict?.gold,
    predictDamage: skill.predict?.damage,
    predictKills: skill.predict?.kills,
    predictDeaths: skill.predict?.deaths
  })

  )

  let columns = useMemo(() => [
    { field: "abilityName", headerName: "Ability", renderCell: (params: GridRenderCellParams) => <SkillImage skill={params.row} onClick={pickSkill(params.row)} disableAgs /> },
    { field: "avgPick", headerName: "Average Pick", valueFormatter: valueFormatter(1,0)},
    { field: "pickRate", headerName: "Percent Picked", valueFormatter: valueFormatter(100,0,'%')},
    { field: "winRate", headerName: "Win Rate", valueFormatter: valueFormatter(100,0,'%')},
    { field: "survival", headerName: "Survival", valueFormatter: valueFormatter(100, 0, '%')},
    { field: "survival5", headerName: "Survival 5 Turns", valueFormatter: valueFormatter(100,0,'%')},
    { field: "survival10", headerName: "Survival 10 Turns", valueFormatter: valueFormatter(100,0,'%')},
    { field: "predictWin", headerName: "Win Prediction", valueFormatter: valueFormatter(100,0,'%')},
    { field: "predictDamage", headerName: "Damage Prediction", valueFormatter: valueFormatter(.001*45,1,'k')},
    { field: "predictGold", headerName: "Gold Prediction", valueFormatter: valueFormatter(.001*45,1,'k')},
    { field: "predictKills", headerName: "Kill Prediction", valueFormatter: valueFormatter(45,0)},
    { field: "predictDeaths", headerName: "Death Prediction", valueFormatter: valueFormatter(45,0)}
  ], [pickSkill])

  return (
    <DataGrid
      sx={sx}
      initialState={{
        sorting: {
          sortModel: [{ field: 'avgPick', sort: 'asc' }],
        },
      }}
      columns={columns}
      rows={formattedSkills}
    />
  );
}

export default SkillDatatable;