import React, { PropsWithChildren, useEffect, useState } from 'react';
import './index.css';
import { EditableText, Icon } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2';

interface Props {
  room: string,
  roomCount: number
}


function RoomInfo(props: PropsWithChildren<Props>) {
  let [room, setRoom] = useState(props.room)
  useEffect(() => {
    let node = document.getElementById('join-room-hold')?.childNodes[1]?.childNodes[0] as HTMLInputElement
    if (node && node.tagName.toLowerCase() === 'input') {
      node.select()
      node.setSelectionRange(0, 99999)
    }
  },[room])

return (
  <li data-testid="roomName">
    <Tooltip2 inheritDarkTheme content={`(${props.roomCount}) player connected to room ${props.room}`}>
      <div className='roominfo-content'>
        <span id="join-room-hold">ROOM: <EditableText
          className={room.toLowerCase().length > 5 ? 'edit-join-room' : undefined}
          selectAllOnFocus
          value={room}
          onEdit={() => setRoom(`${window.location.protocol}//${window.location.host}/${props.room}`)}
          onConfirm={() => setRoom(props.room)}
          onCancel={() => setRoom(props.room)}
          onChange={() => setRoom(props.room)}
        /></span>
        <span className='roominfo-indicator'>{Array.from({ length: 5 }, (x, i) => <Icon size={10} className={`${i < props.roomCount ? 'roominfo-active' : ''} roominfo-item`} icon='symbol-circle' />)}</span>
      </div>
    </Tooltip2>
  </li>
);
}

export default RoomInfo;
