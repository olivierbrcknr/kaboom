import { useEffect, useState } from "react";

import type {
  Card,
  CardHighlightType,
  CardPosition,
  Deck,
  DeckType,
  GameStateType,
  HandCard,
  HighlightCard,
  Player,
  PlayerID,
  RoundStateType,
  TurnStateType,
} from "../../../kaboom/types";

import { EFFECT_VISIBILITY_DURATION } from "../../../utils/constants";
import { isSocket, useSocket } from "./socket";

export const useGame = () => {
  const [myState, setMyState] = useState<{
    id?: PlayerID;
    name: string;
  }>({
    id: "",
    name: "",
  });

  const [players, setPlayers] = useState<Player[]>([]);

  // overarching game state = multiple rounds
  const [gameState, setGameState] = useState<GameStateType>({
    hasEnded: false,
    // players: [],
    isRunning: false,
    roundCount: 0,
  });

  // round state = multiple turns
  const [roundState, setRoundState] = useState<RoundStateType>({
    lastRoundStartedByPlayer: undefined,
    phase: "setup",
    startingPlayer: "",
    turnCount: 0,
  });

  // turn state
  const [turnState, setTurnState] = useState<TurnStateType>({
    currentPlayer: "",
    phase: "draw",
    playedCard: undefined,
  });

  const [currentDeck, setCurrentDeck] = useState<Deck>();

  const [highlightCards, setHighlightCards] = useState<HighlightCard[]>([]);
  const [displayHighlightCards, setDisplayHighlightCards] = useState<
    HighlightCard[]
  >([]);

  const [selectedCard, setSelectedCard] = useState<Card | undefined>(undefined);

  const socket = useSocket();

  const [canMoveCard, setCanMoveCard] = useState(false);

  useEffect(() => {
    setDisplayHighlightCards(highlightCards);

    // clear display timer
    const timer = setTimeout(() => {
      setDisplayHighlightCards([]);
    }, EFFECT_VISIBILITY_DURATION);

    return () => {
      clearTimeout(timer);
    };
  }, [highlightCards]);

  // socket ———————————————————————————————————————————————

  useEffect(() => {
    if (socket === null) {
      console.log("socket not set up yet");
      return;
    }

    setMyState((ms) => ({
      ...ms,
      id: socket.id,
    }));

    socket.emit("initialSetup");

    socket.on("getPlayers", (data: Player[]) => {
      const myPlayerData = data.find((p) => p.id === socket.id);

      if (!myPlayerData || !socket.id) {
        console.error("could not retrieve my player data");
        return;
      }

      setMyState({
        id: socket.id,
        name: myPlayerData.name,
      });

      setPlayers(data);
    });

    socket.on("getDeck", (data: Deck) => setCurrentDeck(data));
    socket.on("getGameState", (data: GameStateType) => setGameState(data));
    socket.on("getRoundState", (data: RoundStateType) => setRoundState(data));
    socket.on("getTurnState", (data: TurnStateType) => setTurnState(data));
    socket.on("getHighlightCards", (data: HighlightCard[]) =>
      setHighlightCards(data),
    );
    socket.on("getCardInHand", (data: Card | undefined) =>
      setSelectedCard(data),
    );
    socket.on("canMoveCard", () => setCanMoveCard(true));

    return () => {
      socket.off("getPlayers");
      socket.off("getDeck");
      socket.off("getGameState");
      socket.off("getRoundState");
      socket.off("getTurnState");
      socket.off("getHighlightCards");
    };
  }, [socket]);

  // Player Control —————————————————————————————————————————

  const handleChangeName = (v: string) => {
    if (isSocket(socket)) {
      socket.emit("nameChange", v);
    }
  };

  const handlePlayerToggle = (v: PlayerID) => {
    if (isSocket(socket)) {
      socket.emit("playerToggle", v);
    }
  };

  // Game and Round Controls ————————————————————————————————

  // Game
  const handleStartGame = () => {
    console.log("Start Game");
    if (isSocket(socket)) {
      socket.emit("startGame");
    }
  };

  const handleEndGame = () => {
    if (isSocket(socket)) {
      socket.emit("endGame");
    }
  };

  const handleExitGame = () => {
    if (isSocket(socket)) {
      socket.emit("exitGame");
    }
  };

  // Round
  const handleStartRound = () => {
    if (isSocket(socket)) {
      socket.emit("startRound");
    }
  };

  const handlePlayerIsEnding = () => {
    if (myState.id && isSocket(socket)) {
      socket.emit("playerIsEnding", myState.id);
    }
  };

  const handleEndRound = () => {
    if (isSocket(socket)) {
      socket.emit("endRoundByPlayer", myState.id);
    }
  };

  // Turn
  const handleNextTurn = () => {
    if (isSocket(socket)) {
      socket.emit("nextTurn");
    }
  };

  // Card Effects ———————————————————————————————————————————

  const handleDrawCard = (position: DeckType) => {
    if (isSocket(socket)) {
      socket.emit("drawCard", position);
    }

    // if (position === "deck") {
    //   setSelectedCard(currentDeck?.deck[0]);
    // } else {
    //   setSelectedCard(currentDeck?.graveyard[0]);
    // }
  };

  const handleHighlightCard = (
    cards: HandCard[],
    highlight: CardHighlightType,
  ) => {
    if (isSocket(socket)) {
      socket.emit("highlightCard", cards, highlight);
    }
  };

  const handleCardPlayed = (card: HandCard) => {
    if (isSocket(socket)) {
      socket.emit("cardPlayed", card);
    }
  };

  const handleCardSwop = (
    position: CardPosition,
    card: HandCard,
    secondCard?: Card | HandCard,
  ) => {
    if (isSocket(socket)) {
      switch (position) {
        // swopped with deck
        case "deck":
          socket.emit("cardSwoppedFromDeck", card);
          break;
        // swopped with graveyard
        case "graveyard":
          socket.emit("cardSwoppedFromGraveyard", card);
          break;
        // select to swap
        case "swap":
          socket.emit("cardShiftedToPlayer", card, secondCard);
          break;
      }
    }
  };

  const handleSwopCardsBetweenPlayers = (card1: HandCard, card2: HandCard) => {
    if (isSocket(socket)) {
      socket.emit("cardSwoppedBetweenPlayers", [card1, card2]);
    }
  };

  const handleCardFromDeckToGraveyard = () => {
    if (isSocket(socket)) {
      socket.emit("cardFromDeckToGraveyard");
    }
  };

  // card clicks ————————————————————————————————————————————————

  const handlePlayerCardClick = (card: HandCard) => {
    setCanMoveCard(false);
    if (isSocket(socket)) {
      socket.emit("playerCardClick", card);
    }
  };

  const handleDeckClick = (type: DeckType) => {
    switch (turnState.phase) {
      case "card in hand":
        // if is "card in hand" phase
        // and click is graveyard
        if (type === "graveyard") {
          if (isSocket(socket)) {
            socket.emit("handCardToGraveyard");
          }
        }
        break;

      case "draw":
        // if is "draw" phase
        if (type === "deck") {
          handleDrawCard("deck");
        } else {
          // graveyard
          handleDrawCard("graveyard");
        }
        break;

      default:
        // else --> do nothing
        break;
    }
  };

  return {
    canMoveCard,
    currentDeck,
    displayHighlightCards,
    gameState,
    handleCardFromDeckToGraveyard,
    handleCardPlayed,
    handleCardSwop,
    handleChangeName,
    handleDeckClick,
    handleDrawCard,
    handleEndGame,
    handleEndRound,
    handleExitGame,
    handleHighlightCard,
    handleNextTurn,
    handlePlayerCardClick,
    handlePlayerIsEnding,
    handlePlayerToggle,
    handleStartGame,
    handleStartRound,
    handleSwopCardsBetweenPlayers,
    highlightCards,
    myState,
    players,
    roundState,
    selectedCard,
    setSelectedCard,
    socket,
    turnState,
  };
};
