import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie'
import { emitCreateRoom, emitJoinRoom, emitLeaveRoom, onRoomJoined, emitUpdateState, onStateUpdate, SocketAppState, onRoomLeft } from './socket'
import './App.css';
import DraftBoard, { DraftBoardColumn } from './DraftBoard'
import UltimateContainer from './UltimateContainer'
import UltimateSkills from './UltimateSkills'
import Card from './Card'
import Header from './Header'
import Logo from './logo.png'
import PickContainer from './PickContainer';
import PickedContainer from './PickedContainer';
import getUltimates from './api/getUltimate';
import Ultimate from './types/Ultimate'
import Skill, { Predict } from './types/Skill';
import PickSkills from './PickSkills';
import SurvivalContainer from './SurvivalContainer';
import Controls from './Controls'
import JoinRoom from './JoinRoom';
import HeroSearch from './HeroSearch';
import SkillDatatable from './SkillDatatable';
import getAllSkills from './api/getAllSkills';
import HeroSkillDict from './types/HeroDict';
import HeroSearchName from './HeroSearchName';
import { Popover2 } from '@blueprintjs/popover2';
import PlayerSkillContainer, { PlayerPickedSkills, PlayerPredictSkills, PredictLabel } from './PlayerSkillContainer';
import SkillTile from './SkillTile';
import EmptySkillTile from './EmptySkillTile';
import predict from './api/predict';
import Help from './Help';
import RoomInfo from './RoomInfo';
import TopCombos from './TopCombos';

/*
TODO
 - Filter Ult Predictions when Ultimate is already selected
 - Filter Predictions that are late round picks
 - Add Winrun.io Combos
*/

export type SkillDict = Record<number, Skill>
export type HeroNameDict = Record<number, string>
export type SkillHeroDict = Record<number, number>
export type NullableSkillIdList = Array<number | null>
export type NullableSkillList = Array<Skill | null>
export interface State {
  roomCount: number,
  activePick: number,
  playerSkills: number[],
  heroNameDict: HeroNameDict,
  skillHeroDict: SkillHeroDict,
  heroSkillDict: HeroSkillDict,
  skillDict: SkillDict,
  skills: NullableSkillIdList,
  ultimates: Ultimate[],
  activeSlot: number,
  room: string,
  roomId: string,
  loading: boolean,
  stateId: number,
  picks: (number|null)[],
  changeId: number,
  editMode: boolean
  skillsHydrated: boolean,
  ultimatesHydrated: boolean
}

let initialState: State = {
  roomCount: 1,
  activePick: 0,
  heroNameDict: {},
  skillHeroDict: {},
  playerSkills: [],
  heroSkillDict: {},
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
  picks: Array(40).fill(null),
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
  let { skillDict, skills, ultimates, room, editMode, picks, heroSkillDict: heroDict } = state

  let pickHistory = useMemo(() => picks.filter((el): el is number => el !== null), [picks])
  const [cookies, setCookie, removeCookie] = useCookies(['room']);


  const mapSkills = useCallback((skillIds: Array<number | null>): Array<Skill | null> => {
    return skillIds.map(skillId => {
      return (skillId && skillDict[skillId] && { id: skillId, ...skillDict[skillId] }) || null
    })
  }, [skillDict])

  const getSocketState = useCallback((state: State): SocketAppState => {
    let { picks, skills, stateId, room, roomId, roomCount } = state
    return {
      picks, skills, stateId, room, _id: roomId, roomCount
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
    let availableSkills = state.skills.filter(el => (!el || !picks.includes(el)) && el !== -1).filter(notNull)
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
    try {
      setState(state => {
        return {
          ...state,
          skills: socketState.skills,
          picks: socketState.picks,
          stateId: socketState.stateId,
          roomCount: socketState.roomCount || state.roomCount,
          loading: false
        }
      })
    } catch (e) {
      setState(state => ({ ...state, loading: false }))
    }
  }, [])

  const setHero = useCallback((ult: Ultimate, slot: number, ultOnly?: boolean) => {
    setState(state => {
      let skillResponse = heroDict[ult.heroId]
      let newSkills = [...state.skills]

      if (ultOnly) {
        newSkills.splice(slot * 4 + 3, 1, ult.abilityId)
        return ({
          ...state,
          skills: newSkills
        })
      }

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
      pickHistory: [],
      playerSkills: []
    }))
  }, [setHero, ultimates])

  const setPickedSkill = useCallback((skill: Skill) => (ctrl: boolean) => {
    setState(state => {
      let newPicks = [...state.picks]
      let newPlayerSkills = [...state.playerSkills]

      if (newPicks.includes(skill.abilityId)) {
        newPicks = newPicks.map(el => el !== skill.abilityId ? el : null)
      } else {
        newPicks[state.activePick] = skill.abilityId
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
        picks: newPicks,
        playerSkills: newPlayerSkills,
        changeId: state.changeId + 1,
        activePick: newPicks.findIndex(el => el === null)

      }
    })

  }, [])

  useEffect(() => {
    getUltimates(setState)
    getAllSkills(setState)
    onStateUpdate(mergeState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let resetBoard = useCallback(() => setState(state => ({
    ...state,
    activePick: initialState.activePick,
    picks: initialState.picks,
    playerSkills: initialState.playerSkills,
    skills: initialState.skills,
    changeId: state.changeId + 1
  })), [setState])

  useEffect(() => {
    onRoomLeft(() => {
      setState(state => ({
        ...state,
        activePick: initialState.activePick,
        picks: initialState.picks,
        playerSkills: initialState.playerSkills,
        skills: initialState.skills,
        room: initialState.room,
        roomId: initialState.roomId,
        roomCount: initialState.roomCount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  let turn = useMemo(() => pickHistory.length, [pickHistory])
  let filteredUlts = useMemo(() => ultimates.filter(ult => !skills.includes(ult.abilityId)), [ultimates, skills])
  let mappedSkills = useMemo(() => mapSkills(skills), [mapSkills, skills])
  let mappedHistory = useMemo(() => mapSkills(picks), [mapSkills, picks])
  let heroSlot = useMemo(() => skills.reduce<Array<string | null>>((prev, el, i) => {
    if (i % 4 === 0 && el !== null) {
      return [...prev, state.heroNameDict[state.skillHeroDict[el]]]
    } else if (i % 4 === 0 && el === null) {
      return [...prev, null]
    } else {
      return prev
    }
  }, []), [state.heroNameDict, state.skillHeroDict, skills])
  let ultAndSkillLoaded = state.skillsHydrated && state.ultimatesHydrated

  let sortPredict = useCallback((metric: keyof Predict, sort: ("asc" | "desc")) => (el1: Skill, el2: Skill) => {
    if (!el1.predict && !el2.predict)
      return 0
    if (!el1.predict)
      return -1
    if (!el2.predict)
      return 1
    if (sort === "desc")
      return el2.predict[metric] - el1.predict[metric]
    if (sort === "asc")
      return el1.predict[metric] - el2.predict[metric]
    return 0
  }, [])
  let ultPicked = useMemo(() => mapSkills(state.playerSkills).reduce((ultFound, el) => Boolean(ultFound || el?.ult), false), [mapSkills, state.playerSkills])
  let filteredPredictSkills = useMemo(() => mappedSkills
    .filter((el): el is Skill => Boolean(el !== null && el.predict && !pickHistory.includes(el.abilityId)
      && !(ultPicked && el.ult) && (pickHistory.length > 29 || el.stats.survival[pickHistory.length + 10] < .6))
      , [ultPicked, pickHistory]), [mappedSkills, pickHistory, ultPicked])

  let goldPredictSkill = useMemo(() => [...filteredPredictSkills].sort(sortPredict('gold', 'desc')), [filteredPredictSkills, sortPredict])
  let damagePredictSkill = useMemo(() => [...filteredPredictSkills].sort(sortPredict('damage', 'desc')), [filteredPredictSkills, sortPredict])
  let winPredictSkill = useMemo(() => [...filteredPredictSkills].sort(sortPredict('win', 'desc')), [filteredPredictSkills, sortPredict])

  return (
    <div className="App bp4-dark">
      <Header logo={Logo}>
        {room === '' && <li data-testid="createRoomBtn" onClick={sendCreateRoom}>Create Room</li>}
        {room === '' && <li><Popover2 data-testid="joinRoomBtn" placement='bottom' content={<JoinRoom joinRoom={sendJoinRoom} />}>Join Room</Popover2></li>}
        {room !== '' && <li data-testid="leaveRoomBtn" onClick={() => emitLeaveRoom()}>Leave Room</li>}
        {room !== '' && <RoomInfo room={room} roomCount={state.roomCount} />}
        <li><Controls randomizeBoard={randomizeBoard} resetBoard={resetBoard} /></li>
        <li><Help /></li>
      </Header>
      {ultAndSkillLoaded && <DraftBoard>
        <DraftBoardColumn location={'center'}>
          <Card title="Player Skills (Ctrl-Click on Skill)">
            <PlayerSkillContainer>
              <PlayerPickedSkills>
                {[0, 1, 2].map(slot => {
                  let k = state.playerSkills[slot]
                  return ((k && <SkillTile skills={mappedSkills} skill={skillDict[k]} turn={0} />) || <EmptySkillTile />)
                })}
              </PlayerPickedSkills>
              <PredictLabel />
              <PlayerPredictSkills category='Win'>
                {(winPredictSkill.length > 0 && <SkillTile skills={mappedSkills} skill={winPredictSkill[0]} turn={0} />) || <EmptySkillTile />}
              </PlayerPredictSkills>
              <PlayerPredictSkills category='Damage'>
                {(damagePredictSkill.length > 0 && <SkillTile skills={mappedSkills} skill={damagePredictSkill[0]} turn={0} />) || <EmptySkillTile />}
              </PlayerPredictSkills>
              <PlayerPredictSkills category='Gold'>
                {(goldPredictSkill.length > 0 && <SkillTile skills={mappedSkills} skill={goldPredictSkill[0]} turn={0} />) || <EmptySkillTile />}
              </PlayerPredictSkills>
            </PlayerSkillContainer>
          </Card>

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
        </DraftBoardColumn>

        <DraftBoardColumn location={'left'}>
          <PickedContainer>
            <div></div>
            <Card title="Radiant Team" contentClass="picked-container-content">
              {[0, 2, 4, 6, 8, 10].map(slot => {
                return (
                  (state.activeSlot === slot && <HeroSearch ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                  <HeroSearchName activePick={state.activePick} slot={slot} skills={mappedHistory} key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
                )
              })}
            </Card>
          </PickedContainer>
        </DraftBoardColumn>

        <DraftBoardColumn location={'right'}>
          <PickedContainer right>
            <Card title="Dire Team" contentClass="picked-container-content">
              {[1, 3, 5, 7, 9, 11].map(slot => {
                return (
                  (state.activeSlot === slot && <HeroSearch ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                  <HeroSearchName activePick={state.activePick} slot={slot} skills={mappedHistory} key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
                )
              })}
            </Card>
          </PickedContainer>
        </DraftBoardColumn>

        <TopCombos skills={mappedSkills} />

        <DraftBoardColumn location='overview'>
          {skills.filter(notNull).length > 0 && <SurvivalContainer>
            <SkillDatatable pickSkill={setPickedSkill} turn={turn} skills={mappedSkills.filter(notNull).filter(filterNotPicked(pickHistory))} />
          </SurvivalContainer>}
        </DraftBoardColumn>
      </DraftBoard>}
    </div>
  );
}

export default App;
