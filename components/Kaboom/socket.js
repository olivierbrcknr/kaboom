import io from "socket.io-client";

const dev = process.env.NODE_ENV !== 'production'

// let socketURL = 'https://kaboomgame-server.herokuapp.com/';
// if( dev ){
let socketURL = "http://localhost:3000"
// }

let socket = io(socketURL);
socket.on('connect',(data)=>{ console.log('connected to the Kaboom Server',socketURL) })

export default socket;


