import type {
  CardSlot,
  CardValue,
  Deck,
  HandCard,
  CardColor,
  Player,
} from "../types";

const positionCard = (
  id: number,
  handCards: undefined | HandCard[] = undefined,
): CardSlot => {
  const upperRow = [2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23];

  const slotsTaken: CardSlot[] = [];

  let k = id;

  let posX = 1;
  let posY = 0;

  let fits = false;

  // only check for a different k if slot is already taken
  if (handCards && handCards.length > 0) {
    for (let i = 0; i < handCards.length; i++) {
      slotsTaken.push(handCards[i].slot);
    }
  }

  let fitTries = 0;
  while (fits === false) {
    // check if above or below
    if (upperRow.includes(k)) {
      posY = 0;
    } else {
      posY = 1;
    }

    // even --> left
    if (k % 2 == 0) {
      posX -= Math.floor(k / 4);
      // odd --> right
    } else {
      posX += Math.floor(k / 4) + 1;
    }

    fits = true;

    for (let i = 0; i < slotsTaken.length; i++) {
      if (slotsTaken[i].x == posX && slotsTaken[i].y == posY) {
        fits = false;
      }
    }

    if (fitTries === 0) {
      k = 3;
    } else {
      k++;
    }

    fitTries++;
  }

  return {
    x: posX,
    y: posY,
  };
};

const shuffleDeck = (array: any[]) => {
  let currentIndex: number = array.length,
    temporaryValue: any,
    randomIndex: number;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const createDefaultCardSet = (): Deck => {
  const defaultCardSet: CardValue[] = [
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    "J",
    "Q",
    "K",
    "A",
  ];

  const cards: Deck = {
    deck: [],
    graveyard: [],
    hand: [],
  };

  // let cards = [];

  let cID = 0;

  for (let c = 0; c < 4; c++) {
    for (let i = 0; i < defaultCardSet.length; i++) {
      cards.deck.push({
        color: c as CardColor,
        id: cID,
        value: defaultCardSet[i],
        // position: 'deck'
      });
      cID++;
    }
  }

  // add three jokers
  for (let j = 0; j < 3; j++) {
    cards.deck.push({
      color: null,
      id: cID,
      value: "X",
      // position: 'deck'
    });
    cID++;
  }

  cards.deck = shuffleDeck(cards.deck);

  return cards;
};

const distributeCards = (deck: Deck, players: Player[]): Deck => {
  const newDeck = deck;

  // let lastOnTopID = 1;

  // for each player
  for (let i = 0; i < players.length; i++) {
    // four cards
    for (let k = 0; k < 4; k++) {
      const card = newDeck.deck[0];
      newDeck.hand.push({
        ...card,
        player: players[i].id,
        slot: positionCard(k),
      });
      newDeck.deck.shift();

      // lastOnTopID++;
    }
  }

  const card = newDeck.deck[0];
  newDeck.graveyard.push(card);
  newDeck.deck.shift();

  return newDeck;
};

// check if deck is empty and reshuffle
const checkDeck = (deck: Deck): Deck => {
  const pseudoDeck = deck;

  // if deck has less than 5 cards, reshuffle and add graveyard
  if (pseudoDeck.deck.length < 5) {
    let graveDeck = pseudoDeck.graveyard;

    // add only last card from graveyard
    pseudoDeck.graveyard = [graveDeck[graveDeck.length - 1]];

    // remove card that still is on stack and shuffle
    graveDeck.shift();
    graveDeck = shuffleDeck(graveDeck);

    // add do deck again
    pseudoDeck.deck.push(...graveDeck);
  }

  return pseudoDeck;
};

const checkNextPlayer = (players: Player[], currentPlayer: number) => {
  let nextPlayer = currentPlayer;

  let foundNextPlayer = false;

  while (!foundNextPlayer) {
    nextPlayer++;
    if (nextPlayer >= players.length) {
      nextPlayer = 0;
    }
    if (players[nextPlayer].isPlaying) {
      foundNextPlayer = true;
    }
  }

  return nextPlayer;
};

export {
  createDefaultCardSet as createDefault,
  shuffleDeck as shuffle,
  distributeCards as distribute,
  positionCard,
  checkDeck,
  checkNextPlayer,
};
