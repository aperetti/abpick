import React, { PropsWithChildren, useEffect, useState } from 'react';
import './index.css';
import Skill from '../types/Skill';
import { Popover } from '@blueprintjs/core';
import SkillDetails from '../SkillDetails';

interface Props {
  skill: Skill;
  onClick?: () => void;
  picked?: boolean;
}

function Header(props: PropsWithChildren<Props>) {
  let { skill, onClick, picked } = props

  let [img, setImg] = useState('')
  let [loading, setLoading] = useState(false)

  useEffect(() => {
    if (skill) {
      setLoading(true)
      import(`../images/abilities/${skill.abilityId}.png`).then(loadedImg => {
        setImg(loadedImg.default)
        setLoading(false)
      });
    }
  }, [skill])

  return (
    <div className={`skill bp3-dark ${picked ? 'skill-picked': ''}`} onClick={onClick}>
      {img && !loading && <Popover hoverOpenDelay={100} minimal hoverCloseDelay={0} interactionKind='hover-target' content={<SkillDetails skill={skill} ></SkillDetails>} target={<img src={img} alt={skill.dname}></img>} />}
      {loading && <p>loading</p>}
    </div>
  );
}

export default Header;
