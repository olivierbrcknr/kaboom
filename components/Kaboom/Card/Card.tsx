import clsx from "clsx";

import {
  type CardHighlightType,
  type Card as CardType,
  type HandCard,
  isHandCard,
} from "../../../kaboom/types";
import { useIsDev } from "../../../utils";

import styles from "./Card.module.scss";

interface CardProps {
  card: CardType | HandCard;
  deckCardCount?: number;
  indicatorType?: CardHighlightType;
  isBack?: boolean;
  isClickable: boolean;
  isDeck?: boolean;
  isSelected?: boolean;
  isSpecator?: boolean;
  onClick: () => void;
}

const Card = ({
  card,
  deckCardCount,
  indicatorType,
  isBack,
  isClickable,
  isDeck,
  isSelected,
  isSpecator,
  onClick,
}: CardProps) => {
  const isDev = useIsDev();

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
      className={clsx(
        styles.Card,
        isBack && styles.isBack,
        isSelected && styles.isSelected,
        isClickable && styles.isClickable,
        isSpecator && styles.isSpecator,
        color === "red" ? styles.isRed : styles.isBlack,
        (indicatorType === "drew_deck" || indicatorType === "drew_graveyard") &&
          styles.isDrawn,
        indicatorType === "swap" && styles.isSwapped,
        indicatorType === "lookAt" && styles.isLookedAt,
        indicatorType === "selected" && styles.isSelected,
        isDeck && styles.isDeck,
        isHandCard(card) && styles.isHandCard,
      )}
      onClick={onClick}
      style={style}
    >
      {isDev && <div className={styles.ID}>{card.id}</div>}

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
