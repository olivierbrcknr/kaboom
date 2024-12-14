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
import Deck from "../Deck";
import DisplayPlayers from "../DisplayPlayers";
import PlayerSelection from "../PlayerSelection";
import PlayerUI from "../PlayerUI";

import GameDevUI from "./GameDevUI";
import GameEndUI from "./GameEndUI";
import GameSetupUI from "./GameSetupUI";
import GameUI from "./GameUI";
import socket from "./socket";
import { type GameStateType, type RoundStateType } from "./utils";

import styles from "./Game.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface GameWrapperProps {}

const GameWrapper = ({}: GameWrapperProps) => {
  const [myState, setMyState] = useState<{
    id: PlayerID;
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

  // socket ———————————————————————————————————————————————

  useEffect(() => {
    setMyState({
      ...myState,
      id: socket.id,
    });

    socket.emit("initialSetup");

    socket.on("getDeck", (data: DeckType) => {
      setCurrentDeck(data);
    });

    socket.on("playersUpdated", (data: Player[]) => {
      const myPlayerData = data.find((p) => p.id === socket.id);

      setMyState({
        id: socket.id,
        name: myPlayerData.name,
      });

      setGameState({
        ...gameState,
        players: data,
      });
    });

    socket.on("gameIsRunningUpdate", (data: boolean) => {
      setGameState({
        ...gameState,
        isRunning: data,
      });
    });

    socket.on("roundUpdate", (roundCount: number, roundIsRunning: boolean) => {
      setRoundState({
        ...roundState,
        count: roundCount,
        isRunning: roundIsRunning,
      });
    });

    socket.on("currentPlayer", (pID: PlayerID) => {
      setRoundState({
        ...roundState,
        currentPlayer: pID,
      });
    });

    socket.on("playEffect", () => {
      setPlayEffect(true);
    });

    socket.on("selectCardToSwop", (targetCard: HandCard) => {
      setFocusCard({
        ...targetCard,
        position: "swop",
      });
    });

    socket.on(
      "highlightSwop",
      (cards: CardType[], type?: CardHighlightType) => {
        setSwopHighlightCards({
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
      setGameState({
        ...gameState,
        isRunning: false,
        hasEnded: true,
      });
    });

    socket.on("endingPlayerID", (pID: PlayerID) => {
      setRoundState({
        ...roundState,
        isLastRound: pID,
      });
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
  }, []);

  const handleChangeName = (v: string) => {
    socket.emit("nameChange", v);
  };

  const handlePlayerToggle = (v: PlayerID) => {
    socket.emit("playerToggle", v);
  };

  const handleStartGame = () => {
    socket.emit("startGame");
  };

  const handleEndGame = () => {
    socket.emit("endGame");
  };

  // not needed anymore?
  const handlePlayerIsEnding = () => {
    socket.emit("playerIsEnding", myState.id);
  };

  const handleEndRound = () => {
    socket.emit("endRound", myState.id);
  };

  const handleStartRound = () => {
    socket.emit("startRound");
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

  // Overarching for a game ———————————————————————————————
  if (gameState.hasEnded) {
    <GameEndUI
      players={gameState.players}
      myPlayerID={myState.id}
      onEndGame={handleEndGame}
    />;
  }

  if (!gameState.isRunning) {
    <GameSetupUI
      onNameChange={handleChangeName}
      onPlayerToggle={handlePlayerToggle}
      onStartGame={handleStartGame}
      myPlayerID={myState.id}
      players={gameState.players}
    />;
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
      />
      {isDev && <GameDevUI socket={socket} />}
    </>
  );
};

export default GameWrapper;
