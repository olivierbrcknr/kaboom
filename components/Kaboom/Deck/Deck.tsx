import React, { useState, useEffect } from "react";

import clsx from "clsx";

import type { Deck as DeckType } from "../../../types";
import Card from "../Card";

import styles from "./Deck.module.scss";

interface DeckProps {
  isCurrent: boolean;
  deck: DeckType;
  drawCard: () => void;
  clickGraveyard: () => void;
  // swopHighlight: "graveyard" | "lookAt" | "deck";
  isHighlight: {
    graveyard: boolean;
    deck: boolean;
  };
}

const Deck = ({
  clickGraveyard,
  deck,
  drawCard,
  isCurrent,
  isHighlight,
  // swopHighlight,
}: DeckProps) => {
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    setShowNext(false);
  }, [isCurrent]);

  const handleDeckClick = () => {
    if (isCurrent) {
      setShowNext(true);
      drawCard();
    }
  };

  const handleGraveyardClick = () => {
    setShowNext(false);
    clickGraveyard();
  };

  const nextCard = deck.deck.length > 0 ? deck.deck[0] : undefined;

  return (
    <div className={clsx(styles.Deck)}>
      {deck.graveyard.length > 0 && (
        <div className={styles.OpenDeck}>
          <Card
            card={deck.graveyard[deck.graveyard.length - 1]}
            isHighlight={isCurrent && isHighlight.graveyard ? true : false}
            // indicatorType={swopHighlight === "graveyard" ? "lookAt" : undefined}
            // indicatorType={isHighlight.graveyard ? "lookAt" : undefined}
            onClick={handleGraveyardClick}
            isDeck
            deckCardCount={deck.graveyard.length}
          />
        </div>
      )}

      {nextCard && (
        <div className={styles.ClosedDeck}>
          <Card
            isBack={!showNext}
            card={nextCard}
            isHighlight={isCurrent && isHighlight.deck}
            // indicatorType={isHighlight.deck ? "lookAt" : undefined}
            // indicatorType={swopHighlight === "deck" ? "lookAt" : undefined}
            onClick={handleDeckClick}
            isDeck
            deckCardCount={deck.deck.length}
          />
        </div>
      )}
    </div>
  );
};

export default Deck;
