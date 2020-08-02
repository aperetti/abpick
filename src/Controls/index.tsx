import React, { PropsWithChildren } from 'react';
import './index.css';
import Card from '../Card';
import { Icon } from '@blueprintjs/core';

interface Props {
  undoPick: () => void
  pickHistory: number[];
}

function Controls(props: PropsWithChildren<Props>) {
  let { undoPick, pickHistory } = props
  return (
    <div className='Controls-container'>
      <Card title="Controls">
        <div className='Controls-actions'>
          <div onClick={() => undoPick()} className={`${pickHistory.length > 0 ? 'Controls-action' : ''}`}>
            <Icon color={`${pickHistory.length > 0 ? 'darkgrey' : 'var(--bg-dark)'}`} iconSize={40} icon='undo' />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Controls;
