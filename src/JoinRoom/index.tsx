import React, { PropsWithChildren, useState } from 'react';
import './index.css';
import { InputGroup, Button } from '@blueprintjs/core'

interface Props {
  joinRoom: (room: string) => void
}

let createHandler = (setRoom: (room: string) => void) => (evt: React.ChangeEvent<HTMLInputElement>) => {
  let input = evt.target.value
  input = input.toLocaleUpperCase().slice(0,5)
  setRoom(input)
}

function JoinRoom(props: PropsWithChildren<Props>) {
  let [room, setRoom] = useState("")
  return (
    <div>
      <InputGroup large value={room} onChange={createHandler(setRoom)} fill rightElement={<Button disabled={room.length !== 5} onClick={() => props.joinRoom(room)} minimal icon="arrow-right"></Button>}></InputGroup>
    </div>
  );
}

export default JoinRoom;
