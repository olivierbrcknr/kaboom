import React, {useState, useEffect} from 'react'

import styles from './DisplayPlayers.module.css';

const DisplayPlayers = (props) => {

  let classes = [styles.DisplayPlayers];
  classes.push(props.className);

  let list = props.players.map( (p,k)=>{

    let playerClasses = [];

    if( p.id === props.currentPlayer && props.gameIsRunning ){
      playerClasses.push(styles.isCurrent);
    }

    return(
      <div className={playerClasses.join(" ")} key={p.id}>
        {p.name} [{p.points}]
      </div>
    )
  } );

  return (
    <div className={classes.join(" ")}>
      {list}
    </div>
  )
}

export default DisplayPlayers
