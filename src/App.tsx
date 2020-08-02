import React, { useState, useEffect } from 'react';
import { emitCreateRoom, emitJoinRoom, emitLeaveRoom, onRoomJoined, emitUpdateState, onStateUpdate, SocketAppState, onConnect } from './socket'
import './App.css';
import DraftBoard from './DraftBoard'
import UltimateContainer from './UltimateContainer'
import UltimateSkills from './UltimateSkills'
import Card from './Card'
import Header from './Header'
import Logo from './logo512.png'
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
import getSkills from './api/getSkills'
import { Popover } from '@blueprintjs/core'
import JoinRoom from './JoinRoom';
import RoundContainer from './RoundContainer';
import WinContainer from './WinContainer';

type SkillDict = Record<number, Skill>
type NullableSkillList = Array<number | null>
export interface State {
  skillDict: SkillDict,
  skills: NullableSkillList,
  pickedSkills: NullableSkillList,
  ultimates: Ultimate[],
  turn: number,
  room: string,
  roomId: string,
  loading: boolean,
  stateId: number,
  pickHistory: number[],
  changeId: number
}

let initialState: State = {
  skillDict: {},
  skills: Array(48).fill(null),
  pickedSkills: Array(48).fill(null),
  ultimates: [],
  turn: 0,
  room: '',
  roomId: '',
  loading: false,
  stateId: 0,
  pickHistory: [],
  changeId: 0,
}

function App() {
  let [state, setState] = useState<State>(initialState)
  let { skillDict, skills, pickedSkills, ultimates, turn, room, roomId, loading, stateId, pickHistory } = state

  useEffect(() => {
    getUltimates(setState)
    onRoomJoined(async (state) => {
      setState(oldState => ({
        ...oldState,
        room: state.room,
        roomId: state._id
      }))
      await mergeState(state)
    })
    onStateUpdate(mergeState)
    onConnect(() => {
      if (room !== '')
        emitJoinRoom(room)
    })
  }, [])
  
  useEffect(() => {
    sendNewState()
  }, [state.changeId])

  function mapSkills(skillIds: Array<number | null>): Array<Skill | null> {
    return skillIds.map(skillId => {
      if (skillId === null)
        return null
      return skillDict[skillId] || null
    })
  }

  function getSocketState(): SocketAppState {
    return {
      pickHistory: pickHistory,
      pickedSkills: pickedSkills,
      skills: skills,
      turn: turn,
      stateId: stateId,
      room: room,
      _id: roomId
    }
  }

  function sendNewState() {
    if (room === '')
      return
    emitUpdateState(getSocketState())
  }

  function mapSkillListToDict(skills: Array<Skill>): SkillDict {
    let skillDictUpdate: SkillDict = {}
    skills.forEach(el => {
      skillDictUpdate[el.abilityId] = el
    })
    return skillDictUpdate
  }

  async function mergeState(socketState: SocketAppState) {
    setState(state => ({...state, loading: true}))
    let newSkills = socketState.skills.filter(notNull).filter(skill => skillDict[skill] === undefined)
    try {
      console.log("Updated")
      let newSkillDetails = await getSkills(newSkills)
      let newSkillDict = mapSkillListToDict(newSkillDetails)
      console.log(socketState.skills)
      console.log(newSkills)
      console.log(newSkillDict)
      console.log(skillDict)
      console.log({ ...skillDict, ...newSkillDict })
      setState(state => ({
        ...state,
        skills: socketState.skills,
        skillDict: { ...skillDict, ...newSkillDict },
        pickHistory: socketState.pickHistory,
        pickedSkills: socketState.pickedSkills,
        stateId: socketState.stateId,
        turn: socketState.turn,
        loading: false
      }))
    } catch (e) {
      console.log(e)
      setState(state => ({ ...state, loading: false }))
    }
  }

  function notNull<T>(x: T | null): x is T {
    return x !== null;
  }



  function undoPick() {
    if (pickHistory.length === 0)
      return
    let newHistory = pickHistory.slice(0, -1)
    let removePick = pickHistory.slice(-1)[0]
    let newPicked = pickedSkills.map(skill => {
      if (skill === null) {
        return null
      } else if (skill === removePick) {
        return null
      } else {
        return skill
      }
    })
    setState(state => ({
      ...state,
      pickedSkills: newPicked,
      pickHistory: newHistory,
      turn: (turn - 1) % 10,
      changeId: state.changeId + 1
    }))
  }


  let setHero = async (id: number, slot: number) => {
    let skillResponse = await getHeroSkills(id)
    let newSkills = [...skills]
    let skillDictUpdate = mapSkillListToDict(skillResponse)

    newSkills.splice(slot * 4, 4, ...skillResponse.map(el => el.abilityId))
    setState(state => ({
      ...state,
      skills: newSkills,
      skillDict: {...state.skillDict, ...skillDictUpdate},
      changeId: state.changeId + 1
    }))
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
      newPicked[turn * 4 + 3] = skill.abilityId
    } else {
      let normSkills = pickedSkills.slice(turn * 4, turn * 4 + 3)
      if (!normSkills.includes(null)) {
        return
      }
      for (let i = 0; i < normSkills.length; i++) {
        if (!normSkills[i]) {
          newPicked[turn * 4 + i] = skill.abilityId
          break
        }
      }
    }

    setState(state => ({
      ...state,
      pickedSkills: newPicked,
      turn: (turn + 1) % 10,
      pickHistory: [...state.pickHistory, skill.abilityId],
      changeId: state.changeId + 1
    }))
  }

  let filteredUlts = ultimates.filter(ult => !skills.includes(ult.abilityId))

  return (
    <div className="App bp3-dark">
      <Header logo={Logo}>
        {room === '' && <li onClick={() => emitCreateRoom(getSocketState())}>Create Room</li>}
        {room === '' && <Popover target={<li>Join Room</li>} content={<JoinRoom joinRoom={emitJoinRoom} />}></Popover>}
        {room !== '' && <li onClick={() => emitLeaveRoom()}>Leave Room</li>}
        {room !== '' && <li>Room: {room}</li>}
      </Header>
      <DraftBoard>

        <UltimateContainer>
          <Card title="Ultimates">
            <UltimateSkills setPickedSkill={setPickedSkill} pickHistory={pickHistory} setHero={setHero} skills={mapSkills(skills)} ultimates={filteredUlts} />
          </Card>
        </UltimateContainer>

        <PickContainer>
          <Card title="Standard Abilities" contentClass="pick-container-content">
            {[0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6].map(slot => {
              return (<PickSkills setPickedSkill={setPickedSkill} pickHistory={pickHistory} slot={slot} skills={mapSkills(skills.slice(slot * 4, slot * 4 + 3))}></PickSkills>)
            })}
          </Card>
        </PickContainer>

        <PickedContainer>
          <Controls undoPick={undoPick} pickHistory={pickHistory}></Controls>
          <Card title="Radiant Picks" contentClass="picked-container-content">
            {[0, 2, 4, 6, 8].map(slot => {
              return (<PickedSkills slot={slot} turn={turn} skills={mapSkills(pickedSkills.slice(slot * 4, slot * 4 + 4))}></PickedSkills>)
            })}
          </Card>
        </PickedContainer>

        <PickedContainer right>
          <Card title="Dire Picks" contentClass="picked-container-content">
            {[1, 3, 5, 7, 9].map(slot => {
              return (<PickedSkills slot={slot} turn={turn} skills={mapSkills(pickedSkills.slice(slot * 4, slot * 4 + 4))}></PickedSkills>)
            })}
          </Card>
        </PickedContainer>

        {skills.filter(notNull).length > 0 && <SurvivalContainer>
          <Card title="Survival" contentClass="stat-container-content">
            {mapSkills(skills)
              .filter(notNull)
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

        {skills.filter(notNull).length > 0 && <RoundContainer>
          <Card title="Average Pick" contentClass="stat-container-content">
            {mapSkills(skills)
              .filter(notNull)
              .filter((skill) => !pickHistory.includes(skill.abilityId))
              .sort((skill1, skill2) => {
                return skill1.stats.mean - skill2.stats.mean
              })
              .splice(0, 10)
              .map(skill => {
                return <div>
                  <SkillTile skill={skill}></SkillTile>
                </div>
              })}
          </Card>
        </RoundContainer>}

        {skills.filter(notNull).length > 0 && <WinContainer>
          <Card title="Win Rate" contentClass="stat-container-content">
            {mapSkills(skills)
              .filter(notNull)
              .filter((skill) => !pickHistory.includes(skill.abilityId))
              .sort((skill1, skill2) => {
                let i = Math.floor(pickHistory.length / 10)
                return skill2.stats.winRate - skill1.stats.winRate
              })
              .splice(0, 10)
              .map(skill => {
                return <div>
                  <SkillTile skill={skill}></SkillTile>
                </div>
              })}
          </Card>
        </WinContainer>}

      </DraftBoard>
    </div>
  );
}

export default App;
