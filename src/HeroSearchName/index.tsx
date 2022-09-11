import React, { PropsWithChildren} from 'react';
import { NullableSkillList } from '../App';
import EmptySkillTile from '../EmptySkillTile';
import SkillImage from '../SkillImage';
import './index.css';
import {  mapPlayerSkills } from '../utils';

interface Props {
  onClick: () => void,
  hero: string | null,
  slot: number,
  skills: NullableSkillList,
  activePick: number,
}

function HeroSearchName({ onClick, hero, slot, skills, activePick }: PropsWithChildren<Props>) {
  let selectedSlot = activePick % 10 === slot && activePick < 40

  let slotSkills = mapPlayerSkills(slot, skills)
  return (
    <div className="hero-name-container" onClick={onClick}>
      <div className={`hero-name-skills-container ${selectedSlot ? 'hero-name-skills-glow' : ''}`}>
        {slot !== 10 && slot !== 11 && slotSkills.map((skillSlot, i) =>
          (
            skillSlot &&
            <SkillImage key={i} small disableAgs skill={skillSlot} />) ||
          <EmptySkillTile key={i} small />

        )}
      </div>
      <div className='hero-name-text '>
        {hero || "--Select Hero--"}
      </div>

    </div>)
}

export default HeroSearchName;
