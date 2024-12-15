import React, { useState, useEffect } from "react";

import clsx from "clsx";

import type { Deck as DeckType, CardPosition } from "../../../types";
import Card from "../Card";

import styles from "./Deck.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface DeckProps {
  isCurrent: boolean;
  deck: DeckType;
  drawCard: () => void;
  clickGraveyard: () => void;
  swopHighlight?: CardPosition;
  isClickable: {
    graveyard: boolean;
    deck: boolean;
  };
  spectatorMode: boolean;
}

const Deck = ({
  clickGraveyard,
  deck,
  drawCard,
  isCurrent,
  isClickable,
  swopHighlight,
  spectatorMode,
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
            isClickable={isCurrent && isClickable.graveyard ? true : false}
            indicatorType={swopHighlight === "graveyard" ? "lookAt" : undefined}
            // indicatorType={isClickable.graveyard ? "lookAt" : undefined}
            onClick={handleGraveyardClick}
            isDeck
            deckCardCount={deck.graveyard.length}
          />
        </div>
      )}

      {nextCard && (
        <div className={styles.ClosedDeck}>
          {isDev && <div>{deck.deck.length}/55</div>}

          <Card
            isBack={!showNext}
            card={nextCard}
            isClickable={isCurrent && isClickable.deck}
            // indicatorType={isClickable.deck ? "lookAt" : undefined}
            indicatorType={swopHighlight === "deck" ? "lookAt" : undefined}
            onClick={handleDeckClick}
            isDeck
            deckCardCount={deck.deck.length}
            isSpecator={spectatorMode}
          />
        </div>
      )}
    </div>
  );
};

export default Deck;
