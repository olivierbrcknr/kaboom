import React, {useState, useEffect} from 'react'

import styles from './Game.module.css';

import Card from '../Card'


import socket from "../socket";


const Game = (props) => {

  let classes = [styles.Game];
  classes.push(props.className);


  // Init new state
  useEffect(() => {

    // ask for current state on mount
    // socket.emit('getCurrentMomentState', () => {});

    socket.emit('getCards', () => {});

    // listen to state changes from other instances
    socket.on('cards', (data) => {

      console.log('%c📩 received ' + data,'color: #AAA;')
    });

    return () => {
      // detach listeners
      socket.off('cards');
    }
  }, []);

  return (
    <div className={classes.join(" ")}>

      <Card number={7} symbol={2} />

    </div>
  )
}

export default Game
