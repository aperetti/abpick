import React, { PropsWithChildren } from 'react';
import './index.css';
import { EditableText, Icon } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2';

interface Props {
  room: string,
  roomCount: number
}


function RoomInfo(props: PropsWithChildren<Props>) {
  return (
    <li data-testid="roomName">
      <Tooltip2 inheritDarkTheme content={`(${props.roomCount}) player connected to room ${props.room}`}>
        <div className='roominfo-content'>
          <span>Room: <EditableText selectAllOnFocus value={props.room} /></span>
          <span className='roominfo-indicator'>{Array.from({ length: 5 }, (x, i) => <Icon size={10} className={`${i < props.roomCount ? 'roominfo-active' : ''} roominfo-item`} icon='symbol-circle' />)}</span>
        </div>
      </Tooltip2>
    </li>
  );
}

export default RoomInfo;
