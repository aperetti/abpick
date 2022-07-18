import React, { PropsWithChildren } from 'react';
import './index.css';

interface Props {
  logo: string,

}

function Header(props: PropsWithChildren<Props>) {
  return (
    <div className="header">
      <div className="hdr-base-2"></div>
      <div className="hdr-base"></div>
      <img className="hdr-logo" src={props.logo} alt="logo" height="50" width="80" />

      <ul className="hdr-buttons">
        {props.children}
      </ul>
    </div>
  );
}

export default Header;
