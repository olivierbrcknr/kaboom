import { useState, useEffect } from "react";

import type {
  Player,
  FocusCard,
  Deck as DeckType,
  Card as CardType,
  HandCard,
  PlayerID,
  CardPosition,
  CardHighlightType,
  GameStateType,
  RoundStateType,
  TurnStateType,
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

  // round state
  const [roundState, setRoundState] = useState<RoundStateType>({
    isRunning: false,
    turnCount: 0,
    startingPlayer: "",
    isLastRound: false,
    lastRoundStartedByPlayer: undefined,
  });

  const [turnState, setTurnState] = useState<TurnStateType>({
    currentPlayer: "",
    phase: "draw",
    playedCard: undefined,
  });

  const [currentDeck, setCurrentDeck] = useState<DeckType>();

  const [playEffect, setPlayEffect] = useState(false);

  const [highlightDeck, setHighlightDeck] = useState<CardPosition | undefined>(
    undefined,
  );

  const [highlightCards, setHighlightCards] = useState<{
    cards: HandCard[];
    type?: CardHighlightType;
  }>({
    cards: [],
    type: undefined,
  });

  const [selectedCard, setSelectedCard] = useState<FocusCard | undefined>(
    undefined,
  );

  const socket = useSocket();

  // socket ———————————————————————————————————————————————

  useEffect(() => {
    if (socket === null) {
      console.log("socket not set up");
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

      // setGameState((gs) => ({
      //   ...gs,
      //   players: data,
      // }));

      setPlayers(data);
    });

    socket.on("getDeck", (data: DeckType) => setCurrentDeck(data));
    socket.on("getGameState", (data: GameStateType) => setGameState(data));
    socket.on("getRoundState", (data: RoundStateType) => setRoundState(data));
    socket.on("getTurnState", (data: TurnStateType) => setTurnState(data));

    return () => {
      socket.off("getPlayers");
      socket.off("getDeck");
      socket.off("getGameState");
      socket.off("getRoundState");
      socket.off("getTurnState");
    };
  }, [socket]);

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

  // not needed anymore?
  const handlePlayerIsEnding = () => {
    if (isSocket(socket) && myState.id) {
      socket.emit("playerIsEnding", myState.id);
    }
  };

  const handleEndRound = () => {
    if (isSocket(socket)) {
      socket.emit("endRound", myState.id);
    }
  };

  const handleStartRound = () => {
    if (isSocket(socket)) {
      socket.emit("startRound");
    }
  };

  const handleDrawCard = (position: CardPosition) => {
    if (isSocket(socket)) {
      socket.emit("drawCard", position);
    }
  };

  const handleNextTurn = () => {
    if (isSocket(socket)) {
      socket.emit("nextTurn");
    }
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
    secondCard?: HandCard | CardType,
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

  // rules ————————————————————————————————————————————————
  // end automatically if no more cards on hand
  useEffect(() => {
    if (!currentDeck) {
      console.log("no deck yet");
      return;
    }

    // TODO: Check if still relevant to do this complicated
    let cardsOnHand = 0;
    for (let i = 0; i < currentDeck.hand.length; i++) {
      if (currentDeck.hand[i].player === myState.id) {
        cardsOnHand++;
      }
    }
    // console.log('I have '+cardsOnHand+' on my hand')
    if (cardsOnHand === 0) {
      handlePlayerIsEnding();
    }
  }, [myState.id, currentDeck?.hand]);
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
  };
};
