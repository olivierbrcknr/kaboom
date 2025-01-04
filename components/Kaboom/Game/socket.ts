import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// import { useIsDev } from "../../../utils";

const PORT = process.env.PORT || 3000;

// const isDev = useIsDev();

// let socketURL = "https://kaboom-game.herokuapp.com/";
// if (dev) {
const socketURL = "http://localhost:" + PORT;
// }

export const useSocket = () => {
  const [socket, setSocket] = useState<null | Socket>(null);

  useEffect(() => {
    const socketIo = io(socketURL);

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("connected to the Kaboom Server", socketURL);
    });

    const cleanup = () => {
      // socketIo.off("connect");
      socketIo.disconnect();
    };
    return cleanup;
  }, []);

  return socket;
};

export const isSocket = (v: unknown): v is Socket => {
  return v !== null;
};
