import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie'
import { emitCreateRoom, emitJoinRoom, emitLeaveRoom, onRoomJoined, emitUpdateState, onStateUpdate, SocketAppState, onRoomLeft, resetListeners } from './socket'
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
import PickSkills from './PickSkills';
import SurvivalContainer from './SurvivalContainer';
import Controls from './Controls'
import JoinRoom from './JoinRoom';
import HeroSearch from './HeroSearch';
import SkillDatatable from './SkillDatatable';
import getAllSkills from './api/getAllSkills';
import HeroDict from './types/HeroDict';
import HeroSearchName from './HeroSearchName';
import { Popover2 } from '@blueprintjs/popover2';
import PlayerSkillContainer from './PlayerSkillContainer';
import SkillTile from './SkillTile';
import EmptySkillTile from './EmptySkillTile';
import predict from './api/predict';

export type SkillDict = Record<number, Skill>
export type NullableSkillList = Array<number | null>
export interface State {
  playerSkills: number[],
  heroDict: HeroDict,
  skillDict: SkillDict,
  skills: NullableSkillList,
  ultimates: Ultimate[],
  activeSlot: number,
  room: string,
  roomId: string,
  loading: boolean,
  stateId: number,
  pickHistory: number[],
  changeId: number,
  editMode: boolean
  skillsHydrated: boolean,
  ultimatesHydrated: boolean
}

let initialState: State = {
  playerSkills: [],
  heroDict: {},
  skillDict: {},
  skills: Array(48).fill(null),
  ultimates: [],
  activeSlot: 0,
  room: '',
  roomId: '',
  loading: false,
  skillsHydrated: false,
  ultimatesHydrated: false,
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
  const ultLu = [0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6]
  let [state, setState] = useState<State>(initialState)
  let { skillDict, skills, ultimates, room, pickHistory, editMode, heroDict } = state
  const [cookies, setCookie, removeCookie] = useCookies(['room']);

  const mapSkills = useCallback((skillIds: Array<number | null>): Array<Skill | null> => {
    return skillIds.map(skillId => {
      return (skillId && skillDict[skillId] && { id: skillId, ...skillDict[skillId] }) || null
    })
  }, [skillDict])

  const getSocketState = useCallback((state: State): SocketAppState => {
    let { pickHistory, skills, stateId, room, roomId } = state
    return {
      pickHistory, skills, stateId, room, _id: roomId
    }
  }, [])

  const sendNewState = useCallback(() => {
    setState(state => {
      if (room === '')
        return state
      let newState = { ...state, stateId: state.stateId + 1 }
      emitUpdateState(getSocketState(newState));
      return newState
    })
  }, [room, getSocketState])

  useEffect(() => sendNewState(), [state.changeId, sendNewState])

  useEffect(() => {
    let availableSkills = state.skills.filter(el => !el || !state.pickHistory.includes(el)).filter(notNull)
    if (state.playerSkills.filter(el => el).length > 0)
      predict(state.playerSkills, availableSkills, setState)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.playerSkills])

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

  const mergeState = useCallback(async (socketState: SocketAppState) => {
    setState(state => ({ ...state, loading: true }))
    console.log("updatingSocketState")
    try {
      setState(state => {
        // if (state.stateId >= socketState.stateId)
        //   return state
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

  const setHero = useCallback((ult: Ultimate, slot: number) => {
    setState(state => {
      let skillResponse = heroDict[ult.heroId]
      let newSkills = [...state.skills]

      newSkills.splice(slot * 4, 4, ...skillResponse.map(el => el.abilityId))

      return ({
        ...state,
        activeSlot: state.activeSlot + 1,
        skills: newSkills,
        changeId: state.changeId + 1
      })
    })
  }, [heroDict])


  const randomizeBoard = useCallback(() => {
    shuffle(ultimates).slice(0, 12).forEach((ult, i) => setHero(ult, i))
    setState(state => ({
      ...state,
      pickHistory: []
    }))
  }, [setHero, ultimates])

  const setPickedSkill = useCallback((skill: Skill) => (ctrl: boolean) => {
    setState(state => {
      let newPickHistory = [...state.pickHistory]
      let newPlayerSkills = [...state.playerSkills]

      if (newPickHistory.includes(skill.abilityId)) {
        newPickHistory = newPickHistory.filter(el => el !== skill.abilityId)
      } else {
        newPickHistory.push(skill.abilityId)
      }

      if (state.playerSkills.includes(skill.abilityId)) {
        newPlayerSkills = newPlayerSkills.filter(el => el !== skill.abilityId)
      } else {
        if (ctrl) {
          newPlayerSkills.push(skill.abilityId)
        }
      }

      return {
        ...state,
        pickHistory: newPickHistory,
        playerSkills: newPlayerSkills,
        changeId: state.changeId + 1
      }
    })

  }, [])

  useEffect(() => {
    getUltimates(setState)
    getAllSkills(setState)
    onStateUpdate(mergeState)
    resetListeners()
  }, [mergeState])

  useEffect(() => {
    onRoomLeft(() => {
      resetListeners()
      setState(state => ({
        ...state,
        pickHistory: initialState.pickHistory,
        playerSkills: initialState.playerSkills,
        skills: initialState.skills,
        room: initialState.room,
        roomId: initialState.roomId,
      }))
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
    if (cookies.room) {
      emitJoinRoom(cookies.room)
    }
  }, [cookies.room, mergeState, setCookie, removeCookie])


  let turn = useMemo(() => pickHistory.length, [pickHistory])
  let filteredUlts = useMemo(() => ultimates.filter(ult => !skills.includes(ult.abilityId)), [ultimates, skills])
  let mappedSkills = useMemo(() => mapSkills(skills), [mapSkills, skills])
  let heroSlot = useMemo(() => mappedSkills.reduce<Array<string | null>>((prev, curr, i) => {
    if (i % 4 === 3) {
      let hero = state.ultimates.find(el => el.abilityId === curr?.abilityId)?.heroName
      return [...prev, hero || null]
    } else {
      return prev
    }
  }, []), [mappedSkills, state.ultimates])
  let ultAndSkillLoaded = state.skillsHydrated && state.ultimatesHydrated
  return (
    <div className="App bp4-dark">
      <Header logo={Logo}>
        {room === '' && <li data-testid="createRoomBtn" onClick={sendCreateRoom}>Create Room</li>}
        {room === '' && <Popover2 data-testid="joinRoomBtn" content={<JoinRoom joinRoom={sendJoinRoom} />}><li>Join Room</li></Popover2>}
        {room !== '' && <li data-testid="leaveRoomBtn" onClick={() => emitLeaveRoom()}>Leave Room</li>}
        {room !== '' && <li data-testid="roomName">Room: {room}</li>}
        <Controls randomizeBoard={randomizeBoard} />
      </Header>
      {ultAndSkillLoaded && <DraftBoard>
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
          <div></div>
          <Card title="Radiant Team" contentClass="picked-container-content">
            {[0, 2, 4, 6, 8, 10].map(slot => {
              return (
                (state.activeSlot === slot && <HeroSearch ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                <HeroSearchName key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
              )
            })}
          </Card>
        </PickedContainer>

        <PlayerSkillContainer>
          <Card title="Player Skills (Ctrl-Click on Skill)">
            {[0, 1, 2, 3].map(slot => {
              let k = state.playerSkills[slot]
              return ((k && <SkillTile skill={skillDict[k]} turn={0} />) || <EmptySkillTile />)
            })}
          </Card>
        </PlayerSkillContainer>

        <PickedContainer right>
          <Card title="Dire Team" contentClass="picked-container-content">
            {[1, 3, 5, 7, 9, 11].map(slot => {
              return (
                (state.activeSlot === slot && <HeroSearch ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                <HeroSearchName key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
              )
            })}
          </Card>
        </PickedContainer>

        {skills.filter(notNull).length > 0 && <SurvivalContainer>
          <SkillDatatable pickSkill={setPickedSkill} turn={turn} skills={mappedSkills.filter(notNull).filter(filterNotPicked(pickHistory))} />
        </SurvivalContainer>}
      </DraftBoard>}
    </div>
  );
}

export default App;
