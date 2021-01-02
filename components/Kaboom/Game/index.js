import React, {useState, useEffect} from 'react'

import styles from './Game.module.css';

import Deck from '../Deck'
import DisplayPlayers from '../DisplayPlayers'
import MainPlayerUI from '../MainPlayerUI'
import OtherPlayerUI from '../OtherPlayerUI'

import socket from "../socket";

const Game = (props) => {

  const [myState,setMyState] = useState({
    id: null,
    name: null,
  });
  const [players,setPlayers] = useState([]);
  const [gameIsRunning,setGameIsRunning] = useState(false);
  const [playEffect,setPlayEffect] = useState(false);

  const [currentPlayer,setCurrentPlayer] = useState('');
  const [currentDeck,setCurrentDeck] = useState([]);
  const [myCards,setMyCards] = useState([]);
  const [highlight,setHighlight] = useState({
    ownCards: false,
    otherCards: false,
    graveyard: false,
    deck: false
  });

  const [focusCard,setFocusCard] = useState({
    value: null,
    color: null,
    position: null,
  });

  let classes = [styles.Game];
  classes.push(props.className);

  // Init new state
  useEffect(() => {

    setMyState({
      ...myState,
      id: socket.id
    });

    socket.emit('initialSetup');

    socket.on('getDeck', (data) => {
      setCurrentDeck(data)
    });

    socket.on('playersUpdated', (data) => {
      setPlayers( data );
      let myPlayerData = data.find( p => p.id === socket.id );

      setMyState({
        ...myState,
        id: socket.id,
        // name: myPlayerData.name
      });

    });

    socket.on('gameIsRunningUpdate', (data) => {
      setGameIsRunning( data );
    });

    socket.on('currentPlayer', function (pID) {
      setCurrentPlayer(pID);
    });

    socket.on('playEffect', function () {
      setPlayEffect(true);
    });

    return () => {
      // detach listeners
      socket.off('getDeck');
      socket.off('playersUpdated');
      socket.off('gameIsRunningUpdate');
      socket.off('currentPlayer');
      socket.off('playEffect');
    }
  }, []);

  useEffect( ()=>{
    let arr = [];

    // build deck
    if( Array.isArray(currentDeck.hand) && currentDeck.hand.length > 0 ){
      arr = currentDeck.hand.filter( (c) => c.player === myState.id );
      setMyCards( arr );
    }else{
      setMyCards( [] );
    }

  }, [currentDeck,myState.id] );

  useEffect( ()=>{
    // console.log(myState)
  }, [myState] );

  useEffect( ()=>{

    console.log(currentDeck)

    if( playEffect ){
      executeEffect( currentDeck.graveyard[ currentDeck.graveyard.length-1 ] );
    }

  }, [currentDeck,playEffect] );

  useEffect( ()=>{

    if( currentPlayer === myState.id ){
      setHighlight({
        ownCards: false,
        otherCards: false,
        graveyard: true,
        deck: true
      });
    }else{
      // empty highlights
      setHighlight({
        ownCards: false,
        otherCards: false,
        graveyard: false,
        deck: false
      });

      // empty focus card, just in case...
      setFocusCard({
        value: null,
        color: null,
        position: null,
      });

      // turn off effect, just in case...
      setPlayEffect(false);
    }


  }, [currentPlayer,myState.id] );

  useEffect( ()=>{

    switch( focusCard.position){
     case 'deck':
        setHighlight({
          ownCards: true,
          otherCards: false,
          graveyard: true,
          deck: false,
        });
        break;
      case 'graveyard':
        setHighlight({
          ownCards: true,
          otherCards: false,
          graveyard: false,
          deck: false,
        });
        break;
    }

  }, [focusCard] );

  let cardClick = (card) => {

    // swopped with deck
    if( focusCard.position === 'deck' ){

      socket.emit('cardSwoppedFromDeck', card);
      socket.emit('nextTurn');

    // swopped with graveyard
    }else if( focusCard.position === 'graveyard' ){

      socket.emit('cardSwoppedFromGraveyard', card);
      socket.emit('nextTurn');

    // regular getting rid of card
    }else{
      socket.emit('cardPlayed', card);
    }
  }

  let drawCardFn = () => {

    setFocusCard({
      ...currentDeck.deck[0],
      position: 'deck'
    });

    //socket.emit('drawCard');
  }

  let graveyardClick = () => {

    if( focusCard.position === 'deck' ){

      socket.emit('cardFromDeckToGraveyard');

    // regular getting rid of card
    }else if( myState.id === currentPlayer && gameIsRunning && !focusCard.value ){

      setFocusCard({
        ...currentDeck.graveyard[ currentDeck.graveyard.length-1 ],
        position: 'graveyard'
      });

    }else{
      // do nothing
    }
  }

  let executeEffect = (card) => {

    switch( card.value.toString() ){

      case '7':
      case '8':
        socket.emit('nextTurn'); // not done yet
        break;

      case '9':
      case '10':
        socket.emit('nextTurn'); // not done yet
        break;

      case 'J':
      case 'Q':
        socket.emit('nextTurn'); // not done yet
        break;

      case 'K':
        socket.emit('nextTurn'); // not done yet
        break;

      default:
        // nothing, end turn
        socket.emit('nextTurn');
        break;
    }

  }

  let playerUIs = null;
  playerUIs = players.map( (p,k) => {
    if( p.id == myState.id /* || k > 2 */ ){
      return null;
    }else if ( currentDeck.hand && currentDeck.hand.length > 0 ){
      let playerCards = currentDeck.hand.filter( (c) => c.player === p.id );
      return <OtherPlayerUI
        key={'player-no_'+k}
        k={k}
        player={p}
        isCurrent={ p.id === currentPlayer && gameIsRunning ? true : false }
        cards={playerCards}
        isHighlight={ highlight.otherCards } />;
    }
  } )

  let myPlayerUI = <MainPlayerUI
    player={myState}
    cards={myCards}
    isCurrent={ myState.id === currentPlayer && gameIsRunning ? true : false }
    onClick={  (c)=>cardClick(c) }
    isHighlight={ highlight.ownCards } />;

  // let buttons = [];

  let startButton = <button onClick={()=>{ socket.emit('startStop'); }} >{ gameIsRunning ? 'Stop Game' : 'Start Game' }</button>

  return (
    <div className={classes.join(" ")}>

      <div className={styles.PlayerUIsContainer}>
        {playerUIs}
      </div>

      <Deck
        deck={currentDeck}
        drawCard={()=>{drawCardFn()}}
        clickGraveyard={()=>{graveyardClick()}}
        isCurrent={ myState.id === currentPlayer && gameIsRunning ? true : false }
        isHighlight={ highlight } />

      {myPlayerUI}

      <DisplayPlayers
        currentPlayer={currentPlayer}
        gameIsRunning={gameIsRunning}
        players={players} />

      {startButton}

      <button onClick={()=>{ socket.emit('nextTurn'); }} >Next Turn</button>

    </div>
  )
}

export default Game
