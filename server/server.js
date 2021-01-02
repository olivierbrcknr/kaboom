const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')
const colors = require('colors');

const deckFn = require('./deckFunctions.js');
const rules = require('./kaboomRules.js');

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

const PORT = process.env.PORT || 3000;

// generate deck
let deck = deckFn.createDefault();

// players
let players = [];

// gameIsRunning
let gameIsRunning = false;
let roundCount = 0;
let currentPlayer = 0;

console.log(`🧘‍♀️ Server is waiting`.black)


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
    // const closedSocket = players[closedSocketIndex];

    console.log(`⭕️ ${closedSocketIndex+1} disconnected`.red)

    if (closedSocketIndex > -1) {
      players.splice(closedSocketIndex, 1);
    }

    // only send to all but sender, because sender does not exist anymore
    socket.broadcast.emit("playersUpdated", players);

  });

  socket.on('startStop', (data)=>{
    gameIsRunning = !gameIsRunning;

    // start game
    if( gameIsRunning ){
      deck = deckFn.distribute( deck, players );
      console.log('deck distributed');

    // reset game
    }else{
      deck = deckFn.createDefault();
      roundCount = 0;
    }

    socket.emit('gameIsRunningUpdate', gameIsRunning);
    socket.broadcast.emit('gameIsRunningUpdate', gameIsRunning);

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);
  });

  socket.on('initialSetup', (data) => {
    console.log( 'inital setup sent to ' + '' );

    socket.emit('getDeck', deck);
    socket.emit('gameIsRunningUpdate', gameIsRunning);
  });


  socket.on('cardPlayed', (card)=>{

    console.log(card)

    deck = rules.checkIfPlayable( deck, card );

    socket.emit('getDeck', deck);
    socket.emit('gameIsRunningUpdate', gameIsRunning);
  })
})

nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log('> Ready on ',PORT)
  });
})
