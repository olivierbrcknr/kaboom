import React from "react";

import clsx from "clsx";

import type { Player, PlayerID } from "../../../kaboom/types";
import Button from "../../Button";
import PlayerSelection from "../PlayerSelection";

import styles from "./Game.module.scss";

interface GameSetupUIProps {
  myPlayerID: PlayerID;
  onNameChange: (v: string) => void;
  onPlayerToggle: (v: PlayerID) => void;
  onStartGame: () => void;
  players: Player[];
}

const GameSetupUI = ({
  myPlayerID,
  onNameChange,
  onPlayerToggle,
  onStartGame,
  players,
}: GameSetupUIProps) => {
  let playingPlayers = 0;

  for (let i = 0; i < players.length; i++) {
    if (players[i].isPlaying) {
      playingPlayers++;
    }
  }

  return (
    <div className={clsx(styles.Game, styles.isStartScreen)}>
      <h1>Kaboom</h1>

      <PlayerSelection
        myPlayerID={myPlayerID}
        onNameChange={onNameChange}
        onPlayerToggle={onPlayerToggle}
        players={players}
      />

      <Button
        disabled={playingPlayers < 2}
        onClick={onStartGame}
        theme="primary"
      >
        Start Game
      </Button>

      {/*<div
        className={clsx(
          styles.StartButton,
          playingPlayers < 2 && styles.StartButtonIsDisabled,
        )}
        onClick={onStartGame}
      >
        Start Game
      </div>*/}
    </div>
  );
};

export default GameSetupUI;
