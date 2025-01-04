import type { CardActions, Card as CardType, CardValue } from "./types";

export type CardRule = {
  actions: RuleAction[];
  cardValue: CardValue[];
};

export interface HighlightObject {
  deck: boolean;
  dueToEffect: boolean;
  graveyard: boolean;
  otherCards: boolean;
  ownCards: boolean;
}

export type RuleAction = {
  clickableAreas: HighlightObject;
  label: string;
  type: CardActions;
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
    actions: [
      {
        clickableAreas: {
          ...emptyHighlight,
          ownCards: true,
        },
        label: "Look at one of your own cards",
        type: "lookAt",
      },
    ],
    cardValue: [7, 8],
  },
  {
    actions: [
      {
        clickableAreas: {
          ...emptyHighlight,
          otherCards: true,
        },
        label: "Look at an opponent‘s card",
        type: "lookAt",
      },
    ],
    cardValue: [9, 10],
  },
  {
    actions: [
      {
        clickableAreas: {
          ...emptyHighlight,
          otherCards: true,
          ownCards: true,
        },
        label: "Swop any two cards",
        type: "swap",
      },
    ],
    cardValue: ["J", "Q"],
  },
  {
    actions: [
      {
        clickableAreas: {
          ...emptyHighlight,
          otherCards: true,
          ownCards: true,
        },
        label: "Look at any one card, then swap any two cards",
        type: "lookAt",
      },
      {
        clickableAreas: {
          ...emptyHighlight,
          otherCards: true,
          ownCards: true,
        },
        label: "Swop any two cards",
        type: "swap",
      },
    ],
    cardValue: ["K"],
  },
];

// Helper Functions ———————————————————————————————————————
export const getCardRule = (card: CardType): CardRule | false => {
  const rule = cardRules.find((cR) => cR.cardValue.includes(card.value));
  return rule ? rule : false;
};
