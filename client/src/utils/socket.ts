import { io, Socket } from 'socket.io-client';
import dotenv from 'dotenv';


const socket: Socket = io("http://localhost:3001", {

    autoConnect: true,
});

export default socket;