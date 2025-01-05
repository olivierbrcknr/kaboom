import clsx from "clsx";

import { calcCardPoints } from "../../../kaboom/kaboomRules";
import type {
  CardEffect,
  CardHighlightType,
  HandCard,
  HighlightCard,
  Player,
  PlayerID,
  RoundStateType,
  TurnStateType,
} from "../../../kaboom/types";
import { useIsDev } from "../../../utils";
import Card from "../Card";

import styles from "./PlayerUI.module.scss";

interface PlayerUIProps {
  cards: HandCard[];
  effect?: CardEffect;
  highlightCards: HighlightCard[];
  isClickable: boolean;
  isCurrent: boolean;
  isEndingPlayer: boolean;
  isHighlightDueToEffect: boolean;
  isSelf: boolean;
  myPlayerID: PlayerID;
  onClick: (card: HandCard, triggeringEffect: boolean) => void;
  player: Player;
  playerNo: number;
  roundState: RoundStateType;
  spectatorMode: boolean;
  startingPos: number;
  turnState: TurnStateType;
}

const PlayerUI = ({
  cards,
  effect,
  highlightCards,
  isClickable,
  isCurrent,
  isEndingPlayer,
  isHighlightDueToEffect,
  isSelf,
  myPlayerID,
  onClick,
  player,
  playerNo,
  roundState,
  spectatorMode,
  startingPos,
  turnState,
}: PlayerUIProps) => {
  let position: "bottom" | "left" | "right" | "top" = "bottom";

  const isDev = useIsDev();

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

            if (
              isHighlightCard &&
              indicatorType === "lookAt" &&
              isHighlightCard.player === myPlayerID
            ) {
              isVisible = true;
            }

            if (roundState.phase === "end") {
              isVisible = true;
            }

            return (
              <Card
                // className={styles.CardGrid_Card.toString()}
                card={c}
                indicatorType={indicatorType}
                isBack={!isVisible}
                isClickable={isClickable}
                isSelected={isSelected}
                isSpecator={spectatorMode}
                key={"myCard-" + k}
                onClick={handleClickCard}
              />
            );
          })}
      </div>

      <div className={styles.Name}>
        {player.name}{" "}
        {(isDev || spectatorMode) && (
          <div className={styles.Score}>({calcCardPoints(cards)})</div>
        )}
      </div>
    </div>
  );
};

export default PlayerUI;
