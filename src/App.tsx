import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie'
import { useDebounce } from 'use-debounce'
import { emitCreateRoom, emitJoinRoom, emitLeaveRoom, onRoomJoined, emitUpdateState, onStateUpdate, SocketAppState, onRoomLeft } from './socket'
import './App.css';
import ConsoleParser from './ConsoleParser';
import DraftBoard from './DraftBoard'
import UltimateContainer from './UltimateContainer'
import UltimateSkills from './UltimateSkills'
import Card from './Card'
import Header from './Header'
import Logo from './logo512.png'
import PickContainer from './PickContainer';
import PickedContainer from './PickedContainer';
import getUltimates from './api/getUltimate';
import parseConsole from './api/parseConsole';
import Ultimate from './types/Ultimate'
import Skill from './types/Skill';
import PickSkills from './PickSkills';
import SurvivalContainer from './SurvivalContainer';
import Controls from './Controls'
import { Popover } from '@blueprintjs/core'
import JoinRoom from './JoinRoom';
import HeroSearch from './HeroSearch';
import SkillDatatable from './SkillDatatable';
import getAllSkills from './api/getAllSkills';
import HeroDict from './types/HeroDict';
import HeroSearchName from './HeroSearchName';

export type SkillDict = Record<number, Skill>
export type NullableSkillList = Array<number | null>
export interface State {
  hoverSkills: number[],
  heroDict: HeroDict,
  skillDict: SkillDict,
  skills: NullableSkillList,
  ultimates: Ultimate[],
  heroSlot: string[];
  activeSlot: number,
  room: string,
  roomId: string,
  loading: boolean,
  stateId: number,
  pickHistory: number[],
  changeId: number,
  editMode: boolean
}

let initialState: State = {
  hoverSkills: [],
  heroDict: {},
  skillDict: {},
  skills: Array(48).fill(null),
  heroSlot: [],
  ultimates: [],
  activeSlot: 0,
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

const filterNotPicked = (pickHistory: number[]) => (skill: Skill): boolean => skill !== null && !pickHistory.includes(skill.abilityId)

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
  const slotLookup = [0, 1, 2, 3, 4, 9, 10, 11, 8, 7]
  const ultLu = [0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6]
  let [state, setState] = useState<State>(initialState)
  let { skillDict, skills, ultimates, room, pickHistory, editMode, heroSlot, heroDict } = state
  let [debounceChange] = useDebounce(state.changeId, 200)
  const [cookies, setCookie, removeCookie] = useCookies(['room']);

  const mapSkills = useCallback((skillIds: Array<number | null>): Array<Skill | null> => {
    return skillIds.map(skillId => {
      return (skillId && { id: skillId, ...skillDict[skillId] }) || null
    })
  }, [skillDict])

  const mapSkillsNoNulls = useCallback((skillIds: Array<number | null>): Skill[] => {
    return skillIds.filter((el): el is number => el !== null).map(skillId => {
      return { id: skillId, ...skillDict[skillId] } || null
    })
  }, [skillDict])


  const getSocketState = useCallback((state: State): SocketAppState => {
    let { pickHistory, skills, stateId, room, roomId } = state
    return {
      pickHistory, skills, stateId, room, _id: roomId
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
          stateId: socketState.stateId,
          loading: false
        }
      })
    } catch (e) {
      setState(state => ({ ...state, loading: false }))
    }
  }, [])

  const calculateTurn = useCallback((picked: NullableSkillList) => {
    let turnCalc = picked.filter(notNull).length % 20
    if (turnCalc > 9) {
      return 19 - turnCalc
    }
    else {
      return turnCalc
    }
  }, [])



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

  const setHero = useCallback((ult: Ultimate, slot: number) => {
    setState(state => {
      console.log(slot)
      let skillResponse = heroDict[ult.heroId]
      let newHeroSlot = [...state.heroSlot]
      let newSkillDict = {...state.skillDict, ...mapSkillListToDict(skillResponse)}
      let newSkills = [...state.skills]

      newHeroSlot[slot] = ult.heroName
      newSkills.splice(slot * 4, 4, ...skillResponse.map(el => el.abilityId))

      return ({
      ...state,
      heroSlot: newHeroSlot,
      activeSlot: state.activeSlot + 1,
      skills: newSkills,
      skillDict: newSkillDict,
      changeId: state.changeId + 1
    })})
  }, [mapSkillListToDict, heroDict])


  const randomizeBoard = useCallback(() => {
    shuffle(ultimates).slice(0, 12).forEach((ult, i) => setHero(ult, i))
  }, [setHero, ultimates])

  const setPickedSkill = useCallback((skill: Skill) => {
    let newPickHistory = [...pickHistory]
    if (pickHistory.includes(skill.abilityId)) {
      newPickHistory.filter(el => el !== skill.abilityId)
    } else {
      newPickHistory.push(skill.abilityId)
    }
    setState(state => ({
      ...state,
      pickHistory: newPickHistory,
      changeId: state.changeId + 1
    }))
  }, [pickHistory])


  useEffect(() => {
    getUltimates(setState)
    getAllSkills(setState)
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

  let submitConsole = useCallback(async (consoleText: string) => {
    let parsedSkills = await parseConsole(consoleText)
    let newSkills = [...skills]
    let skillDictUpdate = mapSkillListToDict(parsedSkills.flat())
    parsedSkills.forEach((skills, idx) => {
      newSkills.splice(slotLookup[idx] * 4, 4, ...skills.map(el => el.abilityId))
    })
    setState(state => ({
      ...state,
      skills: newSkills,
      skillDict: { ...state.skillDict, ...skillDictUpdate },
      changeId: state.changeId + 1
    }))
  }, [mapSkillListToDict, skills])

  let turn = useMemo(() => pickHistory.length, [pickHistory])
  let filteredUlts = useMemo(() => ultimates.filter(ult => !skills.includes(ult.abilityId)), [ultimates, skills])
  let nonNullSkills: number[] = useMemo(() => skills.filter(notNull), [skills])
  let mappedSkills = useMemo(() => mapSkills(skills), [mapSkills, skills])

  return (
    <div className="App bp3-dark pt-dark">
      <Header logo={Logo}>
        {room === '' && <li data-testid="createRoomBtn" onClick={sendCreateRoom}>Create Room</li>}
        {room === '' && <Popover data-testid="joinRoomBtn" target={<li>Join Room</li>} content={<JoinRoom joinRoom={sendJoinRoom} />}></Popover>}
        {room !== '' && <li data-testid="leaveRoomBtn" onClick={() => emitLeaveRoom()}>Leave Room</li>}
        {room !== '' && <li data-testid="roomName">Room: {room}</li>}
        <li data-testid="console" onClick={() => "TODO"}><ConsoleParser submitConsole={submitConsole} /></li>
      </Header>
      <DraftBoard>

        <UltimateContainer>
          <Card title="Ultimates">
            <UltimateSkills turn={turn} editMode={editMode} setPickedSkill={setPickedSkill} pickHistory={pickHistory} setHero={setHero} skills={mappedSkills} ultimates={filteredUlts} />
          </Card>
        </UltimateContainer>

        <PickContainer>
          <Card title="Standard Abilities" contentClass="pick-container-content">
            {[0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6].map(slot => {
              return (
                <PickSkills turn={turn} key={`standard-abilities-${slot}`} setPickedSkill={setPickedSkill} pickHistory={pickHistory} slot={slot} skills={mappedSkills.slice(slot * 4, slot * 4 + 3)} />)
            })}
          </Card>
        </PickContainer>

        <PickedContainer>
          <Controls handleBoardResults={handleBoardResults} randomizeBoard={randomizeBoard} />
          <Card title="Radiant Team" contentClass="picked-container-content">
            {[0, 2, 4, 6, 8, 10].map(slot => {
              return (
                (state.activeSlot === slot && <HeroSearch ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                <HeroSearchName onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
              )
            })}
          </Card>
        </PickedContainer>

        <PickedContainer right>
          <Card title="Dire Team" contentClass="picked-container-content">
            {[1, 3, 5, 7, 9, 11].map(slot => {
              return (
                (state.activeSlot === slot && <HeroSearch ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                <HeroSearchName onClick={() => setState({ ...state, activeSlot: slot})} hero={heroSlot[ultLu[slot]]} />
              )
            })}
          </Card>
        </PickedContainer>

        {skills.filter(notNull).length > 0 && <SurvivalContainer>
          <SkillDatatable pickSkill={setPickedSkill} turn={turn} skills={mapSkills(nonNullSkills).filter(notNull).filter(filterNotPicked(pickHistory))} />
        </SurvivalContainer>}
      </DraftBoard>
    </div>
  );
}

export default App;
