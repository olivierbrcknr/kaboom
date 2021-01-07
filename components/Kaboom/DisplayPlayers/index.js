import React, {useState, useEffect} from 'react'

import styles from './DisplayPlayers.module.css';

const DisplayPlayers = (props) => {

  let classes = [styles.DisplayPlayers];
  classes.push(props.className);

  let list = props.players.map( (p,k)=>{

    if( !p.isPlaying ){
      return null;
    }

    let playerClasses = [];

    if( p.id === props.currentPlayer && props.gameIsRunning ){
      playerClasses.push(styles.isCurrent);
    }

    let playerName = <div className={styles.PlayerName}>
      {p.name}
    </div>;

    let pointDisplay = <div className={styles.PlayerTotalPointDisplay}>
      [{p.points}]
    </div>;

    return(
      <li className={playerClasses.join(" ")} key={p.id}>
        {playerName} {pointDisplay}
      </li>
    )
  } );

  return (
    <div className={classes.join(" ")}>
      <ul>
        {list}
      </ul>
    </div>
  )
}

export default DisplayPlayers
