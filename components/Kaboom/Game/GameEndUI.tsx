import React from "react";

import type { Player, PlayerID } from "../../../kaboom/types";

import Button from "../../Button";
import styles from "./Game.module.scss";

interface GameEndUIProps {
  myPlayerID: PlayerID;
  onExitGame: () => void;
  players: Player[];
}

const GameEndUI = ({ myPlayerID, onExitGame, players }: GameEndUIProps) => {
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
              className={player.id === myPlayerID ? styles.isCurrent : ""}
              key={"podium-" + player.id}
            >
              {player.name} [{player.points}]
            </li>
          );
        })}
      </ol>
      <Button onClick={onExitGame}>Exit Game</Button>

      {/* <div className={styles.EndGameButton} onClick={onExitGame}>
        End Game
      </div>*/}
    </div>
  );
};

export default GameEndUI;
