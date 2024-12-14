import React from "react";

import clsx from "clsx";

import type { Player, PlayerID } from "../../../types";
import Button from "../../Button";

import styles from "./Game.module.scss";

interface GameEndUIProps {
  players: Player[];
  myPlayerID: PlayerID;
  onEndGame: () => void;
}

const GameEndUI = ({ players, myPlayerID, onEndGame }: GameEndUIProps) => {
  const podiumPlayers = players.sort((p1, p2) => {
    let comparison = 0;
    if (p1.points > p2.points) {
      comparison = 1;
    } else if (p1.points < p2.points) {
      comparison = -1;
    }
    return comparison;
  });

  return (
    <div className={styles.EndGameContainer}>
      <ol className={styles.Podium}>
        {podiumPlayers.map((player) => {
          return (
            <li
              key={"podium-" + player.id}
              className={player.id === myPlayerID ? styles.isCurrent : ""}
            >
              {player.name} [{player.points}]
            </li>
          );
        })}
      </ol>
      <Button onClick={onEndGame}>End Game</Button>

      {/* <div className={styles.EndGameButton} onClick={onEndGame}>
        End Game
      </div>*/}
    </div>
  );
};

export default GameEndUI;
