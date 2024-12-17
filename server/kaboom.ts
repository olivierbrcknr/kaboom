import { color } from "console-log-colors";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

import { cardRules, type CardRule } from "../kaboom/ruleHelpers";
import type {
  PlayerID,
  Player,
  Card,
  HandCard,
  CardPosition,
  CardHighlightType,
  GameStateType,
  RoundStateType,
  TurnStateType,
  Deck,
  HighlightCard,
} from "../kaboom/types";

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
} from "../kaboom/kaboomRules";

import { isDev } from "../utils";

import { createDefault, distribute, getNextPlayer } from "./deckFunctions";

const dev = isDev();
const PORT = process.env.PORT || 3000;

// all Players
let players: Player[] = [];

let deck: Deck;

const gameStateInit: GameStateType = {
  // players: [],
  isRunning: false,
  hasEnded: false,
  roundCount: 0,
  // roundScores: [],
};

let gameState: GameStateType = { ...gameStateInit };

const roundStateInit: RoundStateType = {
  isRunning: true,
  turnCount: 0,
  startingPlayer: "",
  isLastRound: false,
  lastRoundStartedByPlayer: undefined,
};

let roundState: RoundStateType = { ...roundStateInit };

const turnStateInit: TurnStateType = {
  currentPlayer: "",
  phase: "draw",
  playedCard: undefined,
};

let turnState: TurnStateType = { ...turnStateInit };

/** the cards that should be highlighted */
let highlightCards: HighlightCard[] = [];

/** The ID of the player who's card was played last */
let lastFiredCardStack: PlayerID | false = false;

// Helper Functions ———————————————————————————————————————
const getCardRule = (card: Card): CardRule | false => {
  const rule = cardRules.find((cR) => cR.cardValue.includes(card.value));
  return rule ? rule : false;
};

// Server setup ———————————————————————————————————————————

const app: Express = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer);
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  console.log(`🧘‍♀️ Server is waiting`);

  app.get("*", (req: Request, res: Response) => {
    return nextHandler(req, res);
  });

  httpServer.listen(PORT, () => {
    console.log("Ready on ", PORT);
  });
});

// socket.io server
io.on("connection", (socket) => {
  // Turn Functions —————————————————————————————————————————
  // const initPhaseDrawCard = () => {
  // const nextPlayer = getNextPlayer(players, turnState.currentPlayer);
  // turnState = { ...turnStateInit, currentPlayer: nextPlayer };
  // };

  const initPhaseCardInHand = () => {
    turnState.phase = "card in hand";
    sendTurnState();

    // wait for click
  };

  const initPhaseEffect = () => {
    turnState.phase = "effect";

    // check if effect
    const hasEffect =
      turnState.playedCard && getCardRule(turnState.playedCard) !== false;

    if (hasEffect) {
      sendTurnState();

      // wait for effect being executed
    } else {
      nextPhase();
    }
  };

  const initPhaseEnd = () => {
    turnState.phase = "end";
    sendTurnState();

    // send highlight for cards where an effect has been applied
    sendHighlightCards();

    // check if round is done
    const isEndRound = checkIfPlayerHasZeroCards(players, deck);

    if (isEndRound) {
      // end round because player has zero cards
      endRound(false, turnState.currentPlayer);
      return;
    }

    // send round state
    roundState.turnCount += 1;
    sendRoundState();

    // next round
    nextPhase();
  };

  const nextPhase = () => {
    const currentPhase = turnState.phase;

    switch (currentPhase) {
      case "draw":
        initPhaseCardInHand();
        break;
      case "card in hand":
        initPhaseEffect();
        break;
      case "effect":
        initPhaseEnd();
        break;
      case "end":
        // initPhaseDrawCard();
        initTurn();
        break;
      default:
        const exhaustiveCheck: never = currentPhase;
        throw new Error(`Not every phase is accounted for`);
        break;
    }
  };

  /** The beginning of a turn. Also the beginngin of the "draw" phase. */
  const initTurn = () => {
    // set turn to init
    let nextPlayer = getNextPlayer(players, turnState.currentPlayer);
    if (roundState.turnCount === 0) {
      nextPlayer = roundState.startingPlayer;
    }
    turnState = { ...turnStateInit, currentPlayer: nextPlayer };

    // empty highlight cards
    highlightCards = [];

    sendTurnState();

    // waiting for card to be drawn
    // nextPhase();
  };

  // Round Functions ————————————————————————————————————————

  const initRound = () => {
    // get new starting player
    const newStartingPlayer = getNextPlayer(players, roundState.startingPlayer);

    // set rounds to init
    roundState = { ...roundStateInit, startingPlayer: newStartingPlayer };
    gameState.roundCount += 1;

    // generate new deck
    deck = createDefault();
    deck = distribute(deck, players);
    console.log("deck distributed");

    // send states
    sendDeck();
    sendGameState();
    sendRoundState();

    // init the actual turn
    initTurn();
  };

  const endRound = (endingByChoice = false, endingPlayerID?: PlayerID) => {
    // end round state
    roundState = { ...roundState, isRunning: false };
    sendRoundState();

    // store round data in game state
    const endingPlayer = endingPlayerID ?? turnState.currentPlayer;
    players = calcPlayerPoints(players, deck, endingPlayer, endingByChoice);
    sendPlayers();

    // check if game has ended
    const gameHasEnded = calcIfEnded(players);

    if (gameHasEnded) {
      endGame();
    } else {
      // do nothing, round starts manually
    }
  };

  // Game Functions —————————————————————————————————————————

  const initGame = () => {
    // get all players and reset their points
    players = players.map((p) => {
      return {
        ...p,
        points: 0,
        roundPoints: [],
      };
    });

    // set game to init
    gameState = { ...gameStateInit, isRunning: true };

    // send game state update
    sendPlayers();
    sendGameState();

    // init the actual round
    initRound();
  };

  const endGame = () => {
    // get game results
    gameState.isRunning = false;
    gameState.hasEnded = true;

    // send state to show final screen
    sendGameState();
  };

  const exitGame = () => {
    gameState = { ...gameStateInit };
    sendGameState();
  };

  // Events —————————————————————————————————————————————————

  const handleDrawCard = () => {};

  const handlePlayerIsEnding = (pID: PlayerID) => {
    endRound(true, pID);
  };

  const handleStartGame = () => {
    initGame();
  };

  const handlePlayerNameChange = (newName: string) => {
    const relID = players.findIndex((p) => p.id === socket.id);
    players[relID].name = newName;

    sendPlayers();
  };

  const handlePlayerToggle = (pID: PlayerID) => {
    const pIndex = players.findIndex((p) => p.id === pID);
    const playingCount = players.filter((p) => p.isPlaying).length;
    const newVal = !players[pIndex].isPlaying;

    // if more playing than allowed && the new index is true
    if (playingCount >= 4 && newVal) {
      let spaceIsMade = false;
      for (let i = 0; i < players.length; i++) {
        if (players[i].isPlaying && !spaceIsMade) {
          players[i].isPlaying = false;
          spaceIsMade = true;
        }
      }
    }

    players[pIndex].isPlaying = newVal;

    sendPlayers();
  };

  const handleDisconnect = () => {
    const closedSocketIndex = players.findIndex((p) => p.id === socket.id);
    const closedPlayer = players[closedSocketIndex];

    console.log(color.red(`⭕️ ${closedPlayer.name} disconnected`));

    if (closedSocketIndex > -1) {
      players.splice(closedSocketIndex, 1);
    }

    // end game --> start UI if noone is left
    if (players.length <= 0) {
      gameState = { ...gameStateInit };
      roundState = { ...roundStateInit };
      turnState = { ...turnStateInit };
    }

    // only send to all but sender, because sender does not exist anymore
    sendPlayers(true);
  };

  // Events send ————————————————————————————————————————————

  const sendPlayers = (notToSelf = false) => {
    !notToSelf && socket.emit("getPlayers", players);
    socket.broadcast.emit("getPlayers", players);
  };
  const sendDeck = (notToSelf = false) => {
    !notToSelf && socket.emit("getDeck", deck);
    socket.broadcast.emit("getDeck", deck);
  };
  const sendGameState = (notToSelf = false) => {
    !notToSelf && socket.emit("getGameState", gameState);
    socket.broadcast.emit("getGameState", gameState);
  };
  const sendRoundState = (notToSelf = false) => {
    !notToSelf && socket.emit("getRoundState", roundState);
    socket.broadcast.emit("getRoundState", roundState);
  };
  const sendTurnState = (notToSelf = false) => {
    !notToSelf && socket.emit("getTurnState", turnState);
    socket.broadcast.emit("getTurnState", turnState);
  };
  const sendHighlightCards = (notToSelf = false) => {
    !notToSelf && socket.emit("getHighlightCards", highlightCards);
    socket.broadcast.emit("getHighlightCards", highlightCards);
  };

  // Actual Event Listeners —————————————————————————————————
  socket.on("disconnect", handleDisconnect);

  socket.on("nameChange", handlePlayerNameChange);
  socket.on("playerToggle", handlePlayerToggle);

  socket.on("startGame", initGame);
  socket.on("endGame", endGame);
  socket.on("exitGame", exitGame);

  socket.on("startRound", initRound);
  socket.on("endRound", endRound);
  socket.on("endRoundByPlayer", handlePlayerIsEnding);

  // events

  // only dev
  socket.on("nextTurn", initPhaseEnd);

  // Socket setup ———————————————————————————————————————————
  console.log(color.green(`🔌 New client connected`));

  players.push({
    id: socket.id,
    isPlaying: false,
    name: "Player " + players.length,
    points: 0,
    roundPoints: [],
  });

  if (players.length <= 4 && !gameState.isRunning) {
    players[players.length - 1].isPlaying = true;
  }

  sendPlayers();
});
