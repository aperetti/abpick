import React, { PropsWithChildren } from 'react';
import classNames from 'classnames'
import './index.css'; import Skill from '../types/Skill'; import { ContextMenu2 } from '@blueprintjs/popover2';
import SkillDetails from '../SkillDetails';
import SkillImage from '../SkillImage';
import { Classes } from '@blueprintjs/core';

interface Props {
  skill: Skill;
  onClick?: (ctrl: boolean) => void;
  picked?: boolean
  highlight?: boolean
}


function SkillTile({ skill, onClick, picked, highlight }: PropsWithChildren<Props>) {

  let tileClass = classNames("skill", Classes.DARK, {"skill-win": highlight} )


  return (
    <div className={tileClass}>
      <ContextMenu2  content={<SkillDetails skill={skill} ></SkillDetails>} >
        <SkillImage onClick={onClick} skill={skill} picked={picked} />
      </ContextMenu2>
      {!picked && <div className='skill-badge'>

      </div>}
    </div>
  );
}

export default SkillTile;
