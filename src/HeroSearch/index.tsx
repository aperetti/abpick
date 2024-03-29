import React, { PropsWithChildren } from 'react';
import './index.css';
import Ultimate from '../types/Ultimate';
import { Suggest2, ItemRenderer, ItemListPredicate } from '@blueprintjs/select'
import { Button, MenuItem } from '@blueprintjs/core'
import fuzzy from 'fuzzy'
import { DARK } from '@blueprintjs/core/lib/esm/common/classes';

interface Props {
  ultimates: Ultimate[]
  setHero: (id: Ultimate, slot: number) => void
  closeSearch: () => void
  slot: number,
}

const HeroSuggest = Suggest2.ofType<Ultimate>();

const renderString = (strings: string[]) => {
  return (
    <p>{strings.map((el, i) => i % 2 === 1 ? <strong>{el}</strong> : el)}</p>
  )
}

const renderUlt: ItemRenderer<Ultimate> = (ultimate, { handleClick, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  let renderedString

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


const predicateUlts: ItemListPredicate<Ultimate> = (query, ultimates) => {
  return fuzzy.filter(query, ultimates.map((ult) => ult.heroName)).map(res => ultimates[res.index]).slice(0, 10)
}


function HeroSearch(props: PropsWithChildren<Props>) {
  let { ultimates, setHero, slot } = props

  return (
      <div className='hero-search-container'>
        <HeroSuggest
          className={`${DARK} hero-name-input`}
          items={ultimates}
          itemListPredicate={predicateUlts}
          itemRenderer={renderUlt}
          inputValueRenderer={(item) => item.heroName}
          inputProps={{ autoFocus: true }}
          onItemSelect={(ult: Ultimate) => setHero(ult, slot)}
          noResults={<MenuItem disabled={true} text="No results." />} />
        <Button icon='cross' onClick={props.closeSearch} />
      </div>
  );
}

export default HeroSearch;
