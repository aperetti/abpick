import React, { PropsWithChildren, useEffect, useState } from 'react';
import './index.css';
import Skill from '../types/Skill';

interface Props {
  skill: Skill
  onClick?: (ctrl: boolean) => void
  picked?: boolean
  edit?: boolean
}

function SkillImage(props: PropsWithChildren<Props>) {
  let { skill, onClick, picked, edit } = props

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
    <div className={`
      skill bp3-dark
      ${picked ? 'skill-picked' : ''}
      ${loading ? 'skill-loading' : ''}
      ${onClick ? 'skill-click' : ''}
      ${edit ? 'skill-edit' : ''}`}
      onClick={(e) => {
        onClick && onClick(e.ctrlKey)
      }}>
      {img && !loading && <img src={img} alt={skill.dname}></img>}
    </div>
  );
}

export default SkillImage;
