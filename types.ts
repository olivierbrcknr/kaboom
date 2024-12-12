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

type CardActions = "lookAt";

type CardPosition = "deck" | "swop" | "graveyard" | null;

type CardColor = 0 | 1 | 2 | 3;

type CardSlot = { x: number; y: number };

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
  position: CardPosition;
  slot: CardSlot;
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
};
