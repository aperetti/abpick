import React, { PropsWithChildren, useEffect, useState } from 'react';
import './index.css';
import Skill from '../types/Skill';

interface Props {
  skill: Skill
  onClick?: (ctrl: boolean) => void
  picked?: boolean
  edit?: boolean
  synergy?: number
  winPct?: number
}

function SkillImage(props: PropsWithChildren<Props>) {
  let { skill, onClick, picked, edit, synergy, winPct } = props

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
      {(synergy || winPct) && <div className='skill-overlay'>
        {synergy &&
          <div style={{ color: `${synergy > 0 ? 'darkgrey' : 'red'}` }}>
            Win {synergy > 0 ? '+' : ''}{(synergy * 100).toFixed(0)}%
          </div>}
      </div>}
      {img && !loading && <img src={img} alt={skill.dname}></img>}
    </div>
  );
}

export default SkillImage;
