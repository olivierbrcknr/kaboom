import React, {useState, useEffect} from 'react'

import Card from '../Card'


import styles from './Deck.module.css';

const Deck = (props) => {

  let classes = [styles.Deck];
  classes.push(props.className);

  let currentCard = {
    color : null,
    value : null,
  };

  if( props.deck ){
    currentCard = props.deck[0];
  }

  return (
    <div className={classes.join(" ")}>

      <Card symbol={currentCard.color} number={currentCard.value}  />
      <Card isBack />

    </div>
  )
}

export default Deck
