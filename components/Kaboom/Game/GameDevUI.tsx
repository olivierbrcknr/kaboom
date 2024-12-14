import React, { useState, useEffect } from "react";

import clsx from "clsx";

const isDev = process.env.NODE_ENV !== "production";

interface GameDevUIProps {
  socket: any;
}

const GameDevUI = ({ socket }: GameDevUIProps) => {
  return (
    <div style={{ zIndex: 9 }}>
      <button onClick={() => socket.emit("endGame")}>End Game</button>
      <button onClick={() => socket.emit("nextTurn")}>Next Turn</button>
      <button onClick={() => socket.emit("endRound")}>End Round</button>
      <button onClick={() => socket.emit("startRound")}>Start Round</button>
    </div>
  );
};

export default GameDevUI;
