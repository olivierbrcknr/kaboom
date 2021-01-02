import React, {useState, useEffect} from 'react'

import Card from '../Card'


import styles from './Deck.module.css';

const Deck = (props) => {

  const [showNext,setShowNext] = useState(false);

  let classes = [styles.Deck];
  classes.push(props.className);

  let currentCard, nextCard = {
    color : null,
    value : null,
  };

  let countInDeck = props.deck.deck ? props.deck.deck.length : 0;
  let countInGraveyard = props.deck.graveyard ? props.deck.graveyard.length : 0;

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

    currentCard = props.deck.graveyard[ countInGraveyard-1 ];

    openDeck = <Card
      symbol={currentCard.color}
      style={openDeckStyle}
      number={currentCard.value}
      isHighlight={ props.isHighlight.graveyard }
      className={styles.OpenDeck.toString()}
      onClick={ () => { props.clickGraveyard() } }  />
  }

  if( countInDeck > 0 ){
    nextCard = props.deck.deck[ 0 ];
  }


  let deckClickFn = () => {

    if( props.isCurrent ){
      setShowNext( true )
      props.drawCard();
    }
  }


  return (
    <div className={classes.join(" ")}>

      {openDeck}

      <Card
        isBack={!showNext}
        number={nextCard.value}
        symbol={nextCard.color}
        style={closedDeckStyle}
        isHighlight={ props.isHighlight.deck }
        className={styles.ClosedDeck.toString()}
        onClick={ () => { deckClickFn() } } />

    </div>
  )
}

export default Deck
