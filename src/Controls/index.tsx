import React, { PropsWithChildren} from 'react';
import './index.css';
import { Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
interface Props {
  randomizeBoard: () => void
}

function Controls(props: PropsWithChildren<Props>) {
  let { randomizeBoard } = props
  return (
          <Popover2
            placement='bottom'
            content={
              <Menu>
                <MenuItem icon="random" label="Randomize Board" onClick={randomizeBoard} />
              </Menu>
            }
          >Extras</Popover2>
  );
}

export default Controls;
