import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props { }

function EmptySkillTile(props: PropsWithChildren<Props>) {

  return (
    <div className="skill-empty skill"></div>
  );
}

export default EmptySkillTile;
