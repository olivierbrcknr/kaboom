import { Socket } from "socket.io-client";

import Button from "../../Button";

// const isDev = process.env.NODE_ENV !== "production";

interface GameDevUIProps {
  socket: Socket | null;
}

import styles from "./Game.module.scss";

const GameDevUI = ({ socket }: GameDevUIProps) => {
  if (socket === null) return null;

  return (
    <div className={styles.DevUI}>
      <Button onClick={() => socket.emit("endGame")}>End Game</Button>
      <Button onClick={() => socket.emit("nextTurn")}>Next Turn</Button>
      <Button onClick={() => socket.emit("endRound")}>End Round</Button>
      <Button onClick={() => socket.emit("startRound")}>Start Round</Button>
    </div>
  );
};

export default GameDevUI;
