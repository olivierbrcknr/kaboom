import React, {useState, useEffect} from 'react'

import styles from './DisplayPlayers.module.css';

const DisplayPlayers = (props) => {

  let classes = [styles.DisplayPlayers];
  classes.push(props.className);

  let list = props.players.map( (p,k)=>{
    return(
      <div className="" key={p.id}>
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
