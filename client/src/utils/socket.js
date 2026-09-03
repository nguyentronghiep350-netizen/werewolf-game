import { io } from 'socket.io-client';

// Nếu đang chạy dev Vite (port 5173), kết nối tới port 3001 của Express server
const SERVER_URL =
  window.location.port === '5173'
    ? 'http://localhost:3001'
    : window.location.origin;

export const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
