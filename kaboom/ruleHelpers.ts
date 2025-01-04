import type { Card as CardType, CardValue, CardActions } from "./types";

export interface HighlightObject {
  deck: boolean;
  graveyard: boolean;
  otherCards: boolean;
  ownCards: boolean;
  dueToEffect: boolean;
}

export type RuleAction = {
  label: string;
  clickableAreas: HighlightObject;
  type: CardActions;
};

export type CardRule = {
  cardValue: CardValue[];
  actions: RuleAction[];
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
    actions: [
      {
        label: "Look at one of your own cards",
        clickableAreas: {
          ...emptyHighlight,
          ownCards: true,
        },
        type: "lookAt",
      },
    ],
  },
  {
    cardValue: [9, 10],
    actions: [
      {
        label: "Look at an opponent‘s card",
        clickableAreas: {
          ...emptyHighlight,
          otherCards: true,
        },
        type: "lookAt",
      },
    ],
  },
  {
    cardValue: ["J", "Q"],
    actions: [
      {
        label: "Swop any two cards",
        clickableAreas: {
          ...emptyHighlight,
          otherCards: true,
          ownCards: true,
        },
        type: "swap",
      },
    ],
  },
  {
    cardValue: ["K"],
    actions: [
      {
        label: "Look at any one card, then swap any two cards",
        clickableAreas: {
          ...emptyHighlight,
          ownCards: true,
          otherCards: true,
        },
        type: "lookAt",
      },
      {
        label: "Swop any two cards",
        clickableAreas: {
          ...emptyHighlight,
          otherCards: true,
          ownCards: true,
        },
        type: "swap",
      },
    ],
  },
];

// Helper Functions ———————————————————————————————————————
export const getCardRule = (card: CardType): CardRule | false => {
  const rule = cardRules.find((cR) => cR.cardValue.includes(card.value));
  return rule ? rule : false;
};
