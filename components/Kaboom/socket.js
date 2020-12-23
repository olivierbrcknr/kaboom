import socketIOClient from "socket.io-client";

const dev = process.env.NODE_ENV !== 'production'

let socketURL = 'https://kaboomgame.vercel.app/';
if( dev ){
  socketURL = "localhost:3000"
}

const socket = socketIOClient(socketURL);

export default socket;
