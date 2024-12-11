import React from "react";

import styles from "./DisplayPlayers.module.scss";

const DisplayPlayers = (props) => {
  const classes = [styles.DisplayPlayers];
  classes.push(props.className);

  const list = props.players.map((p, k) => {
    if (!p.isPlaying) {
      return null;
    }

    const playerClasses: string[] = [];

    if (p.id === props.currentPlayer && props.gameIsRunning) {
      playerClasses.push(styles.isCurrent);
    }

    const playerName = <div className={styles.PlayerName}>{p.name}</div>;

    const pointDisplay = (
      <div className={styles.PlayerTotalPointDisplay}>[{p.points}]</div>
    );

    const roundPoints = p.roundPoints.map((point, i) => {
      return <li key={"roundPoint-" + p.id + "-" + i}>{point}</li>;
    });

    if (p.id === props.isID) {
      playerClasses.push(styles.isSelf);
    }

    const roundPointDisplay = (
      <ul className={styles.RoundPointDisplay}>{roundPoints}</ul>
    );

    return (
      <li className={playerClasses.join(" ")} key={p.id}>
        {playerName} {roundPointDisplay} {pointDisplay}
      </li>
    );
  });

  return (
    <div className={classes.join(" ")}>
      <ul>{list}</ul>
    </div>
  );
};

export default DisplayPlayers;
