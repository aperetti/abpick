import React, { PropsWithChildren } from 'react';
import './index.css';
import { RecPick, SkillDict } from '../App';
import SkillImage from '../SkillImage';
import Card from '../Card'

interface Props {
  recPicks: RecPick[]
  skillDict: SkillDict
  width: number
}


function MobileRecSkills({ recPicks, skillDict, width }: PropsWithChildren<Props>) {
  let num = Math.floor(width * .9 / 38.5)
  return (
    <div className='mobile-skill-container'>
      <Card title='Recommended Picks'>
        <div className="mobile-skill-details">
          {recPicks
            .slice(0,num)
            .filter(el => skillDict[el.skill] !== undefined && el.bonus > 0)
            .map(el => <SkillImage small skill={skillDict[el.skill]} disableAgs synergy={el.bonus} />)}
        </div>
      </Card>
    </div>
  );
}

export default MobileRecSkills;
