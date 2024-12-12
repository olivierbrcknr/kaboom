import clsx from "clsx";

import type { Player, Card as CardType } from "../../../types";
import Card from "../Card";

import styles from "./PlayerUI.module.scss";

interface PlayerUIProps {
  effects: {};
  swopHighlight: { cards: CardType[] };
  startingPos: number;
  playerNo: number;
  player: Player;
  isMainPlayer: boolean;
  isEndingPlayer: boolean;
  isCurrent: boolean;
  cards: CardType[];
  spectatorMode: boolean;
  onClick: (card: CardType, effect: boolean) => void;
  isHighlight: boolean;
  isHighlightDueToEffect: boolean;
}

const PlayerUI = ({
  cards,
  effects,
  isCurrent,
  isEndingPlayer,
  isHighlight,
  isHighlightDueToEffect,
  isMainPlayer,
  onClick,
  player,
  playerNo,
  spectatorMode,
  startingPos,
  swopHighlight,
}: PlayerUIProps) => {
  // map
  let cards = null;

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

  if (props.cards && props.cards.length > 0) {
    cards = props.cards.map((c, k) => {
      let isVisible = false;
      let isSelected = false;
      // const isSwopped = false;

      let indicatorType = undefined;

      // see effects
      if (props.effects.effect && props.effects.effect !== "") {
        // initial effect
        if (
          props.effects.effect === "initialBottomRow" &&
          c.slot.y === 1 &&
          props.isMainPlayer
        ) {
          isVisible = true;
        }

        // regular effect
        for (let i = 0; i < props.effects.cards.length; i++) {
          if (c.id === props.effects.cards[i].id) {
            switch (props.effects.effect) {
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
        if (props.effects.effect === "endRound") {
          isVisible = true;
        }
      }

      // see swop
      if (props.swopHighlight.cards.length > 0) {
        for (let i = 0; i < props.swopHighlight.cards.length; i++) {
          if (c.id === props.swopHighlight.cards[i].id) {
            indicatorType = props.swopHighlight.type;
          }
        }
      }

      const cardStyle: React.CSSProperties = {
        left:
          "calc( var(--card-margin) + ( var(--card-width) + var(--card-margin) ) * " +
          c.slot.x +
          " )",
        top:
          "calc( var(--card-margin) + ( var(--card-height) + var(--card-margin) ) * " +
          c.slot.y +
          " )",
      };

      if (spectatorMode) {
        isVisible = true;
      }

      const handleClickCard = () => {
        if (isEndingPlayer) {
          console.log("sorry, this player is ending");
        } else {
          const isEffect = isHighlightDueToEffect && isHighlight ? true : false;
          onClick(c, isEffect);
        }
      };

      return (
        <Card
          className={styles.CardGrid_Card.toString()}
          style={cardStyle}
          card={c}
          key={"myCard-" + k}
          indicatorType={indicatorType}
          isHighlight={isHighlight}
          isSelected={isSelected}
          onClick={handleClickCard}
          isBack={!isVisible}
        />
      );
    });
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
      <div className={styles.CardGrid}>{cards}</div>

      <div className={styles.Name}>{player.name}</div>
    </div>
  );
};

export default PlayerUI;
