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
  Deck as DeckType,
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
import Deck from "../Deck";
import DisplayPlayers from "../DisplayPlayers";
import PlayerUI from "../PlayerUI";

import styles from "./Game.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface GameUIProps {
  gameState: GameStateType;
  roundState: RoundStateType;
  deck: DeckType;
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
}: GameUIProps) => {
  const [effectContainer, setEffectContainer] = useState<CardEffect>({
    cards: [],
    action: undefined,
    needsInteraction: false,
    timer: 2000,
  });

  // const [highlight, setHighlight] = useState<HighlightObject>({
  //   ...emptyHighlight,
  // });

  const [clickableAreas, setClickableAreas] = useState<HighlightObject>({
    ...emptyClickableAreas,
  });

  const isCurrentPlayer = turnState.currentPlayer === myPlayerID;

  useEffect(() => {
    if (roundState.isRunning) {
      setTimeout(() => {
        setEffectContainer({
          cards: [],
          action: "initialBottomRow",
          needsInteraction: false,
          timer: 5000,
        });
      }, 500);
    }
  }, [roundState.isRunning]);

  useEffect(() => {
    if (isDev) console.log(deck, playEffect);

    if (playEffect) {
      executeEffect(deck.graveyard[deck.graveyard.length - 1]);
    }
  }, [deck, playEffect]);

  useEffect(() => {
    if (isCurrentPlayer) {
      setClickableAreas({
        ...emptyClickableAreas,
        deck: true,
        graveyard: true,
      });
    } else {
      // empty highlights
      setClickableAreas({
        ...emptyClickableAreas,
      });

      // empty focus card, just in case...
      onSetSelectedCard(undefined);

      // turn off effect, just in case...
      // setPlayEffect(false);
      onEndEffect();

      // empty effectContainer, just in case...
      setEffectContainer({
        cards: [],
        action: undefined,
        needsInteraction: false,
        timer: 2000,
      });
    }
  }, [roundState.isRunning, onEndEffect]);

  useEffect(() => {
    if (!selectedCard) {
      console.log("No card in focus");
      return;
    }

    const newClickableAreas: HighlightObject = { ...emptyClickableAreas };

    switch (selectedCard.position) {
      case "deck":
        newClickableAreas.graveyard = true;
        newClickableAreas.ownCards = true;
        break;
      case "swop":
      case "graveyard":
        newClickableAreas.ownCards = true;
        break;
      default:
        // do nothing
        break;
    }

    setClickableAreas(newClickableAreas);
  }, [selectedCard]);

  useEffect(() => {
    if (effectContainer.action && !effectContainer.needsInteraction) {
      setTimeout(() => {
        if (effectContainer.action === "lookAtKing") {
          setEffectContainer({
            cards: [],
            action: "swop",
            needsInteraction: true,
            timer: 500,
          });
        } else {
          if (effectContainer.action === "swop") {
            onSwopCardsBetweenPlayers(
              effectContainer.cards[0],
              effectContainer.cards[1],
            );
          }

          // empty effect container again
          // show card only for x seconds
          setEffectContainer({
            cards: [],
            action: undefined,
            needsInteraction: false,
            timer: 2000,
          });

          if (effectContainer.action !== "initialBottomRow") {
            onNextTurn();
          }
        }
      }, effectContainer.timer);
    }
  }, [effectContainer]);

  const handleCardClick = (card: HandCard, isEffect = false) => {
    if (!isCurrentPlayer || !roundState.isRunning) {
      console.log("nenenenenenenene..");
      return;
    }

    if (!selectedCard) {
      console.log("no card in focus");
      return;
    }

    if (playEffect && isEffect) {
      let newCards: HandCard[];

      switch (selectedCard.value) {
        case 7:
        case 8:
        case 9:
        case 10:
          if (effectContainer.cards.length < 1) {
            newCards = [card];
            setEffectContainer({
              cards: newCards,
              action: "lookAt",
              needsInteraction: false,
              timer: 2000,
            });
            onHighlightCard(newCards, "lookAt");
          }
          break;

        case "J":
        case "Q":
          newCards = [...effectContainer.cards, card];
          setEffectContainer({
            cards: newCards,
            action: "swop",
            needsInteraction: newCards.length < 2 ? true : false,
            timer: 500,
          });
          break;

        case "K":
          newCards = effectContainer.cards;
          newCards.push(card);
          if (effectContainer.action !== "swop" && newCards.length <= 1) {
            setEffectContainer({
              cards: newCards,
              action: "lookAtKing",
              needsInteraction: false,
              timer: 2000,
            });
            onHighlightCard(newCards, "lookAt");
          } else {
            setEffectContainer({
              cards: newCards,
              action: "swop",
              needsInteraction: newCards.length < 2,
              timer: 500,
            });
          }
          break;

        default:
          // nothing
          break;
      }
    } else if (playEffect && !isEffect) {
      onCardPlayed(card);
    } else {
      switch (selectedCard.position) {
        // swopped with deck
        case "deck":
          onCardSwop("deck", card);
          onNextTurn();
          break;

        // swopped with graveyard
        case "graveyard":
          onCardSwop("graveyard", card);
          onNextTurn();
          break;

        // select to swop
        case "swop":
          onCardSwop("swop", card, selectedCard as CardType);
          onSetSelectedCard({
            ...selectedCard,
            position: undefined,
          });

          break;

        // regular getting rid of card
        default:
          onCardPlayed(card);
          break;
      }
    }
  };

  const handleDrawCard = () => {
    if (!isCurrentPlayer || !roundState.isRunning) {
      console.log("nenenenenenenene.. not your turn");
      return;
    }

    if (!deck) {
      console.log("Deck is not defined");
      return;
    }

    onSetSelectedCard({
      ...deck.deck[0],
      position: "deck",
    });

    onDrawCard("deck");
  };

  const handleGraveyardClick = () => {
    if (!isCurrentPlayer || !roundState.isRunning) {
      console.log("nenenenenenenene..");
      return;
    }

    if (!selectedCard) {
      console.log("FocusCard is not defined");
      return;
    }
    if (!deck) {
      console.log("Deck is not defined");
      return;
    }

    if (selectedCard.position === "deck") {
      onDrawCard("deck"); // onDrawCard(false);
      onCardFromDeckToGraveyard();

      // regular getting rid of card
    } else if (isCurrentPlayer && roundState.isRunning && !selectedCard.value) {
      onDrawCard("graveyard");

      // @ts-ignore
      onSetSelectedCard({
        ...deck.graveyard[deck.graveyard.length - 1],
        position: "graveyard",
      });
    } else {
      // do nothing
    }
  };

  const executeEffect = (card) => {
    const cardRule = cardRules.find((cR) => cR.cardValue.includes(card.value));

    if (cardRule) {
      // if area is clickable set it
      setClickableAreas(cardRule.clickableAreas);
    } else {
      // else continue
      onNextTurn();
    }
  };

  const myPos = players.findIndex((p) => p.id === myPlayerID);
  let playerNo = 0;
  let effectDisplayText = "";

  if (playEffect) {
    const currentCardRule = cardRules.find((cR) =>
      cR.cardValue.includes(deck.graveyard[deck.graveyard.length - 1].value),
    );
    if (currentCardRule) {
      effectDisplayText = currentCardRule.label;
    }
  }

  const spectatorMode = /*!isCurrentPlayer ||*/ isDev || !roundState.isRunning;

  return (
    <div className={clsx(styles.Game)}>
      <div className={styles.PlayerUIsContainer}>
        {players.map((p, k) => {
          if (p.isPlaying === false) return null;

          if (!deck) {
            console.log("Deck is not defined");
            return null;
          }

          let isClickable = clickableAreas.otherCards;
          let cards: HandCard[] = [];
          let isSelf = false;

          if (deck.hand) {
            cards = deck.hand.filter((c) => c.player === p.id);
          }

          if (p.id == myPlayerID) {
            isClickable = clickableAreas.ownCards;
            isSelf = true;
          }

          if (p.isPlaying) {
            playerNo++;
          }

          return (
            <PlayerUI
              key={"player-no_" + k}
              effect={effectContainer}
              startingPos={myPos}
              highlightCards={highlightCards}
              playerNo={playerNo - 1}
              player={p}
              isMainPlayer={isSelf}
              isEndingPlayer={roundState.lastRoundStartedByPlayer === p.id}
              isCurrent={
                p.id === turnState.currentPlayer && roundState.isRunning
              }
              cards={cards}
              spectatorMode={spectatorMode}
              onClick={handleCardClick}
              isClickable={isClickable}
              isHighlightDueToEffect={clickableAreas.dueToEffect}
            />
          );
        })}
      </div>

      <Deck
        deck={deck}
        drawCard={handleDrawCard}
        clickGraveyard={handleGraveyardClick}
        isCurrent={isCurrentPlayer && roundState.isRunning}
        isClickable={clickableAreas}
        swopHighlight={highlightDeck}
        spectatorMode={spectatorMode}
      />

      {playEffect && (
        <div className={styles.EffectDisplay}>{effectDisplayText}</div>
      )}

      {roundState.isLastRound ? (
        <div className={styles.LastRoundIndicator}>Last Round</div>
      ) : null}

      <DisplayPlayers
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
