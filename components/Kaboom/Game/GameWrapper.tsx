import React from "react";

import { useIsDev } from "../../../utils";

import GameDevUI from "./GameDevUI";
import GameEndUI from "./GameEndUI";
import { useGame } from "./gameLogic";
import GameSetupUI from "./GameSetupUI";
import GameUI from "./GameUI";

interface GameWrapperProps {}

const GameWrapper = ({}: GameWrapperProps) => {
  const isDev = useIsDev();

  const {
    canMoveCard,
    currentDeck,
    displayHighlightCards,
    gameState,
    handleChangeName,
    handleDeckClick,
    handleEndGame,
    handleEndRound,
    handleExitGame,
    handleNextTurn,
    handlePlayerCardClick,
    handlePlayerToggle,
    handleStartGame,
    handleStartRound,
    myState,
    players,
    roundState,
    selectedCard,
    socket,
    turnState,
  } = useGame();

  // UI ———————————————————————————————————————————————————

  if (isDev) {
    console.log("gameState");
    console.table(gameState);
    console.log("roundState");
    console.table(roundState);
    console.log("turnState");
    console.table(turnState);
  }

  if (!myState.id) {
    console.log("no player id yet");
    return null;
  }

  // Overarching for a game ———————————————————————————————
  if (gameState.hasEnded) {
    return (
      <GameEndUI
        myPlayerID={myState.id}
        onExitGame={handleExitGame}
        players={players}
      />
    );
  }

  if (!gameState.isRunning) {
    return (
      <GameSetupUI
        myPlayerID={myState.id}
        onNameChange={handleChangeName}
        onPlayerToggle={handlePlayerToggle}
        onStartGame={handleStartGame}
        players={players}
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
        canMoveCard={canMoveCard}
        deck={currentDeck}
        gameState={gameState}
        handleDeckClick={handleDeckClick}
        handlePlayerCardClick={handlePlayerCardClick}
        highlightCards={displayHighlightCards}
        myPlayerID={myState.id}
        onEndGame={handleEndGame}
        onNextTurn={handleNextTurn}
        onPlayerIsEndingRound={handleEndRound}
        onStartRound={handleStartRound}
        players={players}
        roundState={roundState}
        selectedCard={selectedCard}
        turnState={turnState}
      />
      {isDev && <GameDevUI socket={socket} />}
    </>
  );
};

export default GameWrapper;
