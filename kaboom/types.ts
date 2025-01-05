type Card = {
  color: CardColor;
  id: number;
  value: CardValue;
};

type CardActions = "lookAt" | "swap";

type CardColor = 0 | 1 | 2 | 3 | null; // Color null = joker

type CardEffect = {
  action: CardActions | undefined;
  cards: HandCard[];
  needsInteraction: boolean;
  timer: number;
};

type CardHighlightType =
  | "drew_deck"
  | "drew_graveyard"
  | "lookAt"
  | "selected"
  | "swap";

type CardPosition = "deck" | "graveyard" | "swap";

type CardSlot = { x: number; y: number };

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
  | "A"
  | "J"
  | "K"
  | "Q"
  | "X";

type Deck = {
  deck: Card[];
  graveyard: Card[];
  hand: HandCard[];
};

type DeckType = "deck" | "graveyard";

interface HandCard extends Card {
  player: PlayerID;
  slot: CardSlot;
}

type HighlightCard = {
  id: DeckType | number;
  player: PlayerID;
  type: CardHighlightType;
};

type Player = {
  id: PlayerID;
  isPlaying: boolean;
  name: string;
  points: number;
  roundPoints: number[];
};

type PlayerID = string;

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
  hasEnded: boolean;
  // players: Player[];
  isRunning: boolean;
  roundCount: number;
  // roundScores: {
  //   player: PlayerID;
  //   score: number;
  // }[][];
};

const gamePhases = ["setup", "running", "last round", "end"] as const;
type GamePhase = (typeof gamePhases)[number];

type RoundStateType = {
  lastRoundStartedByPlayer?: PlayerID;
  phase: GamePhase;
  startingPlayer: PlayerID;
  turnCount: number;
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

export { gamePhases, isHandCard, roundPhases };

export type {
  Card,
  CardActions,
  CardColor,
  CardEffect,
  CardHighlightType,
  CardPosition,
  CardSlot,
  CardValue,
  Deck,
  DeckType,
  GamePhase,
  GameStateType,
  HandCard,
  HighlightCard,
  Player,
  PlayerID,
  RoundPhase,
  RoundStateType,
  TurnStateType,
};
