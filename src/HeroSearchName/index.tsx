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


function HeroSearchName(props: PropsWithChildren<Props>) {
  let { skills, slot } = props
  return (
    <div className="hero-name-container" onClick={props.onClick}>
      <div className='hero-name-skills-container'>
        {[0, 1, 2, 3].map(el => {
          let skillSlotIdx = el*12 + slot
          let skillSlot = skills[skillSlotIdx]
          return (skillSlot &&
            <SkillImage small disableAgs skill={skillSlot} />) ||
            <EmptySkillTile small glow={props.activePick === skillSlotIdx}/>
        }
        )}
      </div>
      <div className='hero-name-text '>
        {props.hero || "--Select Hero--"}
      </div>

    </div>)
}

export default HeroSearchName;
