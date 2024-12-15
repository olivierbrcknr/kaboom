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
  isClickable: boolean;
  isSelected?: boolean;
  onClick: () => void;
  indicatorType?: "lookAt" | "swop" | "drew";
  isDeck?: boolean;
  deckCardCount?: number;
  isSpecator?: boolean;
}

const Card = ({
  card,
  indicatorType,
  isBack,
  isClickable,
  isSelected,
  onClick,
  isDeck,
  deckCardCount,
  isSpecator,
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
    case null:
      printSymbol = "⍟";
      break;
  }

  let cardInner: React.JSX.Element;

  //      if (isBack && !isSpecator) {
  //   cardInner = <div className={styles.BackArtwork} />;
  // } else {
  //   if (card.value === "X") {
  //     cardInner = <div className={styles.Joker}>⍟</div>;
  //   } else {
  //     cardInner = (
  //       <>
  //         <div className={styles.Number}>{card.value}</div>
  //         <div className={styles.Symbol}>{printSymbol}</div>
  //       </>
  //     );
  //   }
  // }

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
    <button
      onClick={onClick}
      className={clsx(
        styles.Card,
        isBack && styles.isBack,
        isSelected && styles.isSelected,
        isClickable && styles.isClickable,
        isSpecator && styles.isSpecator,
        color === "red" ? styles.isRed : styles.isBlack,
        indicatorType === "drew" && styles.isDrawn,
        indicatorType === "swop" && styles.isSwopped,
        indicatorType === "lookAt" && styles.isLookedAt,
        isDeck && styles.isDeck,
        isHandCard(card) && styles.isHandCard,
      )}
      style={style}
    >
      {isBack && <div className={styles.BackArtwork} />}

      {(!isBack || isSpecator) && (
        <div className={styles.Inner}>
          {card.value !== "X" && (
            <div className={styles.Number}>{card.value}</div>
          )}
          <div className={styles.Symbol}>{printSymbol}</div>
        </div>
      )}
    </button>
  );
};

export default Card;
