import React from "react";

import clsx from "clsx";

import {
  type CardRule,
  emptyHighlight,
  getCardRule,
  type HighlightObject,
} from "../../../kaboom/ruleHelpers";
import type {
  Card as CardType,
  Deck,
  DeckType,
  GameStateType,
  HandCard,
  HighlightCard,
  Player,
  PlayerID,
  RoundStateType,
  TurnStateType,
} from "../../../kaboom/types";
import { useIsDev } from "../../../utils";
import Button from "../../Button";
import DeckUI from "../Deck";
import PlayerUI from "../PlayerUI";
import ScoreDisplay from "../ScoreDisplay";

import styles from "./Game.module.scss";

interface GameUIProps {
  canMoveCard: boolean;
  deck: Deck;
  gameState: GameStateType;
  handleDeckClick: (type: DeckType) => void;
  handlePlayerCardClick: (card: CardType) => void;
  highlightCards: HighlightCard[];
  myPlayerID: PlayerID;
  onEndGame: () => void;
  onNextTurn: () => void;
  onPlayerIsEndingRound: () => void;
  onStartRound: () => void;
  players: Player[];
  roundState: RoundStateType;
  selectedCard?: CardType;
  turnState: TurnStateType;
}

const emptyClickableAreas: HighlightObject = { ...emptyHighlight };

const GameUI = ({
  canMoveCard,
  deck,
  gameState,
  handleDeckClick,
  handlePlayerCardClick,
  highlightCards,
  myPlayerID,
  onEndGame,
  onPlayerIsEndingRound,
  onStartRound,
  players,
  roundState,
  selectedCard,
  turnState,
}: GameUIProps) => {
  let clickableAreas = { ...emptyClickableAreas };

  const isDev = useIsDev();

  const isCurrentPlayer = turnState.currentPlayer === myPlayerID;

  const roundIsRunning =
    roundState.phase === "running" || roundState.phase === "last round";
  const isLastRound = roundState.phase === "last round";

  console.log(highlightCards);

  const myPos = players
    .filter((p) => p.isPlaying)
    .findIndex((p) => p.id === myPlayerID);
  let effectDisplayText = "";
  let currentRule: CardRule | false | undefined = undefined;

  if (turnState.phase === "pre round") {
    effectDisplayText = "Look at your own cards before the round begins";
  }

  if (canMoveCard) {
    clickableAreas.ownCards = true;
    effectDisplayText = "Move one of your card to the fired card's player";
  } else {
    if (turnState.phase === "effect") {
      currentRule = turnState.playedCard && getCardRule(turnState.playedCard);

      // effect display should be displayed for everyone
      if (currentRule) {
        effectDisplayText = currentRule.actions[0].label;
      }
    }

    // get clickable states if is current player
    if (isCurrentPlayer) {
      switch (turnState.phase) {
        case "card in hand":
          clickableAreas.ownCards = true;
          // check if hand card is from deck or graveyard
          if (deck.deck.find((dc) => dc.id === selectedCard?.id)) {
            clickableAreas.graveyard = true;
          }
          break;
        case "draw":
          clickableAreas.deck = true;
          clickableAreas.graveyard = true;

          break;
        case "effect":
          // if is "effect" phase and is current player
          // --> cards accordingly (own and/or others)
          if (currentRule) {
            clickableAreas = { ...currentRule.actions[0].clickableAreas };
          }
          break;
      }
    }
  }

  const spectatorMode = isDev;

  return (
    <div className={clsx(styles.Game)}>
      <div className={styles.PlayerUIsContainer}>
        {players
          .filter((p) => p.isPlaying)
          .map((p, k) => {
            if (!deck) {
              console.log("Deck is not defined");
              return null;
            }

            let isClickable = clickableAreas.otherCards;
            let cards: HandCard[] = [];
            let isSelf = false;

            cards = deck.hand.filter((c) => c.player === p.id);

            if (p.id == myPlayerID) {
              isClickable = clickableAreas.ownCards;
              isSelf = true;
            }

            return (
              <PlayerUI
                cards={cards}
                highlightCards={highlightCards}
                isClickable={isClickable}
                isCurrent={p.id === turnState.currentPlayer && roundIsRunning}
                isEndingPlayer={roundState.lastRoundStartedByPlayer === p.id}
                isHighlightDueToEffect={clickableAreas.dueToEffect}
                isSelf={isSelf}
                key={"player-no_" + k}
                myPlayerID={myPlayerID}
                onClick={handlePlayerCardClick}
                player={p}
                playerNo={k}
                roundState={roundState}
                spectatorMode={spectatorMode}
                startingPos={myPos}
                turnState={turnState}
              />
            );
          })}
      </div>

      <DeckUI
        clickGraveyard={() => handleDeckClick("graveyard")}
        deck={deck}
        drawCard={() => handleDeckClick("deck")}
        highlightCards={highlightCards}
        isClickable={clickableAreas}
        isCurrent={isCurrentPlayer && roundIsRunning}
        spectatorMode={spectatorMode}
      />

      {roundIsRunning && effectDisplayText && (
        <div className={styles.EffectDisplay}>{effectDisplayText}</div>
      )}

      {isLastRound ? (
        <div className={styles.LastRoundIndicator}>Last Round</div>
      ) : null}

      <ScoreDisplay
        currentPlayerId={turnState.currentPlayer}
        gameIsRunning={roundIsRunning}
        id={myPlayerID}
        players={players}
      />

      {isCurrentPlayer &&
        roundIsRunning &&
        !isLastRound &&
        clickableAreas.deck && (
          <div className={styles.IWantToEndButton}>
            <Button onClick={onPlayerIsEndingRound}>I want to end</Button>
          </div>
        )}

      {roundState.phase === "setup" && (
        <div className={styles.StartRoundContainer}>
          <Button onClick={onStartRound} theme="primary">
            Start {gameState.roundCount > 0 ? "Next" : ""} Round
          </Button>
        </div>
      )}

      <div className={styles.ForceEndBtn} style={{ zIndex: 10 }}>
        <Button onClick={onEndGame} theme="red">
          Force End Game
        </Button>
      </div>
    </div>
  );
};

export default GameUI;
