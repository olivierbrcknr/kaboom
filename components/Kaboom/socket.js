import io from "socket.io-client";

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 3000;


let socketURL = 'https://kaboom-game.herokuapp.com/';
if( dev ){
  socketURL = "http://localhost:"+PORT;
}

let socket = io(socketURL);
socket.on('connect',(data)=>{ console.log('connected to the Kaboom Server',socketURL) })

export default socket;


