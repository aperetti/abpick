import React, { PropsWithChildren } from 'react';
import { SkillDict } from '../App';
import SkillImage from '../SkillImage';
import './index.css';
import { ComboResponse } from '../api/getCombos';
import { Tooltip2 } from '@blueprintjs/popover2';
import { DARK } from '@blueprintjs/core/lib/esm/common/classes';

interface Props {
  combo: ComboResponse
  skillDict: SkillDict
  pickedSkills: number[]
}

function TopCombo({ combo, skillDict, pickedSkills }: PropsWithChildren<Props>) {

  return (
    <>
      <Tooltip2 portalClassName={DARK} content={<div><p>Matches: {combo.matches}</p><p>Win Rate: {(combo.winPct * 100).toFixed(0)}</p></div>}>
        <div>
          <div className='top-combos-combo'>
            <SkillImage picked={pickedSkills.includes(combo.picked)} small skill={skillDict[combo.picked]} disableAgs />
            <SkillImage picked={pickedSkills.includes(combo.skill)} small skill={skillDict[combo.skill]} disableAgs />
            <div className='top-combos-overlay'>+{(100 * (combo.synergy)).toFixed(0)}%</div>
          </div>
        </div>
      </Tooltip2>
    </>
  );
}

export default TopCombo
