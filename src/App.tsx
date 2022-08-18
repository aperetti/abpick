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
import PlayerSkillContainer from './PlayerSkillContainer';
import predict from './api/predict';
import Help from './Help';
import RoomInfo from './RoomInfo';
import { filterAvailableCombos, filterAvailableSkills, filterNonNullSkills, mapPlayerSkills, nextPick } from './utils';
import { ComboResponse } from './api/getCombos';
import InvokerAlert from './InvokerAlert';

/*
TODO
 - Filter Ult Predictions when Ultimate is already selected
 - Filter Predictions that are late round picks
 - Add Winrun.io Combos
*/

export type SkillDict = Record<number, Skill>
export type HeroNameDict = Record<number, string>
export type SlotComboDict = Record<number, ComboResponse[]>
export type SkillHeroDict = Record<number, number>
export type NullableSkillIdList = Array<number | null>
export type NullableSkillList = Array<Skill | null>
export interface State {
  roomCount: number,
  selectedPlayer: number,
  combos: SlotComboDict,
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
  picks: (number | null)[],
  changeId: number,
  editMode: boolean
  skillsHydrated: boolean,
  ultimatesHydrated: boolean,
  strictMode: boolean
}

let initialState: State = {
  roomCount: 1,
  combos: Object.assign({}, Array(10).fill([])),
  heroNameDict: {},
  skillHeroDict: {},
  selectedPlayer: 0,
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
  editMode: false,
  strictMode: true
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
  const ultLu = [0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6]
  let [state, setState] = useState<State>(initialState)
  let { heroNameDict, skillHeroDict, skillDict, skills, ultimates, room, editMode, picks, heroSkillDict: heroDict, strictMode, selectedPlayer, combos } = state
  let [ invokerOpen, setInvokerOpen ] = useState(false)
  let activePick = useMemo(() => nextPick(picks), [picks])
  let pickHistory = useMemo(() => filterNonNullSkills(picks), [picks])
  const [cookies, setCookie, removeCookie] = useCookies(['room']);

  let setStrictMode = useCallback((strict: boolean) => setState(state => ({ ...state, strictMode: strict })), [])

  const mapNullableSkills = useCallback((skillIds: Array<number | null>): Array<Skill | null> => {
    return skillIds.map(skillId => {
      return (skillId && skillDict[skillId] && { id: skillId, ...skillDict[skillId] }) || null
    })
  }, [skillDict])

  const mapSkills = useCallback((skillIds: number[]): Skill[] => {
    return skillIds.map(skillId => {
      return ({ id: skillId, ...skillDict[skillId] })
    })
  }, [skillDict])

  const getSocketState = useCallback((state: State): SocketAppState => {
    let { picks, skills, stateId, room, roomId, roomCount } = state
    picks = picks ? picks : initialState.picks
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayer, picks])

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
          activePick: nextPick(socketState.picks),
          loading: false
        }
      })
    } catch (e) {
      setState(state => ({ ...state, loading: false }))
    }
  }, [])

  let setHeroState = useCallback((skills: number[], ultId: number | null, slot: number, ultOnly?: boolean) => setState(state => {
    let newSkills = [...state.skills]
    if (ultOnly) {
      newSkills.splice(slot * 4 + 3, 1, ultId)
      let newPicks = [...state.picks].map(el => newSkills.includes(el) ? el : null)
      return ({
        ...state,
        picks: newPicks,
        skills: newSkills,
        changeId: state.changeId + 1
      })
    }

    newSkills.splice(slot * 4, 4, ...skills)
    let newPicks = [...state.picks].map(el => newSkills.includes(el) ? el : null)
    return ({
      ...state,
      picks: newPicks,
      activeSlot: state.activeSlot + 1,
      skills: newSkills,
      changeId: state.changeId + 1
    })
  }), [])

  const setHero = useCallback((ult: Ultimate, slot: number, ultOnly?: boolean) => {
    if (ult.heroId === 74) {
      setInvokerOpen(true)
    } else {
      let skills = heroDict[ult.heroId].map(el => el.abilityId)
      setHeroState(filterNonNullSkills(skills), ult.abilityId, slot, ultOnly)
    }

  }, [setHeroState])

  const closeSearch = useCallback(() => setState(state => ({ ...state, activeSlot: -1 })), [])

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
      let pickCount = newPicks.reduce<number>((picks, curr) => (picks + (curr === null ? 0 : 1)), 0)
      let skillIsUlt = state.ultimates.findIndex(el => el.abilityId === skill.abilityId) !== -1
      let playerUltIdx = activePick % 10 + 30
      let playerPicks = newPicks.filter((_, i) => i % 10 === activePick % 10)
      if (pickCount > 40)
        return state

      if (newPicks.includes(skill.abilityId)) {
        newPicks = newPicks.map(el => el !== skill.abilityId ? el : null)
      } else {
        if (state.strictMode) {
          if (skillIsUlt && playerPicks[3] !== null) {
            return state
          }
          if (!skillIsUlt && !playerPicks.slice(0, 3).includes(null)) {
            return state
          }
        }

        if (skillIsUlt && state.strictMode) {
          newPicks[playerUltIdx] = skill.abilityId
        } else if (!skillIsUlt && state.strictMode) {
          newPicks[playerPicks.findIndex(el => el === null) * 10 + activePick % 10] = skill.abilityId
        } else {
          newPicks[activePick] = skill.abilityId
        }
      }

      if (activePick % 10 === state.selectedPlayer)
        predict(filterNonNullSkills(mapPlayerSkills(state.selectedPlayer, state.skills)), filterAvailableSkills(state.skills, newPicks), setState)

      return {
        ...state,
        picks: newPicks,
        changeId: state.changeId + 1,
      }
    })

  }, [activePick])

  useEffect(() => {
    getUltimates(setState)
    getAllSkills(setState)
    onStateUpdate(mergeState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let resetBoard = useCallback(() => setState(state => ({
    ...state,
    picks: initialState.picks,
    skills: initialState.skills,
    changeId: state.changeId + 1
  })), [setState])

  useEffect(() => {
    const roomRegex = /^\/(\w{5})$/
    let match = window.location.pathname.match(roomRegex)
    if (match && room !== match[1]) {
      sendJoinRoom(window.location.pathname.slice(1, 6))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendJoinRoom])

  useEffect(() => {
    onRoomLeft(() => {
      setState(state => ({
        ...state,
        picks: initialState.picks,
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
  let mappedSkills = useMemo(() => mapNullableSkills(skills), [mapNullableSkills, skills])
  let mappedHistory = useMemo(() => mapNullableSkills(picks), [mapNullableSkills, picks])
  let heroSlot = useMemo(() => skills.reduce<Array<string | null>>((prev, el, i) => {
    if (i % 4 === 0 && el !== null) {
      return [...prev, state.heroNameDict[state.skillHeroDict[el]]]
    } else if (i % 4 === 0 && el === null) {
      return [...prev, null]
    } else {
      return prev
    }
  }, []), [state.heroNameDict, state.skillHeroDict, skills])

  let availableSkillIds = useMemo(() => filterAvailableSkills(skills, pickHistory), [skills, pickHistory])

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

  let ultPicked = useMemo(() => mapNullableSkills(mapPlayerSkills(selectedPlayer, skills)).reduce((ultFound, el) => Boolean(ultFound || el?.ult), false), [mapNullableSkills, selectedPlayer, skills])
  let filteredPredictSkills = useMemo(() => mappedSkills
    .filter((el): el is Skill => Boolean(el !== null && el.predict && !pickHistory.includes(el.abilityId)
      && !(ultPicked && el.ult) && (pickHistory.length > 29 || el.stats.survival[pickHistory.length + 10] < .6))
      , [ultPicked, pickHistory]), [mappedSkills, pickHistory, ultPicked])
  let goldPredictSkill = useMemo(() => [...filteredPredictSkills].sort(sortPredict('gold', 'desc')), [filteredPredictSkills, sortPredict])
  let damagePredictSkill = useMemo(() => [...filteredPredictSkills].sort(sortPredict('damage', 'desc')), [filteredPredictSkills, sortPredict])
  let winPredictSkill = useMemo(() => [...filteredPredictSkills].sort(sortPredict('win', 'desc')), [filteredPredictSkills, sortPredict])
  let isUlt = useCallback((skillId: number) => state.ultimates.findIndex(el => el.abilityId === skillId) !== -1, [state.ultimates])
  let setCombo = useCallback((slot: number, combos: ComboResponse[]) => {
    setState(state => {
      let newCombos = { ...state.combos }
      newCombos[slot] = combos
      return { ...state, combos: newCombos }
    })
  }, [setState])
  let topComboDenies = useMemo(() => {
    let dire = selectedPlayer % 2 === 1
    let slots = [0, 2, 4, 6, 8]
    let offset = dire ? 0 : 1
    let allCombos: ComboResponse[] = []
    slots.forEach((el) => {
      allCombos = [...allCombos, ...combos[el + offset]]
    })
    return filterAvailableCombos(allCombos, picks)
      .sort((el1, el2) => (el2.winPct - el2.avgWinPct) - (el1.winPct - el1.avgWinPct))
      .filter(el => (el.winPct - el.avgWinPct) > .03)
      .slice(0, 4)
  }, [combos, picks, selectedPlayer])

  return (
    <div className="App bp4-dark">
      <Header logo={Logo}>
        {room === '' && <li data-testid="createRoomBtn" onClick={sendCreateRoom}>Create Room</li>}
        {room === '' && <li><Popover2 data-testid="joinRoomBtn" placement='bottom' content={<JoinRoom joinRoom={sendJoinRoom} />}>Join Room</Popover2></li>}
        {room !== '' && <li data-testid="leaveRoomBtn" onClick={() => emitLeaveRoom()}>Leave Room</li>}
        {room !== '' && <RoomInfo room={room} roomCount={state.roomCount} />}
        <li><Controls randomizeBoard={randomizeBoard} resetBoard={resetBoard} strictMode={strictMode} setStrictMode={setStrictMode} /></li>
        <li><Help /></li>
      </Header>
      <InvokerAlert
        isOpen={invokerOpen}
        dismissPopop={() => setInvokerOpen(false)}
        setSkills={(skills: number[]) => setHeroState(skills, null, ultLu[state.activeSlot])}
        invokerSkills={heroDict[74]}
      />
      {ultAndSkillLoaded && <DraftBoard>
        <DraftBoardColumn location={'center'}>


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
                  (state.activeSlot === slot && <HeroSearch key={slot} closeSearch={closeSearch} ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                  <HeroSearchName setCombo={setCombo} slotCombos={combos[slot]} isUlt={isUlt} allSkills={state.skillDict} availableSkills={availableSkillIds} activePick={activePick} slot={slot} skills={mappedHistory} key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
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
                  (state.activeSlot === slot && <HeroSearch key={slot} closeSearch={closeSearch} ultimates={state.ultimates} setHero={setHero} slot={ultLu[slot]} />) ||
                  <HeroSearchName setCombo={setCombo} slotCombos={combos[slot]} isUlt={isUlt} allSkills={state.skillDict} availableSkills={availableSkillIds} activePick={activePick} slot={slot} skills={mappedHistory} key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
                )
              })}
            </Card>
          </PickedContainer>
        </DraftBoardColumn>

        <DraftBoardColumn location='player'>
          <Card title="Player Skills">
            <PlayerSkillContainer
              combos={filterAvailableCombos(combos[selectedPlayer], picks)}
              topComboDenies={topComboDenies}
              slotHeros={Array.from({ length: 10 }).map((_, i) => {
                let skill = skills[ultLu[i] * 4]
                if (skill !== null)
                  return heroNameDict[skillHeroDict[skill]]
                else
                  return null
              })}
              damagePredictSkill={damagePredictSkill}
              winPredictSkill={winPredictSkill}
              goldPredictSkill={goldPredictSkill}
              pickedSkills={mappedHistory}
              skillDict={skillDict}
              selectedPlayer={selectedPlayer}
              setSelectedPlayer={(playerSlot: number) => { setState(state => ({ ...state, selectedPlayer: playerSlot })) }}
            />
          </Card>
        </DraftBoardColumn>

        {/* <TopCombos skills={mappedSkills} /> */}

        <DraftBoardColumn location='overview'>
          {filterNonNullSkills(skills).length > 0 && <SurvivalContainer>
            <SkillDatatable pickSkill={setPickedSkill} turn={turn} skills={mapSkills(availableSkillIds)} />
          </SurvivalContainer>}
        </DraftBoardColumn>
      </DraftBoard>}
    </div>
  );
}

export default App;
