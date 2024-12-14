import React, { useState, useEffect } from "react";

import clsx from "clsx";

import type {
  Player,
  FocusCard,
  Deck as DeckType,
  Card,
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

  const [focusCard, setFocusCard] = useState<FocusCard | undefined>(undefined);

  const [swopHighlightCards, setSwopHighlightCards] = useState<{
    cards: HandCard[];
    type?: CardHighlightType;
  }>({
    cards: [],
    type: undefined,
  });

  const [highlightDeck, setHighlightDeck] = useState(false);

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
    // hide highlight after 2sec
    if (swopHighlightCards.cards.length > 0) {
      setTimeout(() => {
        setSwopHighlightCards({
          cards: [],
          type: undefined,
        });

        setHighlightDeck(false);
      }, 2000);
    }
  }, [swopHighlightCards]);

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
      // setFocusCard({
      //   value: null,
      //   color: null,
      //   position: null,
      //   slot: {
      //     x: null,
      //     y: null,
      //   },
      // });

      // turn off effect, just in case...
      setPlayEffect(false);

      // empty effectContainer, just in case...
      setEffectContainer({
        cards: [],
        action: undefined,
        needsInteraction: false,
        timer: 2000,
      });
    }
  }, [roundState.isRunning]);

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
            socket.emit("cardSwoppedBetweenPlayers", effectContainer.cards);
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
            socket.emit("nextTurn");
          }
        }
      }, effectContainer.timer);
    }
  }, [effectContainer]);

  const handleCardClick = (card: Card, isEffect = false) => {
    if (!isCurrentPlayer || !roundState.isRunning) {
      console.log("nenenenenenenene..");
      return;
    }

    if (!focusCard) {
      console.log("no card in focus");
      return;
    }

    if (playEffect && isEffect) {
      switch (focusCard.value) {
        case 7:
        case 8:
        case 9:
        case 10:
          if (effectContainer.cards.length < 1) {
            var cards = [card];
            setEffectContainer({
              cards: cards,
              action: "lookAt",
              needsInteraction: false,
              timer: 2000,
            });
            socket.emit("highlightCard", cards, "lookAt");
          }
          break;

        case "J":
        case "Q":
          var cards = effectContainer.cards;
          cards.push(card);
          setEffectContainer({
            cards: cards,
            action: "swop",
            needsInteraction: cards.length < 2 ? true : false,
            timer: 500,
          });
          break;

        case "K":
          var cards = effectContainer.cards;
          cards.push(card);
          if (effectContainer.action !== "swop" && cards.length <= 1) {
            setEffectContainer({
              cards: cards,
              action: "lookAtKing",
              needsInteraction: false,
              timer: 2000,
            });
            socket.emit("highlightCard", cards, "lookAt");
          } else {
            setEffectContainer({
              cards: cards,
              action: "swop",
              needsInteraction: cards.length < 2 ? true : false,
              timer: 500,
            });
          }
          break;

        default:
          // nothing
          break;
      }
    } else if (playEffect && !isEffect) {
      socket.emit("cardPlayed", card);
    } else {
      switch (focusCard.position) {
        // swopped with deck
        case "deck":
          socket.emit("cardSwoppedFromDeck", card);
          socket.emit("nextTurn");
          break;

        // swopped with graveyard
        case "graveyard":
          socket.emit("cardSwoppedFromGraveyard", card);
          socket.emit("nextTurn");
          break;

        // select to swop
        case "swop":
          socket.emit("cardShiftedToPlayer", card, focusCard);
          setFocusCard({
            ...focusCard,
            position: null,
          });

          break;

        // regular getting rid of card
        default:
          socket.emit("cardPlayed", card);
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
    setFocusCard({
      ...deck.deck[0],
      position: "deck",
    });

    socket.emit("drawCard", "deck");
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
      socket.emit("drawCard", false);
      socket.emit("cardFromDeckToGraveyard");

      // regular getting rid of card
    } else if (
      myPlayerID === currentPlayer &&
      roundState.isRunning &&
      !focusCard.value
    ) {
      socket.emit("drawCard", "graveyard");

      // @ts-ignore
      setFocusCard({
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
        socket.emit("nextTurn");
        break;
    }

    if (highlightChanged) {
      setHighlight(newHighlight);
    }
  };

  let playerUIs: (React.JSX.Element | null)[] | null = null;
  const myPos = gameState.players.findIndex((p) => p.id === myPlayerID);

  let playerNo = 0;

  playerUIs = gameState.players.map((p, k) => {
    if (p.isPlaying === false) {
      return null;
    }

    if (!deck) {
      console.log("Deck is not defined");
      return null;
    }

    let isHighlight = highlight.otherCards;
    let cards: Card[] = [];
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
        swopHighlight={swopHighlightCards}
        startingPos={myPos}
        playerNo={playerNo - 1}
        player={p}
        isMainPlayer={isSelf}
        isEndingPlayer={roundState.isLastRound === p.id}
        isCurrent={isCurrentPlayer && roundState.isRunning}
        cards={cards}
        spectatorMode={
          /*!isCurrentPlayer || isDev || */ !roundState.isRunning ? true : false
        }
        onClick={handleCardClick}
        isHighlight={isHighlight}
        isHighlightDueToEffect={highlight.dueToEffect}
      />
    );
  });

  let effectDisplay: React.JSX.Element | null = null;

  if (playEffect) {
    let effectDisplayText: string | null = null;

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

    effectDisplay = (
      <div className={styles.EffectDisplay}>{effectDisplayText}</div>
    );
  }

  return (
    <div className={clsx(styles.Game)}>
      <div className={styles.PlayerUIsContainer}>{playerUIs}</div>

      <Deck
        deck={deck}
        drawCard={handleDrawCard}
        clickGraveyard={handleGraveyardClick}
        isCurrent={isCurrentPlayer && roundState.isRunning}
        isHighlight={highlight}
        swopHighlight={highlightDeck}
      />

      {effectDisplay}

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
        <Button onClick={onEndGame}>Force End Game</Button>
      </div>
    </div>
  );
};

export default GameUI;
