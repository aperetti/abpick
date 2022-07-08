import React, { PropsWithChildren, useState } from 'react';
import './index.css';
import { Overlay, Classes, Tabs, Tab } from '@blueprintjs/core';
import classNames from 'classnames'
import selectHero from '../images/help/select-hero.gif'
import selectUlt from '../images/help/ultimate-search.gif'
import pickingSkills from '../images/help/picking-skills.gif'
import predictingSkills from '../images/help/predicting-skills.gif'
import rooms from '../images/help/rooms.gif'
import overview from '../images/help/overview.gif'
interface Props {
}

const Overview =
  <div className="Help-Content">
    <div>
      <p>The simulator allows you to draft in real-time and get quick insights into what skills are picked the most.</p>
      <p>
        Each player is given a random hero with no abilities. The pool of abilities consists of the abilities of
        these 10 random heroes, plus 2 additional random heroes' abilities. Players then take turns drafting the
        3 regular abilities and 1 ultimate ability they want.
      </p>
    </div>
    <div>
      <img width='750px' src={overview} alt="Select hero slot and start typing in the name" />
    </div>
  </div>

const SelectingHero =
  <div className="Help-Content">
    <div>
      <p>First step is to select the heros associated to the draft. The hero prompt will open automatically and on pressing enter
        the hero will be selected and the next hero slot prompt will be opened.
      </p>
    </div>
    <div>
      <img src={selectHero} alt="Select hero slot and start typing in the name" />
    </div>
  </div>

const SelectingUlt =
  <div className="Help-Content">
    <div>
      <p>The hero may also be selected by clicking in the ultimate skill area. This is useful sometimes for the 6th and 12th position heros.</p>
    </div>
    <div>
      <img src={selectUlt} alt="Select hero slot and start typing in the name" />
    </div>
  </div>

const PickingSkills =
  <div className="Help-Content">
    <div>
      <p>
        Once the skills are populated, you're ready to start selecting skills.
        When you select a skill it will be greyed out and removed from the statistics and predictions.
        You may click the skill again and it will unselect and be added back to the statistics.
      </p>
    </div>
    <div>
      <img src={pickingSkills} alt="Select hero slot and start typing in the name" />
    </div>
  </div>

const PredictingSkills =
  <div className="Help-Content">
    <div>
      <p>
        As you move through your draft, you can "CTRL+Click" on a skill and it will be added to your skill bar.
        The simulator will then recommend the best skills based on three differenct categories (Win Rate, Hero Damage, and Money).
      </p>
    </div>
    <div>
      <img src={predictingSkills} alt="Select hero slot and start typing in the name" />
    </div>
  </div>

const Rooms =
  <div className="Help-Content">
    <div>
      <p>
        When playing with friends, you can sync the state of the game by creating a room. Share the 5 letter code with
        your friends and have them pick along side you.
      </p>
    </div>
    <div>
      <img src={rooms} alt="Select hero slot and start typing in the name" />
    </div>
  </div>




let overlayClass = classNames(Classes.DARK, Classes.CARD, Classes.ELEVATION_4, Classes.OVERLAY_CONTAINER, 'Help-Container')

function Help(props: PropsWithChildren<Props>) {
  let [isOpen, setIsOpen] = useState(false)
  return (
    <span>
      <span onClick={() => setIsOpen(!isOpen)}>Help</span>
      <Overlay isOpen={isOpen} canEscapeKeyClose={true} onClose={() => setIsOpen(false)}>
        <div className={overlayClass}>
          <Tabs>
            <Tab id="overview" title="Overview" panel={Overview}></Tab>
            <Tab id="select-hero" title="Selecting Heroes" panel={SelectingHero}></Tab>
            <Tab id="select-ult" title="Selecting Ultimates" panel={SelectingUlt}></Tab>
            <Tab id="picking-skills" title="Picking Skills" panel={PickingSkills}></Tab>
            <Tab id="predicting-skills" title="Predicting Skills" panel={PredictingSkills}></Tab>
            <Tab id="rooms" title="Rooms" panel={Rooms}></Tab>
          </Tabs>
        </div>
      </Overlay>
    </span>
  );
}

export default Help;
