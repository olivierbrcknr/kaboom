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
roundIsRunning = false;
let currentPlayer = 0;
let lastStartingPlayer = 0;
let endingPlayer = false;
let endingByChoice = false;

console.log(`🧘‍♀️ Server is waiting`.black)

// socket.io server
io.on('connection', socket => {

  console.log(`🔌 New client connected`.green);

  // add new player
  players.push( {
    id: socket.id,
    name: 'Player ' + players.length,
    points: 0,
    roundPoints: [],
    isPlaying: false
  } );

  if( players.length < 4 && !gameIsRunning ){
    players[ players.length-1 ].isPlaying = true;
  }

  // show everyone who playes
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

  socket.on('playerToggle', (pID)=>{

    const pIndex = players.findIndex(element => element.id === pID);

    let arePlaying = 0;

    // check how many are currently playing
    for ( let i = 0; i < players.length; i++ ){
      if( players[i].isPlaying ){
        arePlaying++;
      }
    }

    let newVal = !players[pIndex].isPlaying;

    // if more playing than allowed && the new index is true
    if( arePlaying >= 4 && newVal ){
      let spaceIsMade = false;
      for ( let i = 0; i < players.length; i++ ){
        if( players[i].isPlaying && !spaceIsMade ){
          players[i].isPlaying = false;
          spaceIsMade = true;
        }
      }
    }

    players[pIndex].isPlaying = newVal;

    socket.emit("playersUpdated", players);
    socket.broadcast.emit("playersUpdated", players);

  });

  socket.on('initialSetup', (data) => {

    const thisSIndex = players.findIndex(element => element.id === socket.id);
    const playerName = players[thisSIndex].name;

    console.log( 'inital setup sent to ' + playerName );

    socket.emit('getDeck', deck);
    socket.emit('gameIsRunningUpdate', gameIsRunning);
    socket.emit("playersUpdated", players);
    socket.emit('roundUpdate', roundCount, roundIsRunning);
  });


  // Card fns —————————————————————————————————————————————

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


  // Game fns —————————————————————————————————————————————

  socket.on('startGame', ()=>{
    gameIsRunning=true;
    roundCount = 0;
    players = players.map( (p,k)=>{
      return {
        ...p,
        points: 0,
        roundPoints: []
      }
    } );
    currentPlayer = deckFn.checkNextPlayer( players, 0 );

    deck = deckFn.createDefault();

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);

    socket.emit('gameIsRunningUpdate', gameIsRunning);
    socket.broadcast.emit('gameIsRunningUpdate', gameIsRunning);

    socket.emit("playersUpdated", players);
    socket.broadcast.emit("playersUpdated", players);

    socket.emit('currentPlayer', players[currentPlayer].id);
    socket.broadcast.emit('currentPlayer', players[currentPlayer].id);
  });


  socket.on('endGame', ()=>{
    gameIsRunning=false;
    roundIsRunning = false;
    roundCount=0;

    socket.emit('roundUpdate', roundCount, roundIsRunning);
    socket.broadcast.emit('roundUpdate', roundCount, roundIsRunning);

    socket.emit('gameIsRunningUpdate', gameIsRunning);
    socket.broadcast.emit('gameIsRunningUpdate', gameIsRunning);
  });

  socket.on('startRound', ()=>{

    roundIsRunning = true;
    endingPlayer = false;
    endingByChoice = false;

    deck = deckFn.createDefault();
    deck = deckFn.distribute( deck, players );
    console.log('deck distributed');

    currentPlayer = deckFn.checkNextPlayer( players, lastStartingPlayer );
    if( currentPlayer >= players.length ){
      currentPlayer = 0;
    }

    socket.emit('roundUpdate', roundCount, roundIsRunning);
    socket.broadcast.emit('roundUpdate', roundCount, roundIsRunning);

    socket.emit('currentPlayer', players[currentPlayer].id);
    socket.broadcast.emit('currentPlayer', players[currentPlayer].id);

    socket.emit('getDeck', deck);
    socket.broadcast.emit('getDeck', deck);

    socket.emit('endingPlayerID', endingPlayer);
    socket.broadcast.emit('endingPlayerID', endingPlayer);
  });

  let roundHasEnded = (socket) => {
    roundIsRunning = false;
    roundCount++;

    // calculate points
    players = rules.calcPlayerPoints( players, deck, endingPlayer, endingByChoice );

    let gameHasEnded = rules.calcIfEnded( players );

    socket.emit('roundUpdate', roundCount, roundIsRunning);
    socket.broadcast.emit('roundUpdate', roundCount, roundIsRunning);

    socket.emit('playersUpdated', players);
    socket.broadcast.emit('playersUpdated', players);

    if( gameHasEnded ){
      socket.emit('gameHasEnded');
      socket.broadcast.emit('gameHasEnded');
    }
  }

  socket.on('endRound', ()=>{

    roundHasEnded( socket );

  });

  socket.on( 'playerIsEnding', (pID) => {

    endingByChoice = true;
    endingPlayer = pID;

    socket.emit('endingPlayerID', endingPlayer);
    socket.broadcast.emit('endingPlayerID', endingPlayer);

  } )

  socket.on('nextTurn',()=>{

    currentPlayer = deckFn.checkNextPlayer( players, currentPlayer );

    if( !endingPlayer ){
      endingPlayer = rules.checkIfPlayerHasZeroCards( players,deck );
      socket.emit('endingPlayerID', endingPlayer);
      socket.broadcast.emit('endingPlayerID', endingPlayer);
    }

    if( endingPlayer === players[currentPlayer].id ){

      roundHasEnded( socket );

    }else{
      socket.emit('currentPlayer', players[currentPlayer].id);
      socket.broadcast.emit('currentPlayer', players[currentPlayer].id);
    }
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
