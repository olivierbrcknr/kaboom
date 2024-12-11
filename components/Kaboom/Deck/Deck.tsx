import React, { useState, useEffect } from "react";

import Card from "../Card";

import styles from "./Deck.module.scss";

const Deck = (props) => {
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    setShowNext(false);
  }, [props.isCurrent]);

  const classes = [styles.Deck];
  classes.push(props.className);

  let currentCard,
    nextCard = {
      color: null,
      value: null,
    };

  const countInDeck = props.deck.deck ? props.deck.deck.length : 0;
  const countInGraveyard = props.deck.graveyard
    ? props.deck.graveyard.length
    : 0;

  const closedDeckStyle = {
    borderBottomWidth: 2 + countInDeck / 3 + "px",
    height: "calc( var(--card-height) + " + countInDeck / 3 + "px )",
  };

  const openDeckStyle = {
    borderBottomWidth: 2 + countInGraveyard / 3 + "px",
    height: "calc( var(--card-height) + " + countInGraveyard / 3 + "px )",
  };

  const deckClickFn = () => {
    if (props.isCurrent) {
      setShowNext(true);
      props.drawCard();
    }
  };

  const graveyardClickFn = () => {
    setShowNext(false);
    props.clickGraveyard();
  };

  let openDeck: React.JSX.Element | null = null;

  if (countInGraveyard > 0) {
    currentCard = props.deck.graveyard[countInGraveyard - 1];

    openDeck = (
      <Card
        symbol={currentCard.color}
        style={openDeckStyle}
        number={currentCard.value}
        isHighlight={
          props.isCurrent && props.isHighlight.graveyard ? true : false
        }
        indicatorType={props.swopHighlight === "graveyard" ? "lookAt" : null}
        className={styles.OpenDeck.toString()}
        onClick={() => {
          graveyardClickFn();
        }}
      />
    );
  }

  if (countInDeck > 0) {
    nextCard = props.deck.deck[0];
  }

  return (
    <div className={classes.join(" ")}>
      {openDeck}

      <Card
        isBack={!showNext}
        number={nextCard.value}
        symbol={nextCard.color}
        style={closedDeckStyle}
        isHighlight={props.isCurrent && props.isHighlight.deck ? true : false}
        indicatorType={props.swopHighlight === "deck" ? "lookAt" : null}
        className={styles.ClosedDeck.toString()}
        onClick={() => {
          deckClickFn();
        }}
      />
    </div>
  );
};

export default Deck;
