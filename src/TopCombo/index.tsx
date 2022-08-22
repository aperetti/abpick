import React, { useMemo, PropsWithChildren } from 'react';
import { NullableSkillList, SkillDict } from '../App';
import SkillImage from '../SkillImage';
import Skill from '../types/Skill';
import './index.css';
import { DraftBoardColumn } from '../DraftBoard'
import Card from '../Card'
import { ComboResponse } from '../api/getCombos';

interface Props {
  combo: ComboResponse
  skillDict: SkillDict
}

function TopCombo({combo, skillDict}: PropsWithChildren<Props>) {

  return (
    <>
            <div>
              <div className='top-combos-combo'>
                <SkillImage small skill={skillDict[combo.picked]} disableAgs/>
                <SkillImage small skill={skillDict[combo.skill]} disableAgs/>
                <div className='top-combos-overlay'>Win +{(100 * (combo.winPct - combo.avgWinPct)).toFixed(0)}%</div>
              </div>
            </div>
</>
  );
}

export default TopCombo
