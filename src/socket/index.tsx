import io from 'socket.io-client'

let client = io('/')
let timeOut: NodeJS.Timeout
client.on('disconnect', () => {
    timeOut = setInterval(() => client.connect(), 1000)
})


export interface SocketAppState {
    skills: Array<number | null>;
    pickedSkills: Array<number | null>;
    pickHistory: number[];
    turn: number;
    stateId: number;
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
        client.on('stateUpdated', cb)
    }

    export let emitJoinRoom = (roomId: string) => {
        client.emit('joinRoom', roomId)
    }

    export let emitCreateRoom = (state: SocketAppState) => {
        client.emit('createRoom', state)
    }

    export let onRoomJoined = (cb: (state: SocketAppState) => void) => {
        client.on('roomJoined', cb)
    }

    export let emitLeaveRoom = () => {
        client.emit('leaveRoom')
    }

    export let emitUpdateState = (state: SocketAppState) => {
        client.emit('updateState', state)
    }

