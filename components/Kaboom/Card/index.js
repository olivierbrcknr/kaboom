import React, {useState, useEffect} from 'react'

import styles from './Card.module.css';

const Card = (props) => {

  let classes = [styles.Card];
  classes.push(props.className);


  let symbol = null;
  let color = 'black';
  switch( props.symbol ){
    case 0:
      symbol = "♦";
      color = 'red';
      break;
    case 1:
      symbol = "♥";
      color = 'red';
      break;
    case 2:
      symbol = "♠";
      break;
    case 3:
      symbol = "♣";
      break;
  }

  if( color === 'red' ){
    classes.push( styles.isRed );
  }

  if( props.isBack ){
    classes.push(styles.isBack);

    return (
      <div className={classes.join(" ")}>

        <div className={styles.BackArtwork}>
        </div>

      </div>
    )

  }else{

    return (
      <div className={classes.join(" ")}>

        <div className={styles.Number}>
          {props.number}
        </div>

        <div className={styles.Symbol}>
          {symbol}
        </div>

      </div>
    )
  }
}

export default Card
