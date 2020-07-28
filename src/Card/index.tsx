import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
  title: string,
  contentClass?: string
}

function Header(props: PropsWithChildren<Props>) {
  return (
    <div className="card">
      <div className="card-title">{props.title}</div>
      <div className={`card-content ${props.contentClass || ''}`}>
        {props.children}
      </div>
    </div>
  );
}

export default Header;
