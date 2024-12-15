import clsx from "clsx";

import type {
  Player,
  Card as CardType,
  HandCard,
  CardHighlightType,
  CardEffect,
} from "../../../types";
import Card from "../Card";

import styles from "./PlayerUI.module.scss";

interface PlayerUIProps {
  effect: CardEffect;
  highlightCards: { cards: HandCard[]; type?: CardHighlightType };
  startingPos: number;
  playerNo: number;
  player: Player;
  isMainPlayer: boolean;
  isEndingPlayer: boolean;
  isCurrent: boolean;
  cards: HandCard[];
  spectatorMode: boolean;
  onClick: (card: HandCard, triggeringEffect: boolean) => void;
  isClickable: boolean;
  isHighlightDueToEffect: boolean;
}

const PlayerUI = ({
  cards,
  effect,
  isCurrent,
  isEndingPlayer,
  isClickable,
  isHighlightDueToEffect,
  isMainPlayer,
  onClick,
  player,
  playerNo,
  spectatorMode,
  startingPos,
  highlightCards,
}: PlayerUIProps) => {
  let position: "top" | "right" | "bottom" | "left" = "bottom";

  if (!isMainPlayer) {
    switch (playerNo - startingPos) {
      case -3:
      case 1:
        position = "left";
        break;
      case -2:
      case 2:
        position = "top";
        break;
      case -1:
      case 3:
        position = "right";
        break;
      // aka you are not playing
      default:
        position = "bottom";
        break;
    }
  }

  return (
    <div
      className={clsx(
        styles.PlayerUI,
        isCurrent && styles.isCurrent,
        isEndingPlayer && styles.isEndingPlayer,
        isMainPlayer && styles.isMainPlayer,
        position === "top" && styles.posTop,
        position === "right" && styles.posRight,
        position === "bottom" && styles.posBottom,
        position === "left" && styles.posLeft,
      )}
    >
      <div className={styles.CardGrid}>
        {cards &&
          cards.length > 0 &&
          cards.map((c, k) => {
            let isVisible = false;
            let isSelected = false;
            // const isSwopped = false;

            let indicatorType: CardHighlightType | undefined = undefined;

            // see effect
            if (effect.action) {
              // initial effect
              if (
                effect.action === "initialBottomRow" &&
                c.slot.y === 1 &&
                isMainPlayer
              ) {
                isVisible = true;
              }

              // regular effect
              for (let i = 0; i < effect.cards.length; i++) {
                if (c.id === effect.cards[i].id) {
                  switch (effect.action) {
                    case "lookAt":
                    case "lookAtKing":
                      isVisible = true;
                      break;

                    case "swop":
                      isSelected = true;
                      break;

                    default:
                      // do nothing
                      break;
                  }
                }
              }

              // endround effect
              if (effect.action === "endRound") {
                isVisible = true;
              }
            }

            // see swop
            if (highlightCards.cards.length > 0) {
              for (let i = 0; i < highlightCards.cards.length; i++) {
                if (c.id === highlightCards.cards[i].id) {
                  indicatorType = highlightCards.type;
                }
              }
            }

            const handleClickCard = () => {
              if (isEndingPlayer) {
                console.log("sorry, this player is ending");
              } else {
                const isEffect = isHighlightDueToEffect && isClickable;
                onClick(c, isEffect);
              }
            };

            return (
              <Card
                // className={styles.CardGrid_Card.toString()}
                card={c}
                key={"myCard-" + k}
                indicatorType={indicatorType}
                isClickable={isClickable}
                isSelected={isSelected}
                onClick={handleClickCard}
                isBack={!isVisible}
                isSpecator={spectatorMode}
              />
            );
          })}
      </div>

      <div className={styles.Name}>{player.name}</div>
    </div>
  );
};

export default PlayerUI;
