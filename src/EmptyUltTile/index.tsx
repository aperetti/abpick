import React, { PropsWithChildren } from 'react';
import './index.css';
import Ultimate from '../types/Ultimate';
import { Select, ItemRenderer, ItemPredicate } from '@blueprintjs/select'
import { MenuItem } from '@blueprintjs/core'
import fuzzy from 'fuzzy'
import Skill from '../types/Skill';
import SkillImage from '../SkillImage'

interface Props {
  ultimates: Ultimate[]
  setHero: (id: number, slot: number) => void
  slot: number
  skill: Skill | null
}

const UltSelect = Select.ofType<Ultimate>();

const renderString = (strings: string[]) => {
  return (
    <p>{strings.map((el, i) => i % 2 === 1 ? <strong>{el}</strong> : el)}</p>
  )
}

const renderUlt: ItemRenderer<Ultimate> = (ultimate, { handleClick, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  let matchAbility = fuzzy.match(query, ultimate.abilityName, { pre: "##", post: "##" })
  let strings
  let renderedString
  if (matchAbility) {
    strings = matchAbility.rendered.split("##")
    renderedString = renderString(strings)
  } else {
    renderedString = <p>{ultimate.abilityName}</p>
  }

  let matchHero = fuzzy.match(query, ultimate.heroName, { pre: "##", post: "##" })
  let stringsHero
  let renderedStringHero
  if (matchHero) {
    stringsHero = matchHero.rendered.split("##")
    renderedStringHero = renderString(stringsHero)
  } else {
    renderedString = <p>{ultimate.heroName}</p>
  }


  return (
    <MenuItem
      data-testid={`ultSelect${ultimate.abilityId}`}
      active={modifiers.active}
      disabled={modifiers.disabled}
      labelElement={renderedStringHero}
      key={ultimate.abilityId}
      onClick={handleClick}
      text={renderedString}
    />
  );
};

const predicateUlt: ItemPredicate<Ultimate> = (query, ultimate) => {
  return fuzzy.test(query, ultimate.abilityName) || fuzzy.test(query, ultimate.heroName)
}


function EmptyUltTile(props: PropsWithChildren<Props>) {
  let { ultimates, setHero, slot, skill } = props

  return (
    (ultimates.length >= 0 && <UltSelect
      className="bp3-dark"
      items={ultimates}
      itemPredicate={predicateUlt}
      itemRenderer={renderUlt}
      popoverProps={{ minimal: true }}
      onItemSelect={(ult: Ultimate) => setHero(ult.heroId, slot)}
      noResults={<MenuItem disabled={true} text="No results." />}>
      <div data-testid={`emptyUltTile${slot}`} className="ult-skill-empty skill">{skill && <SkillImage skill={skill} edit />}</div>

    </UltSelect>) || <div></div>
  );
}

export default EmptyUltTile;
