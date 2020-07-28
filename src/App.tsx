import React, { useState, useEffect } from 'react';
import './App.css';
import DraftBoard from './DraftBoard'
import UltimateContainer from './UltimateContainer'
import UltimateSkills from './UltimateSkills'
import Card from './Card'
import Header from './Header'
import Logo from './logo.svg'
import PickContainer from './PickContainer';
import PickedContainer from './PickedContainer';
import getUltimates from './api/getUltimate';
import Ultimate from './types/Ultimate'
import Skill from './types/Skill';
import getHeroSkills from './api/getHero';
import PickSkills from './PickSkills';
import PickedSkills from './PickedSkills';
import SurvivalContainer from './SurvivalContainer';
import SkillTile from './SkillTile'
import Controls from './Controls'

function App() {

  let [skills, setSkills] = useState(Array(48).fill(undefined) as Array<Skill | undefined>)
  let [pickedSkills, setPickedSkills] = useState(Array(40).fill(undefined) as Array<Skill | undefined>)
  let [ultimates, setUltimates] = useState([] as Ultimate[])
  let [turn, setTurn] = useState(0)
  let [pickHistory, setPickHistory] = useState([] as number[])

  useEffect(() => {
    getUltimates(setUltimates)
  }, [])


  function notUndefined<T>(x: T | undefined): x is T {
    return x !== undefined;
  }

  function undoPick() {
    let newHistory = pickHistory.slice(0, -1)
    let removePick = pickHistory.slice(-1)[0]
    let newPicked = pickedSkills.map(skill => {
      if (skill === undefined) {
        return undefined
      } else if (skill.abilityId === removePick) {
        return undefined
      } else {
        return skill
      }
    })
    setPickedSkills(newPicked)
    setPickHistory(newHistory)
    setTurn((turn - 1) % 10)
  }

  let setHero = async (id: number, slot: number) => {
    let skillResponse = await getHeroSkills(id)
    let newSkills = [...skills]
    newSkills.splice(slot * 4, 4, ...skillResponse)

    setSkills(newSkills)
  }

  let setPickedSkill = (skill: Skill) => {
    if (pickHistory.includes(skill.abilityId)) {
      return
    }

    let isUlt = ultimates.map(el => el.abilityId).includes(skill.abilityId)

    let newPicked = [...pickedSkills]
    if (isUlt) {
      if (pickedSkills[turn * 4 + 3]) {
        return
      }
      newPicked[turn * 4 + 3] = skill
    } else {
      let normSkills = pickedSkills.slice(turn * 4, turn * 4 + 3)
      if (!normSkills.includes(undefined)) {
        return
      }
      for (let i = 0; i < normSkills.length; i++) {
        if (!normSkills[i]) {
          newPicked[turn * 4 + i] = skill
          break
        }
      }
    }

    setPickedSkills(newPicked)
    setTurn((turn + 1) % 10)
    setPickHistory([...pickHistory, skill.abilityId])
  }
  let skillIds = skills.map(el => el?.abilityId)
  let filteredUlts = ultimates.filter(ult => !skillIds.includes(ult.abilityId))

  return (
    <div className="App">
      <Header logo={Logo}>
        <li>Create Room</li>
        <li>Join Room</li>
      </Header>
      <DraftBoard>

        <UltimateContainer>
          <Card title="Ultimates">
            <UltimateSkills setPickedSkill={setPickedSkill} pickHistory={pickHistory} setHero={setHero} skills={skills} ultimates={filteredUlts} />
          </Card>
        </UltimateContainer>

        <PickContainer>
          <Card title="Standard Abilities" contentClass="pick-container-content">
            {[0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6].map(slot => {
              return (<PickSkills setPickedSkill={setPickedSkill} pickHistory={pickHistory} slot={slot} skills={skills.slice(slot * 4, slot * 4 + 3)}></PickSkills>)
            })}
          </Card>
        </PickContainer>

        <PickedContainer>
          <Controls undoPick={undoPick} pickHistory={pickHistory}></Controls>
          <Card title="Radiant Picks" contentClass="picked-container-content">
            {[0, 2, 4, 6, 8].map(slot => {
              return (<PickedSkills slot={slot} turn={turn} skills={pickedSkills.slice(slot * 4, slot * 4 + 4)}></PickedSkills>)
            })}
          </Card>
        </PickedContainer>

        <PickedContainer right>
          <Card title="Dire Picks" contentClass="picked-container-content">
            {[1, 3, 5, 7, 9].map(slot => {
              return (<PickedSkills slot={slot} turn={turn} skills={pickedSkills.slice(slot * 4, slot * 4 + 4)}></PickedSkills>)
            })}
          </Card>
        </PickedContainer>

        {skills.filter(notUndefined).length > 0 && <SurvivalContainer>
          <Card title="Survival" contentClass="survival-container-content">
            {skills
              .filter(notUndefined)
              .filter((skill) => !pickHistory.includes(skill.abilityId))
              .sort((skill1, skill2) => {
                return skill1.stats.survival[pickHistory.length + 1] - skill2.stats.survival[pickHistory.length + 1]
              })
              .splice(0, 10)
              .map(skill => {
                return <div>
                  <SkillTile skill={skill}></SkillTile>
                </div>
              })}
          </Card>
        </SurvivalContainer>}
      </DraftBoard>
    </div>
  );
}

export default App;
