import React, { useState, useEffect } from "react";

import clsx from "clsx";

import {
  type HighlightObject,
  cardRules,
  emptyHighlight,
} from "../../../kaboom/ruleHelpers";
import type {
  Player,
  FocusCard,
  Deck,
  DeckType,
  Card as CardType,
  HandCard,
  PlayerID,
  CardEffect,
  CardPosition,
  CardHighlightType,
  GameStateType,
  RoundStateType,
  TurnStateType,
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
  playEffect: boolean;
  onEndEffect: () => void;
  onDrawCard: (v: CardPosition) => void;
  onHighlightCard: (cards: HandCard[], action: CardHighlightType) => void;
  onCardPlayed: (card: HandCard) => void;
  onCardSwop: (
    position: CardPosition,
    card: HandCard,
    secondCard?: HandCard | CardType,
  ) => void;
  onSwopCardsBetweenPlayers: (card1: HandCard, card2: HandCard) => void;
  onCardFromDeckToGraveyard: () => void;
  highlightDeck?: CardPosition;
  highlightCards: {
    cards: HandCard[];
    type?: CardHighlightType;
  };
  selectedCard?: FocusCard;
  onSetSelectedCard: (c: FocusCard | undefined) => void;
  players: Player[];
  turnState: TurnStateType;
  handleDeckClick: (type: DeckType) => void;
  handlePlayerCardClick: (card: CardType) => void;
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
  onNextTurn,
  playEffect,
  onEndEffect,
  onDrawCard,
  onHighlightCard,
  onCardPlayed,
  onCardSwop,
  onSwopCardsBetweenPlayers,
  onCardFromDeckToGraveyard,
  highlightDeck,
  highlightCards,
  selectedCard,
  onSetSelectedCard,
  players,
  turnState,
  handleDeckClick,
  handlePlayerCardClick,
}: GameUIProps) => {
  const clickableAreas = { ...emptyClickableAreas };

  const isCurrentPlayer = turnState.currentPlayer === myPlayerID;

  const myPos = players.findIndex((p) => p.id === myPlayerID);
  let effectDisplayText = "";

  if (playEffect) {
    const currentCardRule = cardRules.find((cR) =>
      cR.cardValue.includes(deck.graveyard[deck.graveyard.length - 1].value),
    );
    if (currentCardRule) {
      effectDisplayText = currentCardRule.label;
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
        clickableAreas.graveyard = true;
        break;
      case "effect":
        // if is "effect" phase and is current player
        // --> cards accordingly (own and/or others)
        // ################################
        break;
    }
  }

  const spectatorMode = isDev || !roundState.isRunning;

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
                effect={effectContainer}
                startingPos={myPos}
                highlightCards={highlightCards}
                playerNo={k + 1}
                player={p}
                isMainPlayer={isSelf}
                isEndingPlayer={roundState.lastRoundStartedByPlayer === p.id}
                isCurrent={
                  p.id === turnState.currentPlayer && roundState.isRunning
                }
                cards={cards}
                spectatorMode={spectatorMode}
                onClick={handlePlayerCardClick}
                isClickable={isClickable}
                isHighlightDueToEffect={clickableAreas.dueToEffect}
              />
            );
          })}
      </div>

      <DeckUI
        deck={deck}
        drawCard={() => handleDeckClick("deck")}
        clickGraveyard={() => handleDeckClick("graveyard")}
        isCurrent={isCurrentPlayer && roundState.isRunning}
        isClickable={clickableAreas}
        swopHighlight={highlightDeck}
        spectatorMode={spectatorMode}
      />

      {effectDisplayText && (
        <div className={styles.EffectDisplay}>{effectDisplayText}</div>
      )}

      {roundState.isLastRound ? (
        <div className={styles.LastRoundIndicator}>Last Round</div>
      ) : null}

      <ScoreDisplay
        id={myPlayerID}
        currentPlayerId={turnState.currentPlayer}
        gameIsRunning={roundState.isRunning}
        players={players}
      />

      {isCurrentPlayer &&
        !roundState.isLastRound &&
        !playEffect &&
        clickableAreas.deck && (
          <div className={styles.IWantToEndButton}>
            <Button onClick={onPlayerIsEndingRound}>I want to end</Button>
          </div>
        )}

      {!roundState.isRunning && (
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
