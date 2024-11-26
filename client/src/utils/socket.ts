import { io, Socket } from 'socket.io-client';
import dotenv from 'dotenv';

dotenv.config()
const backEndUrl = process.env.RENDER_BACKEND_URL

const socket: Socket = io(backEndUrl || "http://localhost:3001", {
    autoConnect: true,
});

export default socket;