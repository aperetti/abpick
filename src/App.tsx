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
import Skill from './types/Skill';
import PickSkills from './PickSkills';
import SurvivalContainer from './SurvivalContainer';
import Controls from './Controls'
import JoinRoom from './JoinRoom';
import HeroSearch from './HeroSearch';
import SkillDatatable from './SkillDatatable';
import getAllSkills, { HeroSkillStatDict } from './api/getAllSkills';
import HeroSkillDict from './types/HeroDict';
import HeroSearchName from './HeroSearchName';
import { Popover2 } from '@blueprintjs/popover2';
import PlayerSkillContainer from './PlayerSkillContainer';
import Help from './Help';
import RoomInfo from './RoomInfo';
import { filterAvailableCombos, filterAvailableSkills, filterNonNullSkills, getSkillCombos, nextPick } from './utils';
import getBestCombos, { ComboResponse } from './api/getCombos';
import InvokerAlert from './InvokerAlert';
import GameStats, { ScoreMetric } from './GameStats';
import { useWindowSize } from 'usehooks-ts';
import { Button, Classes, Drawer, DrawerSize, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import MobileRecSkills from './MobileRecSkills';

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
export interface RecPick { skill: number, bonus: number, details?: ScoreMetric[] }
export interface State {
  roomCount: number,
  recPicks: RecPick[],
  selectedPlayer: number,
  allCombos: ComboResponse[],
  heroNameDict: HeroNameDict,
  skillHeroDict: SkillHeroDict,
  heroSkillDict: HeroSkillDict,
  heroSkillStatDict: HeroSkillStatDict,
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
  allCombos: [],
  recPicks: [],
  heroNameDict: {},
  skillHeroDict: {},
  heroSkillStatDict: {},
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

const ultLu = [0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6]

function App() {
  const size = useWindowSize()
  const draftBoardScale = useMemo(() => {
    if (size.width < 600)
      return size.width / 420 * .9
    else
      return 1
  }, [size])
  let [state, setState] = useState<State>(initialState)
  let { recPicks, heroNameDict, skillHeroDict, skillDict, skills, ultimates, room, editMode, picks, heroSkillDict: heroDict, strictMode, selectedPlayer, allCombos } = state
  let [invokerOpen, setInvokerOpen] = useState(false)
  let [drawer, setDrawer] = useState(false)
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
  }, [setHeroState, heroDict])

  const closeSearch = useCallback(() => setState(state => ({ ...state, activeSlot: -1 })), [])



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

      return {
        ...state,
        picks: newPicks,
        changeId: state.changeId + 1,
      }
    })

  }, [activePick])

  useEffect(() => {
    if (skills.every(el => el !== null && el !== -1)) {
      getBestCombos([], filterNonNullSkills(skills)).then(comboResponse => {
        setState(state => ({ ...state, allCombos: comboResponse }))
      }).catch(err => console.log(err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(skills)])

  useEffect(() => {
    getUltimates(setState)
    getAllSkills(setState)
    onStateUpdate(mergeState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let resetBoard = useCallback(() => setState(state => ({
    ...state,
    recPicks: initialState.recPicks,
    allCombos: initialState.allCombos,
    picks: initialState.picks,
    skills: initialState.skills,
    changeId: state.changeId + 1
  })), [setState])

  const randomizeBoard = useCallback((balance: boolean = true) => {
    resetBoard()
    let getWinRate = (ult: Ultimate) => state.heroSkillStatDict[ult.heroId]?.winRate || .5
    let ults = shuffle(ultimates).filter(el => el.heroId !== 74)
    let availableUlts = ults.slice(12,)
    ults = ults.slice(0, 12).sort((ult1, ult2) => {
      if (balance)
        return getWinRate(ult2) - getWinRate(ult1)
      else
        return 0
    })

    let radUlts = shuffle(ults.filter((el, i) => i % 2 === 0))
    let direUlts = shuffle(ults.filter((el, i) => i % 2 === 1))

    if (balance) {
      let getScore = (ults: Ultimate[]) => ults.reduce((score, el) => score + getWinRate(el), 0)
      let scoreDiff = (ults1: Ultimate[], ults2: Ultimate[]) => Math.abs(getScore(ults1) - getScore(ults2))

      let swap = (ults1: Ultimate[], ults2: Ultimate[], i: number) => {
        let nUlts1 = [...ults1]
        let nUlts2 = [...ults2]
        nUlts1[i] = ults2[i]
        nUlts2[i] = ults1[i]
        return [nUlts1, nUlts2]
      }
      for (let index = 0; index < 5; index++) {
        let [nRadUlts, nDireUlts] = swap(radUlts, direUlts, index)
        if (scoreDiff(nRadUlts, nDireUlts) < scoreDiff(radUlts, direUlts)) {
          radUlts = nRadUlts
          direUlts = nDireUlts
        }
      }
    }

    Array(6).fill(0).map((el, i) => [radUlts[i], direUlts[i]]).flatMap(el => el)
      .forEach((ult, idx) => {
        let i = ultLu[idx]
        setHero(ult, i)
        if (ult.abilityId === null) {
          let ultIdx = availableUlts.findIndex(el => el.abilityId !== null)
          setHero(availableUlts[ultIdx], i, true)
          availableUlts = availableUlts.slice(ultIdx + 1,)
        }
      })
    setState(state => ({
      ...state,
    }))
  }, [setHero, ultimates, resetBoard, state.heroSkillStatDict])

  useEffect(() => {
    const roomRegex = /^\/(\w{5})$/
    let match = window.location.pathname.match(roomRegex)
    if (match && room !== match[1]) {
      sendJoinRoom(window.location.pathname.slice(1, 6).toUpperCase())
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

  let availableSkillIds = useMemo(() => filterAvailableSkills(skills, picks), [skills, picks])

  let ultAndSkillLoaded = state.skillsHydrated && state.ultimatesHydrated

  let topComboDenies = useMemo(() => {
    let dire = selectedPlayer % 2 === 1
    let slots = [0, 2, 4, 6, 8]
    let offset = dire ? 0 : 1
    let oppSkills: (number | null)[] = []
    slots.forEach((el) => {
      let slot = el + offset
      oppSkills = [...oppSkills, ...picks.slice(slot * 4, slot * 4 + 4)]
    })
    let oppCombos = getSkillCombos(allCombos, filterNonNullSkills(oppSkills))

    return filterAvailableCombos(oppCombos, picks)
      .sort((el1, el2) => (el2.winPct - el2.avgWinPct) - (el1.winPct - el1.avgWinPct))
      .filter(el => (el.winPct - el.avgWinPct) > .03)
  }, [picks, allCombos, selectedPlayer])

  let allHeroSkillStats = useMemo(() => {
    if (!skills)
      return Array(10).fill(null)
    let slots = Array(10).fill(0).map((el, i) => i)
    return slots.map(slot => {
      let skill = skills[ultLu[slot] * 4]
      if (skill) {
        let heroSkillStats = state.heroSkillStatDict[skillHeroDict[skill]]
        if (heroSkillStats) {
          return heroSkillStats
        } else {
          return null
        }
      } else {
        return null
      }
    })
  }, [state.heroSkillStatDict, skillHeroDict, skills])

  let recPicksTop4 = recPicks.slice(0, 4)
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
      { draftBoardScale < 1 && <>
        <Button icon={drawer ? "menu-open" : "menu-closed"} style={{ position: 'fixed', top: 10, right: 20, zIndex: 999 }} onClick={() => setDrawer(true)} />
        <Drawer title="Settings" size={DrawerSize.STANDARD} onClose={() => setDrawer(false)} isOpen={drawer} className={`${Classes.DARK}`} style={{ paddingTop: '50px' }}>
          <Menu>
            <MenuDivider title='Play Together' />
            {room === '' && <MenuItem icon='insert' data-testid="createRoomBtn" onClick={sendCreateRoom} text='Create Room'></MenuItem>}
            {room === '' && <MenuItem icon='locate' text='Join Room'><JoinRoom joinRoom={sendJoinRoom} /></MenuItem>}
            {room !== '' && <MenuItem disabled data-testid="leaveRoomBtn" onClick={() => emitLeaveRoom()} text={`Room: ${room}`}/>}
            {room !== '' && <MenuItem icon='disable' data-testid="leaveRoomBtn" onClick={() => emitLeaveRoom()} text='Leave Room' />}
            <MenuDivider title='Board Options' />
            <MenuItem icon="random" text="True Randomize" onClick={() => randomizeBoard(false)} />
            <MenuItem icon="changes" text="Balanced Randomize" onClick={() => randomizeBoard()} />
            <MenuItem icon="reset" text="Reset Board" onClick={resetBoard} />
            <MenuDivider title='Misc Options' />
            <MenuItem
              shouldDismissPopover={false}
              icon={`${strictMode ? 'full-circle' : 'circle'}`}
              text={`${strictMode ? 'Disable Strict Mode' : 'Enable Strict Mode'}`}
              onClick={() => setStrictMode(!strictMode)} />
          </Menu>
        </Drawer>
      </>}

      <InvokerAlert
        isOpen={invokerOpen}
        dismissPopop={() => setInvokerOpen(false)}
        setSkills={(skills: number[]) => setHeroState(skills, null, ultLu[state.activeSlot])}
        invokerSkills={heroDict[74]}
      />
      {ultAndSkillLoaded && <DraftBoard scale={draftBoardScale}>
        <DraftBoardColumn location={'center'}>
          {draftBoardScale < 1 && recPicks.length > 0 && <MobileRecSkills width={size.width} skillDict={skillDict} recPicks={recPicks}/>}
          <GameStats skillDict={skillDict} picks={picks} allCombos={allCombos} heros={allHeroSkillStats} playerHeroes={Array(10).fill(0).map((el, i) => heroSlot[ultLu[i]])} >
          </GameStats>
          <UltimateContainer>
            <Card title="Ultimates">
              <UltimateSkills
                recPicks={recPicksTop4}
                editMode={editMode}
                setPickedSkill={setPickedSkill}
                pickHistory={pickHistory}
                setHero={setHero}
                skills={mappedSkills}
                ultimates={filteredUlts} />
            </Card>
          </UltimateContainer>

          <PickContainer>
            <Card title="Standard Abilities" contentClass="pick-container-content">
              {[0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6].map(slot => {
                return (
                  <PickSkills
                    recPicks={recPicksTop4}
                    key={`standard-abilities-${slot}`}
                    setPickedSkill={setPickedSkill}
                    pickHistory={pickHistory}
                    slot={slot}
                    skills={mappedSkills.slice(slot * 4, slot * 4 + 3)} />)
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
                  <HeroSearchName activePick={activePick} slot={slot} skills={mappedHistory} key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
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
                  <HeroSearchName activePick={activePick} slot={slot} skills={mappedHistory} key={`hero-search-${slot}`} onClick={() => setState({ ...state, activeSlot: slot })} hero={heroSlot[ultLu[slot]]} />
                )
              })}
            </Card>
          </PickedContainer>
        </DraftBoardColumn>

        <DraftBoardColumn location='player'>
          <Card title="Player Skills">
            <PlayerSkillContainer
              turn={turn}
              setRecPicks={(picks: RecPick[]) => setState(state => ({ ...state, recPicks: picks }))}
              recPicks={recPicks}
              allCombos={allCombos}
              topComboDenies={topComboDenies}
              slotHeros={Array.from({ length: 10 }).map((_, i) => {
                let skill = skills[ultLu[i] * 4]
                if (skill !== null)
                  return heroNameDict[skillHeroDict[skill]]
                else
                  return null
              })}
              skills={skills}
              allHeroSkillStats={allHeroSkillStats}
              pickedSkills={mappedHistory}
              skillDict={skillDict}
              selectedPlayer={selectedPlayer}
              setSelectedPlayer={(playerSlot: number) => { setState(state => ({ ...state, selectedPlayer: playerSlot })) }}
            />
          </Card>
        </DraftBoardColumn>

        {filterNonNullSkills(skills).length > 0 && <DraftBoardColumn location='overview'>
          <SurvivalContainer>
            <SkillDatatable pickSkill={setPickedSkill} turn={turn} skills={mapSkills(availableSkillIds)} />
          </SurvivalContainer>
        </DraftBoardColumn>}
      </DraftBoard>}

    </div>
  );
}

export default App;
