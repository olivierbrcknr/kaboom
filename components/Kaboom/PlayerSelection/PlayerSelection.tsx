import React from "react";

import styles from "./PlayerSelection.module.scss";

const PlayerSelection = (props) => {
  const classes = [styles.PlayerSelection];
  classes.push(props.className);

  const list = props.players.map((p, k) => {
    const playerClasses: string[] = [];

    let playerName = <div className={styles.PlayerName}>{p.name}</div>;

    if (p.id === props.isID) {
      playerClasses.push(styles.isSelf);

      playerName = (
        <input
          type="text"
          onChange={(v) => props.onNameChange(v.target.value)}
          className={styles.PlayerName}
          placeholder={"You"}
          value={p.name}
        />
      );
    }

    const toggleClasses = [styles.Toggle];

    if (p.isPlaying) {
      toggleClasses.push(styles.ToggleOn);
    }

    const isPlayingToggle = (
      <div
        onClick={() => props.onPlayerToggle(p.id)}
        className={toggleClasses.join(" ")}
      >
        <div className={styles.ToggleKnob}></div>
      </div>
    );

    return (
      <li className={playerClasses.join(" ")} key={p.id}>
        {playerName}
        {isPlayingToggle}
      </li>
    );
  });

  return (
    <div className={classes.join(" ")}>
      <ul>{list}</ul>
    </div>
  );
};

export default PlayerSelection;
