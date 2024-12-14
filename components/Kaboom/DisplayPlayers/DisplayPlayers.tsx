import clsx from "clsx";

import type { Player, PlayerID } from "../../../types";

import styles from "./DisplayPlayers.module.scss";

interface DisplayPlayersProps {
  id: PlayerID;
  currentPlayerId?: PlayerID;
  gameIsRunning: boolean;
  players: Player[];
}

const DisplayPlayers = ({
  currentPlayerId,
  gameIsRunning,
  id,
  players,
}: DisplayPlayersProps) => {
  return (
    <div className={clsx(styles.DisplayPlayers)}>
      <ul>
        {players.map((p) => {
          // Hide players that are not playing
          if (!p.isPlaying) {
            return null;
          }

          return (
            <li
              className={clsx(
                p.id === currentPlayerId && gameIsRunning && styles.isCurrent,
                p.id === id && styles.isSelf,
              )}
              key={p.id}
            >
              <div className={styles.PlayerName}>{p.name}</div>
              <ul className={styles.RoundPointDisplay}>
                {p.roundPoints.map((point, i) => {
                  return <li key={"roundPoint-" + p.id + "-" + i}>{point}</li>;
                })}
              </ul>
              <div className={styles.PlayerTotalPointDisplay}>[{p.points}]</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DisplayPlayers;
