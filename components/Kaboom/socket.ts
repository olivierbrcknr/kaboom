import io from "socket.io-client";

const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// let socketURL = "https://kaboom-game.herokuapp.com/";
// if (dev) {
const socketURL = "http://localhost:" + PORT;
// }

const socket = io(socketURL);
socket.on("connect", () => {
  console.log("connected to the Kaboom Server", socketURL);
});

export default socket;
