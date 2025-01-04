import React from "react";

import clsx from "clsx";

import {
  type HighlightObject,
  emptyHighlight,
  getCardRule,
  type CardRule,
} from "../../../kaboom/ruleHelpers";
import type {
  Player,
  Deck,
  DeckType,
  Card as CardType,
  HandCard,
  PlayerID,
  GameStateType,
  RoundStateType,
  TurnStateType,
  HighlightCard,
} from "../../../kaboom/types";
import Button from "../../Button";
import DeckUI from "../Deck";
import PlayerUI from "../PlayerUI";
import ScoreDisplay from "../ScoreDisplay";

import styles from "./Game.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface GameUIProps {
  gameState: GameStateType;
  roundState: RoundStateType;
  deck: Deck;
  myPlayerID: PlayerID;
  onPlayerIsEndingRound: () => void;
  onStartRound: () => void;
  onEndGame: () => void;
  onNextTurn: () => void;
  highlightCards: HighlightCard[];
  selectedCard?: CardType;
  players: Player[];
  turnState: TurnStateType;
  handleDeckClick: (type: DeckType) => void;
  handlePlayerCardClick: (card: CardType) => void;
  canMoveCard: boolean;
}

const emptyClickableAreas: HighlightObject = { ...emptyHighlight };

const GameUI = ({
  gameState,
  roundState,
  deck,
  myPlayerID,
  onPlayerIsEndingRound,
  onStartRound,
  onEndGame,
  highlightCards,
  selectedCard,
  players,
  turnState,
  handleDeckClick,
  handlePlayerCardClick,
  canMoveCard,
}: GameUIProps) => {
  let clickableAreas = { ...emptyClickableAreas };

  const isCurrentPlayer = turnState.currentPlayer === myPlayerID;

  const roundIsRunning =
    roundState.phase === "running" || roundState.phase === "last round";
  const isLastRound = roundState.phase === "last round";

  const myPos = players
    .filter((p) => p.isPlaying)
    .findIndex((p) => p.id === myPlayerID);
  let effectDisplayText = "";
  let currentRule: CardRule | undefined | false = undefined;

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
        case "draw":
          clickableAreas.deck = true;
          clickableAreas.graveyard = true;

          break;
        case "card in hand":
          clickableAreas.ownCards = true;
          // check if hand card is from deck or graveyard
          if (deck.deck.find((dc) => dc.id === selectedCard?.id)) {
            clickableAreas.graveyard = true;
          }
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
                key={"player-no_" + k}
                startingPos={myPos}
                highlightCards={highlightCards}
                playerNo={k}
                player={p}
                isSelf={isSelf}
                myPlayerID={myPlayerID}
                isEndingPlayer={roundState.lastRoundStartedByPlayer === p.id}
                isCurrent={p.id === turnState.currentPlayer && roundIsRunning}
                cards={cards}
                spectatorMode={spectatorMode}
                onClick={handlePlayerCardClick}
                isClickable={isClickable}
                isHighlightDueToEffect={clickableAreas.dueToEffect}
                turnState={turnState}
                roundState={roundState}
              />
            );
          })}
      </div>

      <DeckUI
        deck={deck}
        drawCard={() => handleDeckClick("deck")}
        clickGraveyard={() => handleDeckClick("graveyard")}
        isCurrent={isCurrentPlayer && roundIsRunning}
        isClickable={clickableAreas}
        highlightCards={highlightCards}
        spectatorMode={spectatorMode}
      />

      {roundIsRunning && effectDisplayText && (
        <div className={styles.EffectDisplay}>{effectDisplayText}</div>
      )}

      {isLastRound ? (
        <div className={styles.LastRoundIndicator}>Last Round</div>
      ) : null}

      <ScoreDisplay
        id={myPlayerID}
        currentPlayerId={turnState.currentPlayer}
        gameIsRunning={roundIsRunning}
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
          <Button theme="primary" onClick={onStartRound}>
            Start {gameState.roundCount > 0 ? "Next" : ""} Round
          </Button>
        </div>
      )}

      <div style={{ zIndex: 10 }} className={styles.ForceEndBtn}>
        <Button onClick={onEndGame} theme="red">
          Force End Game
        </Button>
      </div>
    </div>
  );
};

export default GameUI;
