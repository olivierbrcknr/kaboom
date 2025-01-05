import clsx from "clsx";

import type { Player, PlayerID } from "../../../kaboom/types";
import Toggle from "../../Toggle";

import styles from "./PlayerSelection.module.scss";

interface PlayerSelectionProps {
  myPlayerID: PlayerID;
  onNameChange: (v: string) => void;
  onPlayerToggle: (v: PlayerID) => void;
  players: Player[];
}

const PlayerSelection = ({
  myPlayerID,
  onNameChange,
  onPlayerToggle,
  players,
}: PlayerSelectionProps) => {
  return (
    <div className={clsx(styles.PlayerSelection)}>
      <ul>
        {players.map((p) => {
          return (
            <li
              className={clsx(p.id === myPlayerID && styles.isSelf)}
              key={p.id}
            >
              {p.id === myPlayerID ? (
                <input
                  className={styles.PlayerName}
                  onChange={(v) => onNameChange(v.target.value)}
                  placeholder={"You"}
                  type="text"
                  value={p.name}
                />
              ) : (
                <div className={styles.PlayerName}>{p.name}</div>
              )}
              <Toggle
                onChange={() => onPlayerToggle(p.id)}
                value={p.isPlaying}
              />
              {/* <div
                onClick={() => onPlayerToggle(p.id)}
                className={clsx(styles.Toggle, p.isPlaying && styles.ToggleOn)}
              >
                <div className={styles.ToggleKnob}></div>
              </div>*/}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayerSelection;
