import React, { useState, useEffect } from "react";

import type { Deck as DeckType, Card as CardType } from "../../../types";
import Card from "../Card";

import styles from "./Deck.module.scss";

interface DeckProps {
  isCurrent: boolean;
  deck: DeckType;
  className?: string;
  drawCard: () => void;
  clickGraveyard: () => void;
  swopHighlight: "graveyard" | "lookAt" | "deck";
  isHighlight: {
    graveyard: boolean;
    deck: boolean;
  };
}

const Deck = ({
  className,
  clickGraveyard,
  deck,
  drawCard,
  isCurrent,
  isHighlight,
  swopHighlight,
}: DeckProps) => {
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    setShowNext(false);
  }, [isCurrent]);

  const classes = [styles.Deck];
  className && classes.push(className);

  let currentCard: CardType | null;
  let nextCard: CardType | null = null;

  const countInDeck = deck.deck ? deck.deck.length : 0;
  const countInGraveyard = deck.graveyard ? deck.graveyard.length : 0;

  const closedDeckStyle: React.CSSProperties = {
    borderBottomWidth: 2 + countInDeck / 3 + "px",
    height: "calc( var(--card-height) + " + countInDeck / 3 + "px )",
  };

  const openDeckStyle: React.CSSProperties = {
    borderBottomWidth: 2 + countInGraveyard / 3 + "px",
    height: "calc( var(--card-height) + " + countInGraveyard / 3 + "px )",
  };

  const deckClickFn = () => {
    if (isCurrent) {
      setShowNext(true);
      drawCard();
    }
  };

  const graveyardClickFn = () => {
    setShowNext(false);
    clickGraveyard();
  };

  let openDeck: React.JSX.Element | null = null;

  if (countInGraveyard > 0) {
    currentCard = deck.graveyard[countInGraveyard - 1];

    openDeck = (
      <Card
        card={currentCard}
        style={openDeckStyle}
        isHighlight={isCurrent && isHighlight.graveyard ? true : false}
        indicatorType={swopHighlight === "graveyard" ? "lookAt" : undefined}
        className={styles.OpenDeck.toString()}
        onClick={graveyardClickFn}
      />
    );
  }

  if (countInDeck > 0) {
    nextCard = deck.deck[0];
  }

  return (
    <div className={classes.join(" ")}>
      {openDeck}

      {nextCard && (
        <Card
          isBack={!showNext}
          card={nextCard}
          style={closedDeckStyle}
          isHighlight={isCurrent && isHighlight.deck}
          indicatorType={swopHighlight === "deck" ? "lookAt" : undefined}
          className={styles.ClosedDeck.toString()}
          onClick={deckClickFn}
        />
      )}
    </div>
  );
};

export default Deck;
