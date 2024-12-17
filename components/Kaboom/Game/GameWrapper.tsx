import React from "react";

import GameDevUI from "./GameDevUI";
import GameEndUI from "./GameEndUI";
import { useGame } from "./gameLogic";
import GameSetupUI from "./GameSetupUI";
import GameUI from "./GameUI";

// import styles from "./Game.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface GameWrapperProps {}

const GameWrapper = ({}: GameWrapperProps) => {
  const {
    myState,
    gameState,
    handleSwopCardsBetweenPlayers,
    handleCardFromDeckToGraveyard,
    handleCardSwop,
    handleEndEffect,
    handleHighlightCard,
    handleCardPlayed,
    handleChangeName,
    handlePlayerToggle,
    handleStartGame,
    handleEndGame,
    handleEndRound,
    handleStartRound,
    handleDrawCard,
    handleNextTurn,
    roundState,
    playEffect,
    highlightDeck,
    selectedCard,
    currentDeck,
    highlightCards,
    setSelectedCard,
    socket,
    turnState,
    players,
    handleExitGame,
  } = useGame();

  // UI ———————————————————————————————————————————————————

  console.log("gameState");
  console.table(gameState);
  console.log("roundState");
  console.table(roundState);
  console.log("turnState");
  console.table(turnState);

  if (!myState.id) {
    console.log("no player id yet");
    return null;
  }

  // Overarching for a game ———————————————————————————————
  if (gameState.hasEnded) {
    return (
      <GameEndUI
        players={players}
        myPlayerID={myState.id}
        onExitGame={handleExitGame}
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
        players={players}
        turnState={turnState}
      />
      {isDev && <GameDevUI socket={socket} />}
    </>
  );
};

export default GameWrapper;
