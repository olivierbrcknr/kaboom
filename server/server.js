const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')
const colors = require('colors');

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()


// generate deck
let createDefaultCardSet = () => {

  let defaultCardSet = [
    2,3,4,5,6,7,8,9,10,'J','Q','K','A'
  ];

  let cards = [];

  for ( let c = 0; c < 4; c++ ){
    for( let i = 0; i < defaultCardSet.length; i++ ){
      cards.push( {
        color: c,
        value: defaultCardSet[i],
        position: 'deck'
      } );
    }
  }

  for ( let j = 0; j < 3; j++ ){
    cards.push( {
      color: null,
      value: 'X',
      position: 'deck'
    } );
  }

  cards = shuffleDeck(cards);

  return cards;
}

let shuffleDeck = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

let deck = createDefaultCardSet();

// players
let players = [];

// gameIsRunning
let gameIsRunning = false;

// socket.io server
io.on('connection', socket => {

  console.log(`🔌 New client connected`.green);

  if( !gameIsRunning ){
    // add new player
    players.push( {
      id: socket.id,
      name: 'Player ' + players.length,
      points: 0,
    } );
  }

  // send update to all:
  // sending to the client
  socket.emit("playersUpdated", players);
  socket.broadcast.emit("playersUpdated", players);

  socket.on("disconnect", () => {

    const closedSocketIndex = players.findIndex(element => element.id === socket.id);
    const closedSocket = players[closedSocketIndex];

    console.log(`⭕️ ${closedSocket.name} disconnected`.red)

    if (closedSocketIndex > -1) {
      players.splice(closedSocketIndex, 1);
    }

    // only send to all but sender, because sender does not exist anymore
    socket.broadcast.emit("playersUpdated", players);

  });

  socket.on('initialSetup', (data) => {
    console.log( 'inital setup sent to ' + '' );

    socket.emit('getDeck', deck);
    socket.emit('gameIsRunningUpdate', gameIsRunning);
  })
})

nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  });
})
