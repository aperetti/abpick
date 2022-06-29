import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
  onClick: () => void,
  hero: string,
}


function HeroSearchName(props: PropsWithChildren<Props>) {
  return (
    <div className="hero-name-container" onClick={props.onClick}>
      {props.hero || "--Select Hero--"}
    </div>)
}

export default HeroSearchName;
