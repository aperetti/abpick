import React, { PropsWithChildren} from 'react';
import './index.css';
import { Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
interface Props {
  randomizeBoard: (balance?: boolean) => void
  resetBoard: () => void
  strictMode: boolean
  setStrictMode: (strict: boolean) => void
}

function Controls(props: PropsWithChildren<Props>) {
  return (
          <Popover2
            placement='bottom'
            content={
              <Menu>
                <MenuItem icon="random" label='Randomize Board' onClick={() => props.randomizeBoard(false)} >
                  <MenuItem icon="random" label="True Randomize" onClick={() => props.randomizeBoard(false)} />
                  <MenuItem icon="changes" label="Balanced Randomize" onClick={() => props.randomizeBoard()} />
                </MenuItem>
                <MenuItem icon="reset" label="Reset Board" onClick={props.resetBoard} />
                <MenuItem shouldDismissPopover={false} icon={`${props.strictMode ? 'full-circle': 'circle'}`} label={`${props.strictMode ? 'Disable Strict Mode' : 'Enable Strict Mode'}`} onClick={() => props.setStrictMode(!props.strictMode) } />
              </Menu>
            }
          >Extras</Popover2>
  );
}

export default Controls;
