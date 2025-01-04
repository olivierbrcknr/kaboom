type CardValue =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | "J"
  | "Q"
  | "K"
  | "A"
  | "X";

type CardActions = "lookAt" | "swap";

type DeckType = "deck" | "graveyard";

type CardPosition = "deck" | "swap" | "graveyard";

type CardHighlightType = "swap" | "drew_deck" | "drew_graveyard" | "lookAt";

type CardColor = 0 | 1 | 2 | 3 | null; // Color null = joker

type CardSlot = { x: number; y: number };

type CardEffect = {
  action: CardActions | undefined;
  cards: HandCard[];
  timer: number;
  needsInteraction: boolean;
};

type PlayerID = string;

type Player = {
  id: PlayerID;
  name: string;
  points: number;
  roundPoints: number[];
  isPlaying: boolean;
};

type Card = {
  id: number;
  color: CardColor;
  value: CardValue;
};

interface HandCard extends Card {
  player: PlayerID;
  slot: CardSlot;
}

type Deck = {
  hand: HandCard[];
  deck: Card[];
  graveyard: Card[];
};

type HighlightCard = {
  id: number | DeckType;
  type: CardHighlightType;
  player: PlayerID;
};

const isHandCard = (value: unknown): value is HandCard => {
  return (
    value !== undefined &&
    typeof value === "object" &&
    (typeof value?.["color"] === "number" || value?.["color"] === null) &&
    typeof value?.["player"] === "string"
  );
};

// TODO: need to add round values
type GameStateType = {
  // players: Player[];
  isRunning: boolean;
  hasEnded: boolean;
  roundCount: number;
  // roundScores: {
  //   player: PlayerID;
  //   score: number;
  // }[][];
};

const gamePhases = ["setup", "running", "last round", "end"] as const;
type GamePhase = (typeof gamePhases)[number];

type RoundStateType = {
  turnCount: number;
  startingPlayer: PlayerID;
  phase: GamePhase;
  lastRoundStartedByPlayer?: PlayerID;
};

const roundPhases = [
  "pre round",
  "draw",
  "card in hand",
  "effect",
  "end",
] as const;
type RoundPhase = (typeof roundPhases)[number];

// type RoundPhase = "draw" | "effect" | "end";

type TurnStateType = {
  currentPlayer: PlayerID;
  phase: RoundPhase;
  playedCard?: Card;
};

export { isHandCard, gamePhases, roundPhases };

export type {
  Player,
  Card,
  HandCard,
  CardPosition,
  CardValue,
  Deck,
  CardColor,
  CardSlot,
  PlayerID,
  CardActions,
  CardEffect,
  CardHighlightType,
  GameStateType,
  RoundStateType,
  RoundPhase,
  TurnStateType,
  DeckType,
  HighlightCard,
  GamePhase,
};
