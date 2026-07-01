// import { io } from "socket.io-client";
// const socket = io(import.meta.env.VITE_API_URL); // or hardcoded URL
// export default socket;

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
      autoConnect: false, // we connect manually once we know a token exists
    });
    // ADD THESE THREE LISTENERS
    socket.on("connect", () => console.log("🟢 socket connected:", socket?.id));
    socket.on("disconnect", (reason) => console.log("🔴 socket disconnected:", reason));
    socket.on("connect_error", (err) => console.log("🟠 socket connect_error:", err.message));
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  // refresh token in case it changed since the socket instance was created
  s.auth = { token: localStorage.getItem("token") };
  if (!s.connected) {
    console.log("📡 calling s.connect()..."); // ADD
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
