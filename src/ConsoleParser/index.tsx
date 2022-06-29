import React, { PropsWithChildren, useState } from 'react';
import './index.css';
import { Classes, TextArea, Button, Dialog } from '@blueprintjs/core'
import classNames from "classnames";

interface Props {
  submitConsole: (consoleText: string) => void
}

export interface IParserOverlyState {
  autoFocus: boolean;
  canEscapeKeyClose: boolean;
  canOutsideClickClose: boolean;
  enforceFocus: boolean;
  hasBackdrop: boolean;
  isOpen: boolean;
  usePortal: boolean;
  useTallContent: boolean;
}



function ConsoleParser(props: PropsWithChildren<Props>) {
  let [overlayState, setOverlayState] = useState<IParserOverlyState>(
    {
      autoFocus: true,
      canEscapeKeyClose: true,
      canOutsideClickClose: true,
      enforceFocus: true,
      hasBackdrop: true,
      isOpen: false,
      usePortal: true,
      useTallContent: false,
    }
  )

  let submitLog = () => {
    props.submitConsole(consoleText)
    setOverlayState({...overlayState, isOpen: false})
  }

  const classes = classNames(
    Classes.CARD,
    Classes.ELEVATION_4,
    Classes.DARK,
  );

  let [consoleText, setConsoleText] = useState("")
  return (
    <div className='pt-dark'>
      <p onClick={() => setOverlayState({ ...overlayState, isOpen: true })}>Console Parser</p>
      <Dialog {...overlayState} onClose={() => setOverlayState({ ...overlayState, isOpen: false })}>
        <div className={classes}>
            <TextArea value={consoleText} onChange={(evt) => setConsoleText(evt.target.value)}></TextArea>
            <Button onClick={submitLog}>Submit Console</Button>
        </div>
      </Dialog>
    </div>
  );
}

export default ConsoleParser;
