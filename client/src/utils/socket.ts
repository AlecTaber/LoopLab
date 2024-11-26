import { io, Socket } from 'socket.io-client';
const backEndUrl = import.meta.env.RENDER_BACKEND_URL

const socket: Socket = io(backEndUrl || "http://localhost:3001", {
    autoConnect: true,
});

export default socket;