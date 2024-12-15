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

type CardActions =
  | "lookAt"
  | "swop"
  | "lookAtKing"
  | "initialBottomRow"
  | "endRound";

type CardPosition = "deck" | "swop" | "graveyard"; // | null;

type CardHighlightType = "swop" | "drew" | "lookAt";

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

interface FocusCard extends Card {
  position?: CardPosition;
  slot?: CardSlot;
}

interface HandCard extends Card {
  player: PlayerID;
  slot: CardSlot;
}

type Deck = {
  hand: HandCard[];
  deck: Card[];
  graveyard: Card[];
};

const isHandCard = (value: any): value is HandCard => {
  return (
    value &&
    typeof value === "object" &&
    (typeof value.color === "number" || value.color === null) &&
    typeof value.player === "string"
  );
};

export { isHandCard };

export type {
  Player,
  Card,
  HandCard,
  FocusCard,
  CardPosition,
  CardValue,
  Deck,
  CardColor,
  CardSlot,
  PlayerID,
  CardActions,
  CardEffect,
  CardHighlightType,
};
