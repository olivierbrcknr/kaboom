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
let lastStartingPlayer = 0;

console.log(`🧘‍♀️ Server is waiting`.black)

// socket.io server
io.on('connection', socket => {

  console.log(`🔌 New client connected`.green);

  // add new player
  players.push( {
    id: socket.id,
    name: 'Player ' + players.length,
    points: 0,
    isPlaying: false
  } );

  // send update to all:
  // sending to the client
  socket.emit("playersUpdated", players);
  socket.broadcast.emit("playersUpdated", players);

  socket.on("disconnect", () => {

    const closedSocketIndex = players.findIndex(element => element.id === socket.id);
    const closedPlayer = players[closedSocketIndex];

    console.log(`⭕️ ${closedPlayer.name} disconnected`.red)

    if (closedSocketIndex > -1) {
      players.splice(closedSocketIndex, 1);
    }

    // only send to all but sender, because sender does not exist anymore
    socket.broadcast.emit("playersUpdated", players);

  });

  socket.on('nameChange', (newName)=>{

    const relID = players.findIndex(element => element.id === socket.id);
    players[relID].name = newName;

    socket.emit("playersUpdated", players);
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
      currentPlayer = lastStartingPlayer+1;
      if( currentPlayer >= players.length ){
        currentPlayer = 0;
      }
    }

    socket.emit('gameIsRunningUpdate', gameIsRunning);
    socket.broadcast.emit('gameIsRunningUpdate', gameIsRunning);

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);

    socket.emit('currentPlayer', players[currentPlayer].id);
    socket.broadcast.emit('currentPlayer', players[currentPlayer].id);
  });

  socket.on('initialSetup', (data) => {

    const thisSIndex = players.findIndex(element => element.id === socket.id);
    const playerName = players[thisSIndex].name;

    console.log( 'inital setup sent to ' + playerName );

    socket.emit('getDeck', deck);
    socket.emit('gameIsRunningUpdate', gameIsRunning);
    socket.emit('playersUpdated', players);
  });


  socket.on('nextTurn',()=>{

    currentPlayer++;
    if( currentPlayer >= players.length ){
      currentPlayer = 0;
    }

    socket.emit('currentPlayer', players[currentPlayer].id);
    socket.broadcast.emit('currentPlayer', players[currentPlayer].id);
  });



  socket.on('drawCard',(type)=>{
    socket.broadcast.emit('highlightDeck', type);
  });


  socket.on('cardPlayed', (card)=>{

    let callBack = (targetCard) => {
      socket.emit('selectCardToSwop',targetCard);
    }

    deck = rules.checkIfPlayable( deck, card, socket.id, callBack );

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);
  });

  socket.on('cardSwoppedFromDeck', (card)=>{

    let nextCard = deck.deck[ 0 ];
    deck = rules.swopCardFromDeck( deck, card );

    socket.broadcast.emit('highlightSwop', [nextCard], 'lookAt');

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);
  });

  socket.on('cardSwoppedFromGraveyard', (card)=>{

    let currentCard = deck.graveyard[ deck.graveyard.length-1 ];
    deck = rules.swopCardFromGraveyard( deck, card );

    socket.broadcast.emit('highlightSwop', [currentCard], 'lookAt');

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);
  });

  socket.on('cardSwoppedBetweenPlayers', (cards)=>{

    deck = rules.cardSwoppedBetweenPlayers( deck, cards );

    socket.broadcast.emit('highlightSwop', cards, 'swop');

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);
  });


  socket.on('cardShiftedToPlayer', (card,oldCard)=>{

    deck = rules.cardShiftedToPlayer( deck, card, oldCard );

    socket.broadcast.emit('highlightSwop', [card], 'swop');

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);
  });

  socket.on('cardFromDeckToGraveyard', ()=>{

    deck = rules.cardFromDeckToGraveyard( deck );

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);

    socket.emit('playEffect');
    // socket.broadcast.emit('playEffect');
  });

  socket.on('highlightCard', (cards,type)=>{
    socket.broadcast.emit('highlightSwop',cards,type);
  });

  socket.on('endRound', ()=>{

    // calculate points
    players = rules.calcPlayerPoints( players, deck );

    // reset all data
    deck = deckFn.createDefault();
    roundCount = 0;
    currentPlayer = lastStartingPlayer+1;
    if( currentPlayer >= players.length ){
      currentPlayer = 0;
    }
    gameIsRunning=false;

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);
    socket.emit('gameIsRunningUpdate', gameIsRunning);
    socket.broadcast.emit('gameIsRunningUpdate', gameIsRunning);
    socket.emit('playersUpdated', players);
    socket.broadcast.emit('playersUpdated', players);
  });

});

nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log('> Ready on ',PORT)
  });
})
