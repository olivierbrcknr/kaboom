import React, {useState, useEffect} from 'react'

import styles from './PlayerSelection.module.css';

const PlayerSelection = (props) => {

  let classes = [styles.PlayerSelection];
  classes.push(props.className);

  let list = props.players.map( (p,k)=>{

    let playerClasses = [];

    let playerName = <div className={styles.PlayerName}>
                       {p.name}
                     </div>;

    if( p.id === props.isID ){
      playerClasses.push(styles.isSelf);

      playerName = <input
        type="text"
        onChange={ (v) => props.onNameChange(v.target.value) }
        className={styles.PlayerName}
        placeholder={'You'}
        value={p.name} />
    }

    let toggleClasses = [styles.Toggle];

    if( p.isPlaying){
      toggleClasses.push(styles.ToggleOn)
    }

    let isPlayingToggle = <div
      onClick={ () => props.onPlayerToggle( p.id ) }
      className={toggleClasses.join(" ")}>
      <div className={styles.ToggleKnob}></div>
    </div>;

    return(
      <li className={playerClasses.join(" ")} key={p.id}>
        {playerName}
        {isPlayingToggle}
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

export default PlayerSelection
