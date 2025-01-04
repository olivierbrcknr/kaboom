import clsx from "clsx";

import type {
  Player,
  Card as CardType,
  HandCard,
  CardHighlightType,
  CardEffect,
  HighlightCard,
  TurnStateType,
} from "../../../kaboom/types";
import Card from "../Card";

import { calcCardPoints } from "../../../kaboom/kaboomRules";

import { isDev } from "../../../utils";

import styles from "./PlayerUI.module.scss";

interface PlayerUIProps {
  effect?: CardEffect;
  highlightCards: HighlightCard[];
  startingPos: number;
  playerNo: number;
  player: Player;
  isSelf: boolean;
  isEndingPlayer: boolean;
  isCurrent: boolean;
  cards: HandCard[];
  spectatorMode: boolean;
  onClick: (card: HandCard, triggeringEffect: boolean) => void;
  isClickable: boolean;
  isHighlightDueToEffect: boolean;
  turnState: TurnStateType;
}

const PlayerUI = ({
  cards,
  effect,
  isCurrent,
  isEndingPlayer,
  isClickable,
  isHighlightDueToEffect,
  isSelf,
  onClick,
  player,
  playerNo,
  spectatorMode,
  startingPos,
  highlightCards,
  turnState,
}: PlayerUIProps) => {
  let position: "top" | "right" | "bottom" | "left" = "bottom";

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
    // aka yourself
    default:
      position = "bottom";
      break;
  }

  return (
    <div
      className={clsx(
        styles.PlayerUI,
        isCurrent && styles.isCurrent,
        isEndingPlayer && styles.isEndingPlayer,
        isSelf && styles.isSelf,
        position === "top" && styles.posTop,
        position === "right" && styles.posRight,
        position === "bottom" && styles.posBottom,
        position === "left" && styles.posLeft,
      )}
    >
      {(isDev() || spectatorMode) && (
        <div className={styles.Score}>{calcCardPoints(cards)}</div>
      )}

      <div className={styles.CardGrid}>
        {cards &&
          cards.length > 0 &&
          cards.map((c, k) => {
            let isVisible = false;
            let isSelected = false;
            // const isSwopped = false;

            let indicatorType: CardHighlightType | undefined = undefined;

            if (turnState.phase === "pre round" && c.slot.y === 1 && isSelf) {
              isVisible = true;
            }

            // see effect
            if (effect?.action) {
              // regular effect
              for (let i = 0; i < effect.cards.length; i++) {
                if (c.id === effect.cards[i].id) {
                  switch (effect.action) {
                    case "lookAt":
                      // case "lookAtKing":
                      isVisible = true;
                      break;

                    case "swap":
                      isSelected = true;
                      break;

                    default:
                      // do nothing
                      break;
                  }
                }
              }

              // endround effect
              // if (effect.action === "endRound") {
              //   isVisible = true;
              // }
            }

            // see highlight
            const isHighlightCard = highlightCards.find((hc) => hc.id === c.id);
            if (isHighlightCard) {
              indicatorType = isHighlightCard.type;
            }

            const handleClickCard = () => {
              if (isEndingPlayer) {
                console.log("sorry, this player is ending");
              } else {
                const isEffect = isHighlightDueToEffect && isClickable;
                onClick(c, isEffect);
              }
            };

            // TODO: right thinkign, wrong execution
            if (isHighlightCard && indicatorType === "lookAt" && isCurrent) {
              isVisible = true;
            }

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
