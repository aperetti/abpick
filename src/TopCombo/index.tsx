import React, { PropsWithChildren } from 'react';
import {  SkillDict } from '../App';
import SkillImage from '../SkillImage';
import './index.css';
import { ComboResponse } from '../api/getCombos';

interface Props {
  combo: ComboResponse
  skillDict: SkillDict
  pickedSkills: number[]
}

function TopCombo({combo, skillDict, pickedSkills}: PropsWithChildren<Props>) {

  return (
    <>
            <div>
              <div className='top-combos-combo'>
                <SkillImage picked={pickedSkills.includes(combo.picked)} small skill={skillDict[combo.picked]} disableAgs/>
                <SkillImage picked={pickedSkills.includes(combo.skill)} small skill={skillDict[combo.skill]} disableAgs/>
                <div className='top-combos-overlay'>+{(100 * (combo.synergy)).toFixed(0)}%</div>
              </div>
            </div>
</>
  );
}

export default TopCombo
