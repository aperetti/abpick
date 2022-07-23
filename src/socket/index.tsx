import io from 'socket.io-client'

let client = io('/')
let timeOut: NodeJS.Timeout
client.on('disconnect', () => {
    timeOut = setInterval(() => client.connect(), 1000)
})

let debug = false

export function resetListeners() {
    client.removeAllListeners()
}


export interface SocketAppState {
    skills: Array<number | null>;
    picks: (number|null)[];
    stateId: number;
    roomCount?: number
    _id: string;
    room: string;
}

export let onConnect = (cb: () => void) => {
    client.on('connect', () => {
        clearTimeout(timeOut)
        cb()
    })
}


export let onStateUpdate = (cb: (appState: SocketAppState) => void) => {
    debug && console.log("onStateUpdated")
    client.on('stateUpdated', cb)
}

export let emitJoinRoom = (roomId: string) => {
    debug && console.log("emitJoinRoom")
    client.emit('joinRoom', roomId)
}

export let emitCreateRoom = (state: SocketAppState) => {
    debug && console.log("emitCreateRoom")
    client.emit('createRoom', state)
}

export let onRoomJoined = (cb: (state: SocketAppState) => void) => {
    debug && console.log("onRoomJoined")
    client.on('roomJoined', cb)
}

export let emitLeaveRoom = () => {
    debug && console.log("emitLeaveRoom")
    client.emit('leaveRoom')
}

export let onRoomLeft = (cb: () => void) => {
    debug && console.log("onRoomLeft")
    client.on('roomLeft', cb)
}

export let emitUpdateState = (state: SocketAppState) => {
    debug && console.log("emitUpdateState")
    client.emit('updateState', state)
}

