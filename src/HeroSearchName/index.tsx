import React, { PropsWithChildren } from 'react';
import { NullableSkillList } from '../App';
import EmptySkillTile from '../EmptySkillTile';
import SkillImage from '../SkillImage';
import './index.css';

interface Props {
  onClick: () => void,
  hero: string | null,
  slot: number,
  skills: NullableSkillList,
  activePick: number
}


function HeroSearchName({onClick, hero, slot, skills, activePick}: PropsWithChildren<Props>) {
  return (
    <div className="hero-name-container" onClick={onClick}>
      { <div className={`hero-name-skills-container ${activePick % 10 === slot && activePick < 40  ? 'hero-name-skills-glow' : ''}`}>
        {slot !== 10 && slot !== 11 && [0, 1, 2, 3].map(el => {
          let skillSlotIdx = el*10 + slot
          let skillSlot = skills[skillSlotIdx]
          return (skillSlot &&
            <SkillImage small disableAgs skill={skillSlot} />) ||
            <EmptySkillTile small />
        }
        )}
      </div>}
      <div className='hero-name-text '>
        {hero || "--Select Hero--"}
      </div>

    </div>)
}

export default HeroSearchName;
