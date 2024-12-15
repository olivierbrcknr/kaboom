import React, { useState, useEffect } from "react";

import clsx from "clsx";

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
} from "../../../types";
import Button from "../../Button";
import Deck from "../Deck";
import DisplayPlayers from "../DisplayPlayers";
import PlayerUI from "../PlayerUI";

import { type RoundStateType, type GameStateType } from "./utils";

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
  focusCard?: FocusCard;
  onSetFocusCard: (c: FocusCard) => void;
}

interface HighlightObject {
  deck: boolean;
  dueToEffect: boolean;
  graveyard: boolean;
  otherCards: boolean;
  ownCards: boolean;
}

const emptyHighlight: HighlightObject = {
  deck: false,
  dueToEffect: false,
  graveyard: false,
  otherCards: false,
  ownCards: false,
};

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
  focusCard,
  onSetFocusCard,
}: GameUIProps) => {
  const [effectContainer, setEffectContainer] = useState<CardEffect>({
    cards: [],
    action: undefined,
    needsInteraction: false,
    timer: 2000,
  });

  const [highlight, setHighlight] = useState<HighlightObject>({
    ...emptyHighlight,
  });

  const isCurrentPlayer = roundState.currentPlayer === myPlayerID;

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
    if (isDev) console.log(deck);

    if (playEffect) {
      executeEffect(deck.graveyard[deck.graveyard.length - 1]);
    }
  }, [deck, playEffect]);

  useEffect(() => {
    if (isCurrentPlayer) {
      setHighlight({
        ...emptyHighlight,
        deck: true,
        graveyard: true,
      });
    } else {
      // empty highlights
      setHighlight({
        ...emptyHighlight,
      });

      // empty focus card, just in case...
      // onSetFocusCard({
      //   value: null,
      //   color: null,
      //   position: null,
      //   slot: {
      //     x: null,
      //     y: null,
      //   },
      // });

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
    if (!focusCard) {
      console.log("No card in focus");
      return;
    }

    const newHighlight: HighlightObject = { ...emptyHighlight };

    switch (focusCard.position) {
      case "deck":
        newHighlight.graveyard = true;
        newHighlight.ownCards = true;
        break;
      case "swop":
      case "graveyard":
        newHighlight.ownCards = true;
        break;
      default:
        // do nothing
        break;
    }

    setHighlight(newHighlight);
  }, [focusCard]);

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

    if (!focusCard) {
      console.log("no card in focus");
      return;
    }

    if (playEffect && isEffect) {
      let newCards: HandCard[];

      switch (focusCard.value) {
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
      switch (focusCard.position) {
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
          onCardSwop("swop", card, focusCard as CardType);
          onSetFocusCard({
            ...focusCard,
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
      console.log("nenenenenenenene..");
      return;
    }

    if (!deck) {
      console.log("Deck is not defined");
      return;
    }

    // @ts-ignore
    onSetFocusCard({
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

    if (!focusCard) {
      console.log("FocusCard is not defined");
      return;
    }
    if (!deck) {
      console.log("Deck is not defined");
      return;
    }

    if (focusCard.position === "deck") {
      onDrawCard("deck"); // onDrawCard(false);
      onCardFromDeckToGraveyard();

      // regular getting rid of card
    } else if (isCurrentPlayer && roundState.isRunning && !focusCard.value) {
      onDrawCard("graveyard");

      // @ts-ignore
      onSetFocusCard({
        ...deck.graveyard[deck.graveyard.length - 1],
        position: "graveyard",
      });
    } else {
      // do nothing
    }
  };

  const executeEffect = (card) => {
    let highlightChanged = true;
    const newHighlight: HighlightObject = { ...emptyHighlight };

    switch (card.value) {
      case 7:
      case 8:
        console.log("Look at own card");
        newHighlight.dueToEffect = true;
        newHighlight.ownCards = true;
        break;

      case 9:
      case 10:
        console.log("Look at opponent‘s card");
        newHighlight.dueToEffect = true;
        newHighlight.otherCards = true;
        break;

      case "J":
      case "Q":
        console.log("Swop 2 cards");
        newHighlight.dueToEffect = true;
        newHighlight.otherCards = true;
        newHighlight.ownCards = true;
        break;

      case "K":
        newHighlight.dueToEffect = true;
        newHighlight.otherCards = true;
        newHighlight.ownCards = true;
        console.log("Look at 1 card and swop 2 cards");
        break;

      default:
        // nothing, end turn
        highlightChanged = false;
        onNextTurn();
        break;
    }

    if (highlightChanged) {
      setHighlight(newHighlight);
    }
  };

  const myPos = gameState.players.findIndex((p) => p.id === myPlayerID);
  let playerNo = 0;
  let effectDisplayText = "";

  if (playEffect) {
    switch (deck.graveyard[deck.graveyard.length - 1].value) {
      case 7:
      case 8:
        effectDisplayText = "Look at an own card";
        break;

      case 9:
      case 10:
        effectDisplayText = "Look at an opponent‘s card";
        break;

      case "J":
      case "Q":
        effectDisplayText = "Swop 2 cards";
        break;

      case "K":
        effectDisplayText = "Look at 1 card and swop 2 cards";
        break;

      default:
        // display nothing
        break;
    }
  }

  return (
    <div className={clsx(styles.Game)}>
      <div className={styles.PlayerUIsContainer}>
        {gameState.players.map((p, k) => {
          if (p.isPlaying === false) {
            return null;
          }

          if (!deck) {
            console.log("Deck is not defined");
            return null;
          }

          let isHighlight = highlight.otherCards;
          let cards: HandCard[] = [];
          let isSelf = false;

          if (deck.hand) {
            cards = deck.hand.filter((c) => c.player === p.id);
          }

          if (p.id == myPlayerID) {
            isHighlight = highlight.ownCards;
            isSelf = true;
          }

          if (p.isPlaying) {
            playerNo++;
          }

          return (
            <PlayerUI
              key={"player-no_" + k}
              effect={effectContainer}
              swopHighlight={highlightCards}
              startingPos={myPos}
              playerNo={playerNo - 1}
              player={p}
              isMainPlayer={isSelf}
              isEndingPlayer={roundState.isLastRound === p.id}
              isCurrent={isCurrentPlayer && roundState.isRunning}
              cards={cards}
              spectatorMode={
                /*!isCurrentPlayer || isDev || */ !roundState.isRunning
                  ? true
                  : false
              }
              onClick={handleCardClick}
              isHighlight={isHighlight}
              isHighlightDueToEffect={highlight.dueToEffect}
            />
          );
        })}
      </div>

      <Deck
        deck={deck}
        drawCard={handleDrawCard}
        clickGraveyard={handleGraveyardClick}
        isCurrent={isCurrentPlayer && roundState.isRunning}
        isHighlight={highlight}
        // swopHighlight={highlightDeck}
      />

      {playEffect && (
        <div className={styles.EffectDisplay}>{effectDisplayText}</div>
      )}

      {roundState.isLastRound ? (
        <div className={styles.LastRoundIndicator}>Last Round</div>
      ) : null}

      <DisplayPlayers
        id={myPlayerID}
        currentPlayerId={roundState.currentPlayer}
        gameIsRunning={roundState.isRunning}
        players={gameState.players}
      />

      {isCurrentPlayer &&
        !roundState.isLastRound &&
        !playEffect &&
        highlight.deck && (
          <Button
            /*className={styles.IEndButton}*/ onClick={onPlayerIsEndingRound}
          >
            I Want To End
          </Button>
        )}

      {!roundState.isRunning && (
        <div className={styles.StartRoundContainer}>
          <Button
            /*className={styles.StartRoundButton}*/ onClick={onStartRound}
          >
            Start {roundState.count > 0 ? "Next" : ""} Round
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
