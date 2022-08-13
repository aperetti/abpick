import React, { PropsWithChildren, useEffect, useState } from 'react';
import './index.css';
import Skill from '../types/Skill';
import scepter from '../images/scepter.png'
import shard from '../images/shard.png'
import { Icon } from '@blueprintjs/core';

interface Props {
  skill: Skill
  onClick?: (ctrl: boolean) => void
  picked?: boolean
  edit?: boolean
  synergy?: number
  winPct?: number
  disableAgs?: boolean
  small?: boolean
  showPick?: boolean
}

function SkillImage({ small, showPick, skill, onClick, picked, edit, synergy, winPct, disableAgs }: PropsWithChildren<Props>) {
  small = Boolean(small)

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
      skill ${small ? 'skill-small' : ''} bp3-dark
      ${picked ? 'skill-picked' : ''}
      ${loading ? 'skill-loading' : ''}
      ${onClick ? 'skill-click' : ''}
      ${edit ? 'skill-edit' : ''}`}
      onClick={(e) => {
        onClick && onClick(e.ctrlKey)
      }}>
      {((skill.stats.scepterWinW || skill.stats.shardWinW) && !disableAgs) && <div className='skill-ags-container'>
        {skill.stats.scepterWinW && <div className='skill-scepter'><img width={'20px'} src={scepter} alt={"Scepter Win"}></img></div>}
        {skill.stats.shardWinW && <div className='skill-shard'><img width={'20px'} src={shard} alt={"Shard Win"}></img></div>}
      </div>}
      {(synergy || winPct) && <div className={`skill-overlay ${small ? 'skill-overlay-small' : ''}`}>
        {synergy &&
          <div style={{ color: `${synergy > 0 ? 'darkgrey' : 'red'}` }}>
            {!small ? 'Win' : ''} {synergy > 0 ? '+' : ''}{(synergy * 100).toFixed(0)}%
          </div>}
      </div>}
      {showPick &&
        <div className='skill-pick-overlay'>
          {skill.stats.mean.toFixed(0)}
        </div>
      }
      {img && !loading && <img src={img} alt={skill.dname}></img>}
      {skill.abilityId === -1 &&
        <Icon icon='search' size={32} style={{ position: "absolute", top: 16, left: 16 }} />}
    </div>
  );
}

export default SkillImage;
