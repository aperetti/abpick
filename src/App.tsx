import React, { useState, useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie'
import { useDebounce } from 'use-debounce'
import { emitCreateRoom, emitJoinRoom, emitLeaveRoom, onRoomJoined, emitUpdateState, onStateUpdate, SocketAppState, onRoomLeft } from './socket'
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

export type SkillDict = Record<number, Skill>
export type NullableSkillList = Array<number | null>
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
  changeId: number,
  editMode: boolean
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
  editMode: false
}

function notNull<T>(x: T | null): x is T {
  return x !== null;
}

function shuffle<T>(array: Array<T>): Array<T> {
  let newArray = [...array]
  var i = newArray.length,
    j = 0,
    temp;

  while (i--) {

    j = Math.floor(Math.random() * (i + 1));

    // swap randomly chosen element with current element
    temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;

  }
  return newArray;
}

function App() {
  let [state, setState] = useState<State>(initialState)
  let { skillDict, skills, pickedSkills, ultimates, turn, room, pickHistory, editMode } = state
  let [debounceChange] = useDebounce(state.changeId, 200)
  const [cookies, setCookie, removeCookie] = useCookies(['room']);

  const mapSkills = useCallback((skillIds: Array<number | null>): Array<Skill | null> => {
    return skillIds.map(skillId => {
      if (skillId === null)
        return null
      return skillDict[skillId] || null
    })
  }, [skillDict])

  const getSocketState = useCallback((state: State): SocketAppState => {
    let { pickHistory, pickedSkills, skills, turn, stateId, room, roomId } = state
    return {
      pickHistory, pickedSkills, skills, turn, stateId, room, _id: roomId
    }
  }, [])

  const sendNewState = useCallback(() => {
    if (room === '')
      return
    setState(state => {
      let newState = { ...state, stateId: state.stateId + 1 }
      emitUpdateState(getSocketState(newState));
      return newState
    })
  }, [room, getSocketState])

  const sendCreateRoom = useCallback(() => {
    setState(state => {
      let newState = { ...state, stateId: state.stateId + 1 }
      emitCreateRoom(getSocketState(newState));
      return newState
    })
  }, [getSocketState])

  const sendJoinRoom = useCallback((room: string) => {
    setState(state => {
      let newState = { ...state, stateId: 0 }
      emitJoinRoom(room)
      return newState
    })
  }, [])

  const mapSkillListToDict = useCallback((skills: Array<Skill>): SkillDict => {
    let skillDictUpdate: SkillDict = {}
    skills.forEach(el => {
      skillDictUpdate[el.abilityId] = el
    })
    return skillDictUpdate
  }, [])

  const mergeState = useCallback(async (socketState: SocketAppState) => {
    setState(state => ({ ...state, loading: true }))
    try {
      setState(state => {
        if (state.stateId >= socketState.stateId)
          return state
        return {
          ...state,
          skills: socketState.skills,
          pickHistory: socketState.pickHistory,
          pickedSkills: socketState.pickedSkills,
          stateId: socketState.stateId,
          turn: socketState.turn,
          loading: false
        }
      })
    } catch (e) {
      setState(state => ({ ...state, loading: false }))
    }
  }, [])

  const calculateTurn = useCallback((picked) => {
    let turnCalc = picked.filter(notNull).length % 20
    if (turnCalc > 9) {
      return 19 - turnCalc
    }
    else {
      return turnCalc
    }
  }, [])

  const randomizeBoard = useCallback(() => {
    const newUlts = shuffle(ultimates).slice(0, 12)
    let newSkills = newUlts.reduce((skillList: NullableSkillList, ult): NullableSkillList => {
      skillList = [...skillList, ...ult.heroAbilities]
      return skillList
    }, [])
    setState(state => ({ ...state, skills: newSkills }))
  }, [ultimates])

  const handleBoardResults = useCallback((newUlts: Array<number>) => {

    const slotLookup = [0, 1, 2, 6, 7, 8, 11, 10, 9, 3, 4, 5]
    let newSkills = slotLookup
      .map(el => newUlts[el])
      .map(el => ultimates.find(ult => ult.abilityId === el))
      .reduce((prevSkills: NullableSkillList, ult) => {
        if (ult === undefined)
          return [...prevSkills, null, null, null, null]
        else
          return [...prevSkills, ...ult.heroAbilities]
      }, [])
    setState(state => ({ ...state, skills: newSkills }))
  }, [ultimates])

  const undoPick = useCallback(() => {
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
      turn: calculateTurn(newPicked),
      changeId: state.changeId + 1
    }))
  }, [pickHistory, pickedSkills, calculateTurn])

  const setHero = useCallback(async (id: number, slot: number) => {
    let skillResponse = await getHeroSkills(id)
    let newSkills = [...skills]
    let skillDictUpdate = mapSkillListToDict(skillResponse)

    newSkills.splice(slot * 4, 4, ...skillResponse.map(el => el.abilityId))
    setState(state => ({
      ...state,
      skills: newSkills,
      skillDict: { ...state.skillDict, ...skillDictUpdate },
      changeId: state.changeId + 1
    }))
  }, [mapSkillListToDict, skills])

  const setPickedSkill = useCallback((skill: Skill) => {
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
      turn: calculateTurn(newPicked),
      pickHistory: [...state.pickHistory, skill.abilityId],
      changeId: state.changeId + 1
    }))
  }, [calculateTurn, pickHistory, pickedSkills, turn, ultimates])


  useEffect(() => {
    getUltimates(setState)
    onRoomLeft(() => {
      setState(_ => initialState)
      removeCookie('room')
    })
    onRoomJoined(async (state) => {
      setCookie('room', state.room)
      setState(oldState => ({
        ...oldState,
        room: state.room,
        roomId: state._id
      }))
      await mergeState(state)
    })
    onStateUpdate(mergeState)
    if (cookies.room) {
      emitJoinRoom(cookies.room)
    }
  }, [])

  useEffect(() => {
    sendNewState()
  }, [debounceChange])

  useEffect(() => {
    const fetchSkills = async () => {
      let newSkills = skills.filter(notNull).filter(skill => skillDict[skill] === undefined)
      let newSkillDetails = await getSkills(newSkills)
      let newSkillDict = mapSkillListToDict(newSkillDetails)
      setState(state => ({ ...state, skillDict: { ...state.skillDict, ...newSkillDict } }))
    }
    fetchSkills()
  }, [skills])



  let filteredUlts = ultimates.filter(ult => !skills.includes(ult.abilityId))

  return (
    <div className="App bp3-dark">
      <Header logo={Logo}>
        {room === '' && <li data-testid="createRoomBtn" onClick={sendCreateRoom}>Create Room</li>}
        {room === '' && <Popover data-testid="joinRoomBtn" target={<li>Join Room</li>} content={<JoinRoom joinRoom={sendJoinRoom} />}></Popover>}
        {room !== '' && <li data-testid="leaveRoomBtn" onClick={() => emitLeaveRoom()}>Leave Room</li>}
        {room !== '' && <li data-testid="roomName">Room: {room}</li>}
      </Header>
      <DraftBoard>

        <UltimateContainer>
          <Card title="Ultimates">
            <UltimateSkills editMode={editMode} setPickedSkill={setPickedSkill} pickHistory={pickHistory} setHero={setHero} skills={mapSkills(skills)} ultimates={filteredUlts} />
          </Card>
        </UltimateContainer>

        <PickContainer>
          <Card title="Standard Abilities" contentClass="pick-container-content">
            {[0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6].map(slot => {
              return (<PickSkills key={`standard-abilities-${slot}`} setPickedSkill={setPickedSkill} pickHistory={pickHistory} slot={slot} skills={mapSkills(skills.slice(slot * 4, slot * 4 + 3))}></PickSkills>)
            })}
          </Card>
        </PickContainer>

        <PickedContainer>
          <Controls handleBoardResults={handleBoardResults} randomizeBoard={randomizeBoard} editMode={editMode} toggleEditMode={() => setState(state => ({ ...state, editMode: !editMode }))} undoPick={undoPick} pickHistory={pickHistory} />
          <Card title="Radiant Picks" contentClass="picked-container-content">
            {[0, 2, 4, 6, 8].map(slot => {
              return (<PickedSkills key={`radiant-skills-${slot}`} slot={slot} turn={skills.filter(notNull).length > 0 ? turn : -1} skills={mapSkills(pickedSkills.slice(slot * 4, slot * 4 + 4))}></PickedSkills>)
            })}
          </Card>
        </PickedContainer>

        <PickedContainer right>
          <Card title="Dire Picks" contentClass="picked-container-content">
            {[1, 3, 5, 7, 9].map(slot => {
              return (<PickedSkills key={`dire picks-${slot}`} slot={slot} turn={turn} skills={mapSkills(pickedSkills.slice(slot * 4, slot * 4 + 4))}></PickedSkills>)
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
              .slice(0, 16)
              .map(skill => {
                return <div>
                  <SkillTile key={`survival-${skill.abilityId}`} skill={skill}></SkillTile>
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
              .slice(0, 16)
              .map(skill => {
                return <div>
                  <SkillTile key={`pick-${skill.abilityId}`} skill={skill}></SkillTile>
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
                return skill2.stats.winRate - skill1.stats.winRate
              })
              .slice(0, 16)
              .map(skill => {
                return <div>
                  <SkillTile key={`win-rate-${skill.abilityId}`} skill={skill}></SkillTile>
                </div>
              })}
          </Card>
        </WinContainer>}

      </DraftBoard>
    </div>
  );
}

export default App;
