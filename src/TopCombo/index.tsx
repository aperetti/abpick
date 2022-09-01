import React, { PropsWithChildren } from 'react';
import { SkillDict } from '../App';
import SkillImage from '../SkillImage';
import Card from '../Card'
import './index.css';
import { ComboResponse } from '../api/getCombos';
import { Popover2 } from '@blueprintjs/popover2';
import { DARK } from '@blueprintjs/core/lib/esm/common/classes';
import { SkillDetail, SkillDetailGroup } from '../SkillDetails';

interface Props {
  combo: ComboResponse
  skillDict: SkillDict
  pickedSkills: number[]
}

function TopCombo({ combo, skillDict, pickedSkills }: PropsWithChildren<Props>) {

  return (
    <>
      <Popover2
        interactionKind='hover'
        popoverClassName={DARK}
        content={
          <Card title="Details">
            <div className='top-combo-tooltip'>
              <SkillDetailGroup>
                <SkillDetail desc="Matches">{combo.matches}</SkillDetail>
                <SkillDetail desc="Win Rate">{(combo.winPct * 100).toFixed(0)}%</SkillDetail>
              </SkillDetailGroup>
            </div>
          </Card>
        }>
        <div>
          <div className='top-combos-combo'>
            <SkillImage picked={pickedSkills.includes(combo.picked)} small skill={skillDict[combo.picked]} disableAgs />
            <SkillImage picked={pickedSkills.includes(combo.skill)} small skill={skillDict[combo.skill]} disableAgs />
            <div className='top-combos-overlay'>+{(100 * (combo.synergy)).toFixed(0)}%</div>
          </div>
        </div>
      </Popover2>
    </>
  );
}

export default TopCombo
