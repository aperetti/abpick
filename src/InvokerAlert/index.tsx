import React, { PropsWithChildren, useCallback, useState } from 'react';
import { Button, Dialog } from '@blueprintjs/core'
import Skill from '../types/Skill';
import SkillImage from '../SkillImage';
import './index.css'

interface Props {
  isOpen: boolean
  dismissPopop: () => void
  setSkills: (skills: number[]) => void
  invokerSkills?: Skill[]
}


function InvokerAlert({ isOpen, dismissPopop, setSkills, invokerSkills }: PropsWithChildren<Props>) {
  let [selection, setSelection] = useState<number[]>([])
  let btnCb = useCallback(() => {
    dismissPopop()
    setSkills([...selection, -1])
  }, [dismissPopop, setSkills, selection])

  let skillSelect = useCallback((abilityId: number) => {
    if (selection.includes(abilityId))
      setSelection([...selection].filter(el => el !== abilityId))
    else
      setSelection([...selection, abilityId])
  }, [selection, setSelection])

  return (
    <Dialog isOpen={isOpen} className="bp4-dark invoker-alert">
      <div className='invoker-skills'>
        {invokerSkills && invokerSkills.map((el, i) =>
          <SkillImage
            key={`invoker-${el.abilityId}`}
            skill={el}
            disableAgs
            picked={selection.indexOf(el.abilityId) !== -1}
            onClick={() => skillSelect(el.abilityId)}
          />)}
      </div>
      <Button
        className='invoker-button'
        onClick={btnCb}
        disabled={selection.length !== 3}>
        Select
      </Button>
    </Dialog>

  );
}

export default InvokerAlert;
