import React, { PropsWithChildren, useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridComparatorFn } from '@mui/x-data-grid';
import { SxProps, Theme } from '@mui/system';
import Skill, {SkillClick} from '../types/Skill'
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

const stringCompare: GridComparatorFn<string> = (v1, v2) => Number(v1) - Number(v2)

function SkillDatatable(props: PropsWithChildren<Props>) {

  let { skills, turn, pickSkill } = props
  let round = Math.floor(turn / 10)
  let formattedSkills = skills.map((skill) => {
    return {
      ...skill,
      avgPick: Number(skill.stats.mean).toFixed(0),
      pickRate: (Number(skill.stats.pickRate) * 100).toFixed(0),
      pickRateRounds: (Number(skill.stats.pickRateRounds[round]) * 100).toFixed(0),
      winRate: (Number(skill.stats.winRate) * 100).toFixed(0),
      winRateRounds: (Number(skill.stats.winRateRounds[round]) * 100).toFixed(0),
      survival: (Number(skill.stats.survival[turn]) * 100).toFixed(0),
      survival5: (Number(skill.stats.survival[turn + 5]) * 100).toFixed(0),
      survival10: (Number(skill.stats.survival[turn + 10]) * 100).toFixed(0),
    }
  })

    let columns = useMemo(() => [
    { field: "abilityName", headerName: "Ability", renderCell: (params: GridRenderCellParams) => <SkillImage skill={params.row} onClick={pickSkill(params.row)} /> },
    { field: "avgPick", headerName: "Average Pick", sortComparator: stringCompare },
    { field: "pickRate", headerName: "Percent Picked", sortComparator: stringCompare },
    { field: "winRate", headerName: "Win Rate", sortComparator: stringCompare },
    { field: "survival", headerName: "Survival", sortComparator: stringCompare },
    { field: "survival5", headerName: "Survival 5 Turns", sortComparator: stringCompare },
    { field: "survival10", headerName: "Survival 10 Turns", sortComparator: stringCompare }
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