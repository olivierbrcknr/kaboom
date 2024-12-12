import clsx from "clsx";

import type { Player, PlayerID } from "../../../types";

import styles from "./PlayerSelection.module.scss";

interface PlayerSelectionProps {
  onNameChange: (v: string) => void;
  onPlayerToggle: (v: PlayerID) => void;
  id: PlayerID;
  players: Player[];
}

const PlayerSelection = ({
  id,
  onNameChange,
  onPlayerToggle,
  players,
}: PlayerSelectionProps) => {
  return (
    <div className={clsx(styles.PlayerSelection)}>
      <ul>
        {players.map((p) => {
          return (
            <li className={clsx(p.id === id && styles.isSelf)} key={p.id}>
              {p.id === id ? (
                <input
                  type="text"
                  onChange={(v) => onNameChange(v.target.value)}
                  className={styles.PlayerName}
                  placeholder={"You"}
                  value={p.name}
                />
              ) : (
                <div className={styles.PlayerName}>{p.name}</div>
              )}
              <div
                onClick={() => onPlayerToggle(p.id)}
                className={clsx(styles.Toggle, p.isPlaying && styles.ToggleOn)}
              >
                <div className={styles.ToggleKnob}></div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayerSelection;
