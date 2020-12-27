import io from "socket.io-client";

const dev = process.env.NODE_ENV !== 'production'

// let socketURL = 'https://kaboomgame-server.herokuapp.com:8003/';
// if( dev ){
let socketURL = "https://localhost:3001"
// }


let socket = io("http://localhost:3001");
socket.on('connect',(data)=>{ console.log('connected to the Kaboom Server') })

export default socket;
