import React, { PropsWithChildren} from 'react';
import './index.css';
import { Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
interface Props {
  randomizeBoard: () => void
  resetBoard: () => void
}

function Controls(props: PropsWithChildren<Props>) {
  return (
          <Popover2
            placement='bottom'
            content={
              <Menu>
                <MenuItem icon="random" label="Randomize Board" onClick={props.randomizeBoard} />
                <MenuItem icon="reset" label="Reset Board" onClick={props.resetBoard} />
              </Menu>
            }
          >Extras</Popover2>
  );
}

export default Controls;
