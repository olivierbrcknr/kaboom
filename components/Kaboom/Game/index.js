import React, {useState, useEffect} from 'react'

import styles from './Game.module.css';


import Deck from '../Deck'
import DisplayPlayers from '../DisplayPlayers'

import socket from "../socket";


const Game = (props) => {

  const [myState,setMyState] = useState({
    id: null,
    name: null,
  });
  const [players,setPlayers] = useState([

  ]);
  const [gameIsRunning,setGameIsRunning] = useState(false);

  const [currentDeck,setCurrentDeck] = useState(false);

  let classes = [styles.Game];
  classes.push(props.className);

  // Init new state
  useEffect(() => {

    setMyState({
      ...myState,
      id: socket.id
    });

    socket.emit('initialSetup', () => {});

    socket.on('getDeck', (data) => {
      setCurrentDeck(data)
    });

    socket.on('playersUpdated', (data) => {
      setPlayers( data );
    });

    socket.on('gameIsRunningUpdate', (data) => {
      setGameIsRunning( data );
    });

    return () => {
      // detach listeners
      socket.off('getDeck');
      socket.off('playersUpdated');
      socket.off('gameIsRunningUpdate');
    }
  }, []);

  useEffect( ()=>{
    console.log(currentDeck)
  }, [currentDeck] )

  return (
    <div className={classes.join(" ")}>

      <Deck deck={currentDeck} />

      <DisplayPlayers players={players} />

    </div>
  )
}

export default Game
