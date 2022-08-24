import React, { PropsWithChildren } from 'react';
import {  SkillDict } from '../App';
import SkillImage from '../SkillImage';
import './index.css';
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
