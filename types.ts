type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "J" | "Q" | "K" | "A";

type CardPosition = "deck" | "swop" | "graveyard" | null;

type CardColor = 1 | 2 | 3 | 4;

type CardSlot = { x: number; y: number };

type Player = {
  id: string;
  name: string;
  points: number;
  roundPoints: number[];
  isPlaying: boolean;
};

type FocusCard = {
  value: CardValue;
  color: CardColor;
  position: CardPosition;
  slot: CardSlot;
};

type Card = {
  id: number;
  color: CardColor;
  value: CardValue;
};

type Deck = {
  hand: {
    id: number;
    color: CardColor;
    value: CardValue;
    player: string | number;
    slot: CardSlot;
  }[];
  deck: Card[];
  graveyard: Card[];
};

export type { Player, Card, FocusCard, CardPosition, CardValue, Deck };
