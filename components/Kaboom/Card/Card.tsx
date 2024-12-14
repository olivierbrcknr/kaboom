import clsx from "clsx";

import {
  isHandCard,
  type HandCard,
  type Card as CardType,
} from "../../../types";

import styles from "./Card.module.scss";

interface CardProps {
  card: HandCard | CardType;
  isBack?: boolean;
  isHighlight?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  indicatorType?: "lookAt" | "swop" | "drew";
  className?: string;
  isDeck?: boolean;
  deckCardCount?: number;
}

const Card = ({
  card,
  className,
  indicatorType,
  isBack,
  isHighlight,
  isSelected,
  onClick,
  isDeck,
  deckCardCount,
}: CardProps) => {
  let printSymbol: string;
  let color = "black";
  switch (card.color) {
    case 0:
      printSymbol = "♦";
      color = "red";
      break;
    case 1:
      printSymbol = "♥";
      color = "red";
      break;
    case 2:
      printSymbol = "♠";
      break;
    case 3:
      printSymbol = "♣";
      break;
  }

  let cardInner: React.JSX.Element;

  if (isBack) {
    cardInner = <div className={styles.BackArtwork} />;
  } else {
    if (card.value === "X") {
      cardInner = <div className={styles.Joker}>⍟</div>;
    } else {
      return (cardInner = (
        <>
          <div className={styles.Number}>{card.value}</div>
          <div className={styles.Symbol}>{printSymbol}</div>
        </>
      ));
    }
  }

  let style: React.CSSProperties = {};

  if (isHandCard(card)) {
    style = {
      "--card-pos-x": card.slot.x,
      "--card-pos-y": card.slot.y,
    } as React.CSSProperties;
  } else if (isDeck) {
    style = {
      "--card-count": deckCardCount + "px",
    } as React.CSSProperties;
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        styles.Card,
        isBack && styles.isBack,
        isSelected && styles.isSelected,
        isHighlight && styles.isHighlight,
        color === "red" && styles.isRed,
        indicatorType === "drew" && styles.isDrawn,
        indicatorType === "swop" && styles.isSwopped,
        indicatorType === "lookAt" && styles.isLookedAt,
        isDeck && styles.isDeck,
      )}
      style={style}
    >
      {cardInner}
    </div>
  );
};

export default Card;
