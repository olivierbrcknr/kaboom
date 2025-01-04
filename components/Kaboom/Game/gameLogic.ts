import { useState, useEffect } from "react";

import type {
  Player,
  FocusCard,
  Deck,
  DeckType,
  Card,
  HandCard,
  PlayerID,
  CardPosition,
  CardHighlightType,
  GameStateType,
  RoundStateType,
  TurnStateType,
  HighlightCard,
} from "../../../kaboom/types";

import { useSocket, isSocket } from "./socket";

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
    // players: [],
    isRunning: false,
    hasEnded: false,
    roundCount: 0,
  });

  // round state = multiple turns
  const [roundState, setRoundState] = useState<RoundStateType>({
    isRunning: false,
    turnCount: 0,
    startingPlayer: "",
    isLastRound: false,
    lastRoundStartedByPlayer: undefined,
  });

  // turn state
  const [turnState, setTurnState] = useState<TurnStateType>({
    currentPlayer: "",
    phase: "draw",
    playedCard: undefined,
  });

  const [currentDeck, setCurrentDeck] = useState<Deck>();

  const [playEffect, setPlayEffect] = useState(false);

  const [highlightDeck, setHighlightDeck] = useState<CardPosition | undefined>(
    undefined,
  );

  const [highlightCards, setHighlightCards] = useState<HighlightCard[]>([]);

  const [selectedCard, setSelectedCard] = useState<Card | undefined>(undefined);

  const socket = useSocket();

  const [canMoveCard, setCanMoveCard] = useState(false);

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

  /*
  useEffect(() => {
    // hide highlight after 2sec
    if (highlightCards.cards.length > 0) {
      setTimeout(() => {
        setHighlightCards({
          cards: [],
          type: undefined,
        });

        setHighlightDeck(undefined);
      }, 2000);
    }
  }, [highlightCards]);
  */

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
    isSocket(socket) && socket.emit("startGame");
  };

  const handleEndGame = () => {
    isSocket(socket) && socket.emit("endGame");
  };

  const handleExitGame = () => {
    isSocket(socket) && socket.emit("exitGame");
  };

  // Round
  const handleStartRound = () => {
    isSocket(socket) && socket.emit("startRound");
  };

  const handlePlayerIsEnding = () => {
    isSocket(socket) && myState.id && socket.emit("playerIsEnding", myState.id);
  };

  const handleEndRound = () => {
    isSocket(socket) && socket.emit("endRoundByPlayer", myState.id);
  };

  // Turn
  const handleNextTurn = () => {
    isSocket(socket) && socket.emit("nextTurn");
  };

  // const handleEffect = (action: CardActions) => {
  //   switch (action) {
  //     case "lookAt":
  //       break;
  //     case "swop":
  //       break;
  //     case "lookAtKing":
  //       break;
  //     case "initialBottomRow":
  //       break;
  //     case "endRound":
  //       break;
  //     default:
  //       const exhaustiveCheck: never = action;
  //       throw new Error(`Board has no firmata: ${exhaustiveCheck}`);
  //       break;
  //   }
  // };

  // Card Effects ———————————————————————————————————————————

  const handleDrawCard = (position: DeckType) => {
    isSocket(socket) && socket.emit("drawCard", position);

    // if (position === "deck") {
    //   setSelectedCard(currentDeck?.deck[0]);
    // } else {
    //   setSelectedCard(currentDeck?.graveyard[0]);
    // }
  };

  const handleEndEffect = () => {
    setPlayEffect(false);
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
    secondCard?: HandCard | Card,
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
        // select to swop
        case "swop":
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
    isSocket(socket) && socket.emit("playerCardClick", card);
  };

  const handleDeckClick = (type: DeckType) => {
    switch (turnState.phase) {
      case "draw":
        // if is "draw" phase
        // ################################
        if (type === "deck") {
          handleDrawCard("deck");
        } else {
          // graveyard
          handleDrawCard("graveyard");
        }
        break;

      case "card in hand":
        // if is "card in hand" phase
        // and click is graveyard
        if (type === "graveyard") {
          isSocket(socket) && socket.emit("handCardToGraveyard");
        }
        break;

      default:
        // else --> do nothing
        // ################################
        break;
    }
  };

  return {
    myState,
    gameState,
    handleSwopCardsBetweenPlayers,
    handleCardFromDeckToGraveyard,
    handleCardSwop,
    handleEndEffect,
    handleHighlightCard,
    handleCardPlayed,
    handleChangeName,
    handlePlayerToggle,
    handleStartGame,
    handleEndGame,
    handlePlayerIsEnding,
    handleEndRound,
    handleStartRound,
    handleDrawCard,
    handleNextTurn,
    roundState,
    playEffect,
    highlightDeck,
    selectedCard,
    currentDeck,
    highlightCards,
    setSelectedCard,
    socket,
    turnState,
    players,
    handleExitGame,
    handleDeckClick,
    handlePlayerCardClick,
    canMoveCard,
  };
};
