import React, {useState, useEffect} from 'react'

import Card from '../Card'


import styles from './Deck.module.css';

const Deck = (props) => {

  const [showNext,setShowNext] = useState(false);

  useEffect( ()=>{
    setShowNext(false);
  }, [props.isCurrent]);

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

  let deckClickFn = () => {

    if( props.isCurrent ){
      setShowNext( true )
      props.drawCard();
    }
  }

  let graveyardClickFn = () => {
    setShowNext( false );
    props.clickGraveyard();
  }

  let openDeck = null;

  if( countInGraveyard > 0 ){

    currentCard = props.deck.graveyard[ countInGraveyard-1 ];

    openDeck = <Card
      symbol={currentCard.color}
      style={openDeckStyle}
      number={currentCard.value}
      isHighlight={ props.isCurrent && props.isHighlight.graveyard ? true : false }
      indicatorType={ props.swopHighlight === 'graveyard' ? 'lookAt' : null }
      className={styles.OpenDeck.toString()}
      onClick={ () => { graveyardClickFn() } }  />
  }

  if( countInDeck > 0 ){
    nextCard = props.deck.deck[ 0 ];
  }


  return (
    <div className={classes.join(" ")}>

      {openDeck}

      <Card
        isBack={!showNext}
        number={nextCard.value}
        symbol={nextCard.color}
        style={closedDeckStyle}
        isHighlight={ props.isCurrent && props.isHighlight.deck ? true : false }
        indicatorType={ props.swopHighlight === 'deck' ? 'lookAt' : null }
        className={styles.ClosedDeck.toString()}
        onClick={ () => { deckClickFn() } } />

    </div>
  )
}

export default Deck
