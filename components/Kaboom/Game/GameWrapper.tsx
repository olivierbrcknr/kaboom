import React, { useState, useEffect } from "react";

import type {
  Player,
  FocusCard,
  Deck as DeckType,
  Card as CardType,
  HandCard,
  PlayerID,
  CardPosition,
  CardHighlightType,
} from "../../../types";

import GameDevUI from "./GameDevUI";
import GameEndUI from "./GameEndUI";
import GameSetupUI from "./GameSetupUI";
import GameUI from "./GameUI";
import { useSocket, isSocket } from "./socket";
import { type GameStateType, type RoundStateType } from "./utils";

// import styles from "./Game.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface GameWrapperProps {}

const GameWrapper = ({}: GameWrapperProps) => {
  const [myState, setMyState] = useState<{
    id?: PlayerID;
    name: string;
  }>({
    id: "",
    name: "",
  });

  // overarching game state = multiple rounds
  const [gameState, setGameState] = useState<GameStateType>({
    players: [],
    isRunning: false,
    hasEnded: false,
  });

  // round state
  const [roundState, setRoundState] = useState<RoundStateType>({
    isLastRound: false,
    count: 0,
    currentPlayer: "",
    isRunning: false,
  });

  const [currentDeck, setCurrentDeck] = useState<DeckType>();

  const [playEffect, setPlayEffect] = useState(false);

  const [highlightDeck, setHighlightDeck] = useState<CardPosition | undefined>(
    undefined,
  );

  const [highlightCards, setHighlightCards] = useState<{
    cards: HandCard[];
    type?: CardHighlightType;
  }>({
    cards: [],
    type: undefined,
  });

  const [selectedCard, setSelectedCard] = useState<FocusCard | undefined>(
    undefined,
  );

  const socket = useSocket();

  // socket ———————————————————————————————————————————————

  useEffect(() => {
    if (socket === null) {
      console.log("socket not set up");
      return;
    }

    setMyState((ms) => ({
      ...ms,
      id: socket.id,
    }));

    socket.emit("initialSetup");

    socket.on("getDeck", (data: DeckType) => {
      setCurrentDeck(data);
    });

    socket.on("playersUpdated", (data: Player[]) => {
      const myPlayerData = data.find((p) => p.id === socket.id);

      if (!myPlayerData || !socket.id) {
        console.error("could not retrieve my player data");
        return;
      }

      setMyState({
        id: socket.id,
        name: myPlayerData.name,
      });

      setGameState((gs) => ({
        ...gs,
        players: data,
      }));
    });

    socket.on("gameIsRunningUpdate", (data: boolean) => {
      setGameState((gs) => ({
        ...gs,
        isRunning: data,
      }));
    });

    socket.on("roundUpdate", (roundCount: number, roundIsRunning: boolean) => {
      setRoundState((rs) => ({
        ...rs,
        count: roundCount,
        isRunning: roundIsRunning,
      }));
    });

    socket.on("currentPlayer", (pID: PlayerID) => {
      setRoundState((rs) => ({
        ...rs,
        currentPlayer: pID,
      }));
    });

    socket.on("playEffect", () => {
      setPlayEffect(true);
    });

    socket.on("selectCardToSwop", (targetCard: HandCard) => {
      setSelectedCard({
        ...targetCard,
        position: "swop",
      });
    });

    socket.on(
      "highlightSwop",
      (cards: HandCard[], type?: CardHighlightType) => {
        setHighlightCards({
          cards: cards,
          type: type,
        });
      },
    );

    socket.on("highlightDeck", (type: CardPosition) => {
      setHighlightDeck(type);
    });

    socket.on("gameHasEnded", () => {
      console.log("game has ended");
      setGameState((gs) => ({
        ...gs,
        isRunning: false,
        hasEnded: true,
      }));
    });

    socket.on("endingPlayerID", (pID: PlayerID) => {
      setRoundState((rs) => ({
        ...rs,
        isLastRound: pID,
      }));
    });

    return () => {
      // detach listeners
      socket.off("getDeck");
      socket.off("playersUpdated");
      socket.off("gameIsRunningUpdate");
      socket.off("roundUpdate");
      socket.off("currentPlayer");
      socket.off("playEffect");
      socket.off("selectCardToSwop");
      socket.off("highlightSwop");
      socket.off("highlightDeck");
      socket.off("gameHasEnded");
      socket.off("endingPlayerID");
    };
  }, [socket]);

  useEffect(() => {
    // hide highlight after 2sec
    if (highlightCards.cards.length > 0) {
      setTimeout(() => {
        setHighlightCards({
          cards: [],
          type: undefined,
        });

        setHighlightDeck(undefined);
      }, 2000);
    }
  }, [highlightCards]);

  const handleChangeName = (v: string) => {
    if (isSocket(socket)) {
      socket.emit("nameChange", v);
    }
  };

  const handlePlayerToggle = (v: PlayerID) => {
    if (isSocket(socket)) {
      socket.emit("playerToggle", v);
    }
  };

  const handleStartGame = () => {
    console.log("Start Game");
    if (isSocket(socket)) {
      socket.emit("startGame");
    }
  };

  const handleEndGame = () => {
    if (isSocket(socket)) {
      socket.emit("endGame");
    }
  };

  // not needed anymore?
  const handlePlayerIsEnding = () => {
    if (isSocket(socket) && myState.id) {
      socket.emit("playerIsEnding", myState.id);
    }
  };

  const handleEndRound = () => {
    if (isSocket(socket)) {
      socket.emit("endRound", myState.id);
    }
  };

  const handleStartRound = () => {
    if (isSocket(socket)) {
      socket.emit("startRound");
    }
  };

  const handleDrawCard = (position: CardPosition) => {
    if (isSocket(socket)) {
      socket.emit("drawCard", position);
    }
  };

  const handleNextTurn = () => {
    if (isSocket(socket)) {
      socket.emit("nextTurn");
    }
  };

  // const handleEffect = (action: CardActions) => {
  //   switch (action) {
  //     case "lookAt":
  //       break;
  //     case "swop":
  //       break;
  //     case "lookAtKing":
  //       break;
  //     case "initialBottomRow":
  //       break;
  //     case "endRound":
  //       break;
  //     default:
  //       const exhaustiveCheck: never = action;
  //       throw new Error(`Board has no firmata: ${exhaustiveCheck}`);
  //       break;
  //   }
  // };

  const handleEndEffect = () => {
    setPlayEffect(false);
  };

  const handleHighlightCard = (
    cards: HandCard[],
    highlight: CardHighlightType,
  ) => {
    if (isSocket(socket)) {
      socket.emit("highlightCard", cards, highlight);
    }
  };

  const handleCardPlayed = (card: HandCard) => {
    if (isSocket(socket)) {
      socket.emit("cardPlayed", card);
    }
  };

  const handleCardSwop = (
    position: CardPosition,
    card: HandCard,
    secondCard?: HandCard | CardType,
  ) => {
    if (isSocket(socket)) {
      switch (position) {
        // swopped with deck
        case "deck":
          socket.emit("cardSwoppedFromDeck", card);
          break;
        // swopped with graveyard
        case "graveyard":
          socket.emit("cardSwoppedFromGraveyard", card);
          break;
        // select to swop
        case "swop":
          socket.emit("cardShiftedToPlayer", card, secondCard);
          break;
      }
    }
  };

  const handleSwopCardsBetweenPlayers = (card1: HandCard, card2: HandCard) => {
    if (isSocket(socket)) {
      socket.emit("cardSwoppedBetweenPlayers", [card1, card2]);
    }
  };

  const handleCardFromDeckToGraveyard = () => {
    if (isSocket(socket)) {
      socket.emit("cardFromDeckToGraveyard");
    }
  };

  // rules ————————————————————————————————————————————————
  // end automatically if no more cards on hand
  useEffect(() => {
    if (!currentDeck) {
      console.log("no deck yet");
      return;
    }

    // TODO: Check if still relevant to do this complicated
    let cardsOnHand = 0;
    for (let i = 0; i < currentDeck.hand.length; i++) {
      if (currentDeck.hand[i].player === myState.id) {
        cardsOnHand++;
      }
    }
    // console.log('I have '+cardsOnHand+' on my hand')
    if (cardsOnHand === 0) {
      handlePlayerIsEnding();
    }
  }, [myState.id, currentDeck?.hand]);

  // UI ———————————————————————————————————————————————————

  console.log(gameState);

  if (!myState.id) {
    console.log("no player id yet");
    return null;
  }

  // Overarching for a game ———————————————————————————————
  if (gameState.hasEnded) {
    return (
      <GameEndUI
        players={gameState.players}
        myPlayerID={myState.id}
        onEndGame={handleEndGame}
      />
    );
  }

  if (!gameState.isRunning) {
    return (
      <GameSetupUI
        onNameChange={handleChangeName}
        onPlayerToggle={handlePlayerToggle}
        onStartGame={handleStartGame}
        myPlayerID={myState.id}
        players={gameState.players}
      />
    );
  }

  // Overarching for a round ———————————————————————————————

  // check that all info is actually here,
  // if not return an error and do not render UI
  if (!currentDeck) {
    return null;
  }

  return (
    <>
      <GameUI
        gameState={gameState}
        roundState={roundState}
        deck={currentDeck}
        myPlayerID={myState.id}
        onPlayerIsEndingRound={handleEndRound}
        onStartRound={handleStartRound}
        onEndGame={handleEndGame}
        playEffect={playEffect}
        onEndEffect={handleEndEffect}
        onDrawCard={handleDrawCard}
        onNextTurn={handleNextTurn}
        onHighlightCard={handleHighlightCard}
        onCardPlayed={handleCardPlayed}
        onCardSwop={handleCardSwop}
        onSwopCardsBetweenPlayers={handleSwopCardsBetweenPlayers}
        onCardFromDeckToGraveyard={handleCardFromDeckToGraveyard}
        highlightDeck={highlightDeck}
        highlightCards={highlightCards}
        selectedCard={selectedCard}
        onSetSelectedCard={setSelectedCard}
      />
      {isDev && <GameDevUI socket={socket} />}
    </>
  );
};

export default GameWrapper;
