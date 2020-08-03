import React, { PropsWithChildren } from 'react';
import './index.css';
import Skill from '../types/Skill';
import { Popover } from '@blueprintjs/core';
import SkillDetails from '../SkillDetails';
import SkillImage from '../SkillImage';

interface Props {
  skill: Skill;
  onClick?: () => void;
  picked?: boolean;
}

function Header(props: PropsWithChildren<Props>) {
  let { skill, onClick, picked } = props

  // let [img, setImg] = useState('')
  // let [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   if (skill) {
  //     setLoading(true)
  //     import(`../images/abilities/${skill.abilityId}.png`).then(loadedImg => {
  //       setImg(loadedImg.default)
  //       setLoading(false)
  //     });
  //   }
  // }, [skill])

  return (
    <div className={`
      skill bp3-dark`}>
      <Popover hoverOpenDelay={100} minimal hoverCloseDelay={0} interactionKind='hover-target' content={<SkillDetails skill={skill} ></SkillDetails>} target={<SkillImage onClick={onClick} skill={skill} picked={picked} />} />
    </div>
  );
}

export default Header;
