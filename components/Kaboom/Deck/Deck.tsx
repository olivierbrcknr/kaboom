import clsx from "clsx";
import React, { useEffect, useState } from "react";

import type { Deck as DeckType, HighlightCard } from "../../../kaboom/types";

import Card from "../Card";
import styles from "./Deck.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface DeckProps {
  clickGraveyard: () => void;
  deck: DeckType;
  drawCard: () => void;
  highlightCards: HighlightCard[];
  isClickable: {
    deck: boolean;
    graveyard: boolean;
  };
  isCurrent: boolean;
  spectatorMode: boolean;
}

const Deck = ({
  clickGraveyard,
  deck,
  drawCard,
  highlightCards,
  isClickable,
  isCurrent,
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

  const highlightDeck = highlightCards.some((hc) => hc.type === "drew_deck");
  const highlightGraveyard = highlightCards.some(
    (hc) => hc.type === "drew_graveyard",
  );

  return (
    <div className={clsx(styles.Deck)}>
      {deck.graveyard.length > 0 && (
        <div className={styles.OpenDeck}>
          <Card
            card={deck.graveyard[deck.graveyard.length - 1]}
            deckCardCount={deck.graveyard.length}
            indicatorType={highlightGraveyard ? "drew_graveyard" : undefined}
            isClickable={isCurrent && isClickable.graveyard ? true : false}
            isDeck
            onClick={handleGraveyardClick}
          />
        </div>
      )}

      {nextCard && (
        <div className={styles.ClosedDeck}>
          {isDev && <div>{deck.deck.length}/55</div>}

          <Card
            card={nextCard}
            deckCardCount={deck.deck.length}
            indicatorType={highlightDeck ? "drew_deck" : undefined}
            isBack={!showNext}
            isClickable={isCurrent && isClickable.deck}
            isDeck
            isSpecator={spectatorMode}
            onClick={handleDeckClick}
          />
        </div>
      )}
    </div>
  );
};

export default Deck;
