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


  let countInDeck = 0;
  let countInGraveyard = 0;

  if( props.deck ){
    // currentCard = props.deck[0];
    props.deck.map( (c,k) => {
      switch( c.position ){
        case 'deck':
          countInDeck++;
          break;
        case 'graveyard':
          if( countInGraveyard === 0 ){
            currentCard = c;
          }
          countInGraveyard++;
          break;
      }
    });
  }

  let closedDeckStyle = {
    borderBottomWidth: 2 + countInDeck/3 + 'px',
    height: 'calc( var(--card-height) + '+countInDeck/3+'px )'
  }

  let openDeckStyle = {
    borderBottomWidth: 2 + countInGraveyard/3 + 'px',
    height: 'calc( var(--card-height) + '+countInGraveyard/3+'px )'
  }

  let openDeck = null;

  if( countInGraveyard > 0 ){
    openDeck = <Card symbol={currentCard.color}
      style={openDeckStyle}
      number={currentCard.value}
      className={styles.OpenDeck.toString()}  />
  }

  return (
    <div className={classes.join(" ")}>

      {openDeck}

      <Card isBack
        style={closedDeckStyle}
        className={styles.ClosedDeck.toString()}
        onClick={ () => { console.log('Draw Card') } } />

    </div>
  )
}

export default Deck
