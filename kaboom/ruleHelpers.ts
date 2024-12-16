import type {
  Player,
  FocusCard,
  Deck as DeckType,
  Card as CardType,
  HandCard,
  PlayerID,
  CardEffect,
  CardPosition,
  CardHighlightType,
  CardValue,
  CardActions,
} from "./types";

export interface HighlightObject {
  deck: boolean;
  graveyard: boolean;
  otherCards: boolean;
  ownCards: boolean;
  dueToEffect: boolean;
}

export type CardRule = {
  cardValue: CardValue[];
  label: string;
  clickableAreas: HighlightObject;
  action: CardActions;
};

export const emptyHighlight: HighlightObject = {
  deck: false,
  dueToEffect: false,
  graveyard: false,
  otherCards: false,
  ownCards: false,
};

export const cardRules: CardRule[] = [
  {
    cardValue: [7, 8],
    label: "Look at one of your own cards",
    clickableAreas: {
      ...emptyHighlight,
      ownCards: true,
    },
    action: "lookAt",
  },
  {
    cardValue: [9, 10],
    label: "Look at an opponent‘s card",
    clickableAreas: {
      ...emptyHighlight,
      otherCards: true,
    },
    action: "lookAt",
  },
  {
    cardValue: ["J", "Q"],
    label: "Swop any two cards",
    clickableAreas: {
      ...emptyHighlight,
      otherCards: true,
      ownCards: true,
    },
    action: "swop",
  },
  {
    cardValue: ["K"],
    label: "Look at any one card, then swop any two cards",
    clickableAreas: {
      ...emptyHighlight,
      ownCards: true,
      otherCards: true,
    },
    action: "lookAtKing",
  },
];
