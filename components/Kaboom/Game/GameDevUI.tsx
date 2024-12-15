import React, { useState, useEffect } from "react";

import clsx from "clsx";

import Button from "../../Button";

const isDev = process.env.NODE_ENV !== "production";

interface GameDevUIProps {
  socket: any;
}

const GameDevUI = ({ socket }: GameDevUIProps) => {
  return (
    <div style={{ zIndex: 9 }}>
      <Button onClick={() => socket.emit("endGame")}>End Game</Button>
      <Button onClick={() => socket.emit("nextTurn")}>Next Turn</Button>
      <Button onClick={() => socket.emit("endRound")}>End Round</Button>
      <Button onClick={() => socket.emit("startRound")}>Start Round</Button>
    </div>
  );
};

export default GameDevUI;
