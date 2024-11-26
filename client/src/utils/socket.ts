import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.PORT || "http://localhost:3001", {
    autoConnect: true,
});

export default socket;