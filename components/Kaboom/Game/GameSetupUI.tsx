import React from "react";

import clsx from "clsx";

import type { Player, PlayerID } from "../../../kaboom/types";
import Button from "../../Button";
import PlayerSelection from "../PlayerSelection";

import styles from "./Game.module.scss";

interface GameSetupUIProps {
  onNameChange: (v: string) => void;
  onPlayerToggle: (v: PlayerID) => void;
  onStartGame: () => void;
  myPlayerID: PlayerID;
  players: Player[];
}

const GameSetupUI = ({
  onNameChange,
  onPlayerToggle,
  onStartGame,
  myPlayerID,
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
        onNameChange={onNameChange}
        onPlayerToggle={onPlayerToggle}
        myPlayerID={myPlayerID}
        players={players}
      />

      <Button
        theme="primary"
        onClick={onStartGame}
        disabled={playingPlayers < 2}
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
