import { color } from "console-log-colors";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

import type {
  PlayerID,
  Player,
  Card,
  HandCard,
  CardPosition,
  CardHighlightType,
} from "../types";

import { createDefault, distribute, checkNextPlayer } from "./deckFunctions";
import {
  checkIfPlayable,
  swopCardFromDeck,
  swopCardFromGraveyard,
  cardFromDeckToGraveyard,
  cardShiftedToPlayer,
  calcPlayerPoints,
  cardSwoppedBetweenPlayers,
  calcIfEnded,
  checkIfPlayerHasZeroCards,
} from "./kaboomRules";

const app: Express = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer);

const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

// generate deck
let deck = createDefault();

// players
let players: Player[] = [];

// gameIsRunning
let gameIsRunning = false;
let roundCount = 0;
let roundIsRunning = false;
let currentPlayer = 0;
let lastStartingPlayer = 0;
let endingPlayer: PlayerID | false = false;
let endingByChoice = false;
let lastFiredCardStack: PlayerID | false = false;

// socket.io server
io.on("connection", (socket) => {
  console.log(color.green(`🔌 New client connected`));

  // add new player
  players.push({
    id: socket.id,
    isPlaying: false,
    name: "Player " + players.length,
    points: 0,
    roundPoints: [],
  });

  if (players.length <= 4 && !gameIsRunning) {
    players[players.length - 1].isPlaying = true;
  }

  // show everyone who playes
  socket.broadcast.emit("playersUpdated", players);

  socket.on("disconnect", () => {
    const closedSocketIndex = players.findIndex((p) => p.id === socket.id);

    const closedPlayer = players[closedSocketIndex];

    console.log(color.red(`⭕️ ${closedPlayer.name} disconnected`));

    if (closedSocketIndex > -1) {
      players.splice(closedSocketIndex, 1);
    }

    // end game --> start UI if noone is left
    if (players.length <= 0) {
      gameIsRunning = false;
      roundIsRunning = false;
      roundCount = 0;
      currentPlayer = 0;
      lastStartingPlayer = 0;
      endingByChoice = false;
      endingPlayer = false;
    }

    // only send to all but sender, because sender does not exist anymore
    socket.broadcast.emit("playersUpdated", players);
  });

  socket.on("nameChange", (newName: string) => {
    const relID = players.findIndex((p) => p.id === socket.id);
    players[relID].name = newName;

    socket.emit("playersUpdated", players);
    socket.broadcast.emit("playersUpdated", players);
  });

  socket.on("playerToggle", (pID: PlayerID) => {
    const pIndex = players.findIndex((p) => p.id === pID);

    let arePlaying = 0;

    // check how many are currently playing
    for (let i = 0; i < players.length; i++) {
      if (players[i].isPlaying) {
        arePlaying++;
      }
    }

    const newVal = !players[pIndex].isPlaying;

    // if more playing than allowed && the new index is true
    if (arePlaying >= 4 && newVal) {
      let spaceIsMade = false;
      for (let i = 0; i < players.length; i++) {
        if (players[i].isPlaying && !spaceIsMade) {
          players[i].isPlaying = false;
          spaceIsMade = true;
        }
      }
    }

    players[pIndex].isPlaying = newVal;

    socket.emit("playersUpdated", players);
    socket.broadcast.emit("playersUpdated", players);
  });

  socket.on("initialSetup", () => {
    const thisSIndex = players.findIndex((p) => p.id === socket.id);
    const playerName = players[thisSIndex].name;

    console.log("inital setup sent to " + playerName);

    socket.emit("getDeck", deck);
    socket.emit("gameIsRunningUpdate", gameIsRunning);
    socket.emit("playersUpdated", players);
    socket.emit("roundUpdate", roundCount, roundIsRunning);
  });

  // Card fns —————————————————————————————————————————————

  socket.on("drawCard", (type: CardPosition) => {
    lastFiredCardStack = false;
    socket.broadcast.emit("highlightDeck", type);
  });

  socket.on("cardPlayed", (card: HandCard) => {
    const callBack = (targetCard: HandCard) => {
      socket.emit("selectCardToSwop", targetCard);
    };

    const playable = checkIfPlayable(
      deck,
      card,
      socket.id,
      lastFiredCardStack,
      callBack,
    );

    // if was able to fire, not a penalty card
    if (playable.bool) {
      lastFiredCardStack = card.player;
    }

    deck = playable.deck;

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);
  });

  socket.on("cardSwoppedFromDeck", (card: HandCard) => {
    const nextCard = deck.deck[0];
    deck = swopCardFromDeck(deck, card);

    socket.broadcast.emit("highlightSwop", [nextCard], "drew");

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);
  });

  socket.on("cardSwoppedFromGraveyard", (card: Card) => {
    const currentCard = deck.graveyard[deck.graveyard.length - 1];
    deck = swopCardFromGraveyard(deck, card);

    socket.broadcast.emit("highlightSwop", [currentCard], "drew");

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);
  });

  socket.on("cardSwoppedBetweenPlayers", (cards: HandCard[]) => {
    deck = cardSwoppedBetweenPlayers(deck, cards);

    socket.broadcast.emit("highlightSwop", cards, "swop");

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);
  });

  socket.on("cardShiftedToPlayer", (card: Card, oldCard: HandCard) => {
    deck = cardShiftedToPlayer(deck, card, oldCard);

    socket.broadcast.emit("highlightSwop", [card], "swop");

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);
  });

  socket.on("cardFromDeckToGraveyard", () => {
    deck = cardFromDeckToGraveyard(deck);

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);

    socket.emit("playEffect");
    // socket.broadcast.emit('playEffect');
  });

  socket.on("highlightCard", (cards: Card[], type: CardHighlightType) => {
    socket.broadcast.emit("highlightSwop", cards, type);
  });

  // Game fns —————————————————————————————————————————————

  socket.on("startGame", () => {
    gameIsRunning = true;
    roundCount = 0;
    endingPlayer = false;
    endingByChoice = false;

    players = players.map((p) => {
      return {
        ...p,
        points: 0,
        roundPoints: [],
      };
    });

    deck = createDefault();

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);

    socket.emit("gameIsRunningUpdate", gameIsRunning);
    socket.broadcast.emit("gameIsRunningUpdate", gameIsRunning);

    socket.emit("playersUpdated", players);
    socket.broadcast.emit("playersUpdated", players);

    socket.emit("currentPlayer", players[currentPlayer].id);
    socket.broadcast.emit("currentPlayer", players[currentPlayer].id);

    socket.emit("endingPlayerID", endingPlayer);
    socket.broadcast.emit("endingPlayerID", endingPlayer);
  });

  socket.on("endGame", () => {
    gameIsRunning = false;
    roundIsRunning = false;
    roundCount = 0;

    socket.emit("roundUpdate", roundCount, roundIsRunning);
    socket.broadcast.emit("roundUpdate", roundCount, roundIsRunning);

    socket.emit("gameIsRunningUpdate", gameIsRunning);
    socket.broadcast.emit("gameIsRunningUpdate", gameIsRunning);
  });

  socket.on("startRound", () => {
    roundIsRunning = true;
    endingPlayer = false;
    endingByChoice = false;
    lastFiredCardStack = false;

    deck = createDefault();
    deck = distribute(deck, players);
    console.log("deck distributed");

    socket.emit("roundUpdate", roundCount, roundIsRunning);
    socket.broadcast.emit("roundUpdate", roundCount, roundIsRunning);

    socket.emit("currentPlayer", players[currentPlayer].id);
    socket.broadcast.emit("currentPlayer", players[currentPlayer].id);

    socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);

    socket.emit("endingPlayerID", endingPlayer);
    socket.broadcast.emit("endingPlayerID", endingPlayer);
  });

  const roundHasEnded = (socket) => {
    if (endingPlayer === false) {
      console.error("something went wrong with the ending player");
      return;
    }

    roundIsRunning = false;
    roundCount++;

    currentPlayer = checkNextPlayer(players, lastStartingPlayer);
    lastStartingPlayer = currentPlayer;

    // calculate points
    players = calcPlayerPoints(players, deck, endingPlayer, endingByChoice);

    const gameHasEnded = calcIfEnded(players);

    socket.emit("roundUpdate", roundCount, roundIsRunning);
    socket.broadcast.emit("roundUpdate", roundCount, roundIsRunning);

    socket.emit("playersUpdated", players);
    socket.broadcast.emit("playersUpdated", players);

    if (gameHasEnded) {
      socket.emit("gameHasEnded");
      socket.broadcast.emit("gameHasEnded");
    }
  };

  socket.on("endRound", () => {
    roundHasEnded(socket);
  });

  socket.on("playerIsEnding", (pID: PlayerID) => {
    endingByChoice = true;
    endingPlayer = pID;

    socket.emit("endingPlayerID", endingPlayer);
    socket.broadcast.emit("endingPlayerID", endingPlayer);
  });

  socket.on("nextTurn", () => {
    currentPlayer = checkNextPlayer(players, currentPlayer);

    if (!endingPlayer) {
      endingPlayer = checkIfPlayerHasZeroCards(players, deck);
      socket.emit("endingPlayerID", endingPlayer);
      socket.broadcast.emit("endingPlayerID", endingPlayer);
    }

    if (endingPlayer === players[currentPlayer].id) {
      roundHasEnded(socket);
    } else {
      socket.emit("currentPlayer", players[currentPlayer].id);
      socket.broadcast.emit("currentPlayer", players[currentPlayer].id);
    }
  });
});

nextApp.prepare().then(() => {
  console.log(`🧘‍♀️ Server is waiting`);

  app.get("*", (req: Request, res: Response) => {
    return nextHandler(req, res);
  });

  httpServer.listen(PORT, () => {
    // if (err) throw err;
    console.log("> Ready on ", PORT);
  });
});
