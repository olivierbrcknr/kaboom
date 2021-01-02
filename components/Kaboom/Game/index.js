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
  const [players,setPlayers] = useState([

  ]);
  const [gameIsRunning,setGameIsRunning] = useState(false);

  const [currentDeck,setCurrentDeck] = useState([]);
  const [myCards,setMyCards] = useState([]);

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

    socket.on('disconnect', function () {
      console.log('disconnect client event....');
    });


    return () => {
      // detach listeners
      socket.off('getDeck');
      socket.off('playersUpdated');
      socket.off('gameIsRunningUpdate');
    }
  }, []);

  useEffect( ()=>{
    let arr = [];

    // build deck
    if( Array.isArray(currentDeck.hand) && currentDeck.hand.length > 0 ){

      arr = currentDeck.hand.filter( (c) => c.player === myState.id );
      arr = arr.map( (c,k) => {
        return {
          ...c,
          slot: {
            x: k,
            y: 0
          }
        }
      });

      setMyCards( arr );
    }else{
      setMyCards( [] );
    }

  }, [currentDeck,myState.id ] )

  useEffect( ()=>{
    // console.log(myState)
  }, [myState] )

  useEffect( ()=>{

    console.log(currentDeck)

  }, [currentDeck] )


  let cardClick = (card) => {
    socket.emit('cardPlayed', card);
  }

  let playerUIs = null;
  playerUIs = players.map( (p,k) => {
    if( p.id == myState.id /* || k > 2 */ ){
      return null;
    }else if ( currentDeck.hand && currentDeck.hand.length > 0 ){
      let playerCards = currentDeck.hand.filter( (c) => c.player === p.id );
      return <OtherPlayerUI key={'player-no_'+k} k={k} player={p} cards={playerCards} />;
    }
  } )

  let myPlayerUI = <MainPlayerUI player={myState} cards={myCards} onClick={  (c)=>cardClick(c) } />;

  // let buttons = [];

  let startButton = <button onClick={()=>{ socket.emit('startStop'); }} >{ gameIsRunning ? 'Stop Game' : 'Start Game' }</button>

  return (
    <div className={classes.join(" ")}>

      <div className={styles.PlayerUIsContainer}>
        {playerUIs}
      </div>

      <Deck deck={currentDeck} />

      {myPlayerUI}

      <DisplayPlayers players={players} />

      {startButton}

    </div>
  )
}

export default Game
