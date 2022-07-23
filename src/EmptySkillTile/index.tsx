import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
  small?: boolean
  glow?: boolean
 }

function EmptySkillTile(props: PropsWithChildren<Props>) {

  return (
    <div className={`skill-empty${props.small ? '-small': ''} ${props.glow ? 'skill-empty-glow' : ''}`}></div>
  );
}

export default EmptySkillTile;
