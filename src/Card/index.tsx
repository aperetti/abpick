import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
  title: string,
  contentClass?: string
  small?: boolean
}

function Header({title, contentClass, small, children}: PropsWithChildren<Props>) {
  return (
    <div className="card">
      <div
        style={{fontSize: small ? '10px' : undefined, paddingLeft: small ? '2px' : undefined}}
        className={`card-title`}>
          {title}
      </div>
      <div className={`card-content ${contentClass || ''}`}>
        {children}
      </div>
    </div>
  );
}

export default Header;
