import type { Deck, HandCard, PlayerID, Card, Player } from "../types";

import { positionCard, checkDeck } from "./deckFunctions";

const checkIfPlayable = (
  deck: Deck,
  card: HandCard,
  playerID: PlayerID,
  lastFiredCardStack,
  callback: (v: Card) => void = () => {},
) => {
  const currentCard = deck.graveyard[deck.graveyard.length - 1];
  // add plus one to not interfere with current open card
  const nextCard = deck.deck[1];

  let pseudoDeck = deck;

  let isPlayable = false;

  // has same value as current card
  if (currentCard.value === card.value && card.player !== lastFiredCardStack) {
    pseudoDeck.graveyard.push({
      color: card.color,
      id: card.id,
      value: card.value,
    });

    // if is not from own hand
    if (card.player !== playerID) {
      callback(card);
    }

    const removeIndex = pseudoDeck.hand.map((item) => item.id).indexOf(card.id);
    pseudoDeck.hand.splice(removeIndex, 1);

    isPlayable = true;

    // penalty card
  } else {
    let k = 0;
    const handCards: HandCard[] = [];
    for (let i = 0; i < pseudoDeck.hand.length; i++) {
      if (pseudoDeck.hand[i].player === playerID) {
        k++;
        handCards.push(pseudoDeck.hand[i]);
      }
    }

    pseudoDeck.hand.push({
      ...nextCard,
      player: playerID,
      slot: positionCard(k, handCards),
    });
    pseudoDeck.deck.shift();
  }

  pseudoDeck = checkDeck(pseudoDeck);

  return {
    bool: isPlayable,
    deck: pseudoDeck,
  };
};

const swopCardFromDeck = (deck: Deck, card: HandCard) => {
  const nextCard = deck.deck[0];

  let pseudoDeck = deck;

  pseudoDeck.hand = pseudoDeck.hand.map((c) => {
    if (c.id === card.id) {
      return {
        ...c,
        color: nextCard.color,
        id: nextCard.id,
        value: nextCard.value,
      };
    } else {
      return c;
    }
  });

  pseudoDeck.deck.shift();

  pseudoDeck.graveyard.push({
    color: card.color,
    id: card.id,
    value: card.value,
  });

  pseudoDeck = checkDeck(pseudoDeck);

  return pseudoDeck;
};

const swopCardFromGraveyard = (deck: Deck, card: Card) => {
  const currentCard = deck.graveyard[deck.graveyard.length - 1];

  let pseudoDeck = deck;

  pseudoDeck.hand = pseudoDeck.hand.map((c) => {
    if (c.id === card.id) {
      return {
        ...c,
        color: currentCard.color,
        id: currentCard.id,
        value: currentCard.value,
      };
    } else {
      return c;
    }
  });

  pseudoDeck.graveyard.pop();

  pseudoDeck.graveyard.push({
    color: card.color,
    id: card.id,
    value: card.value,
  });

  pseudoDeck = checkDeck(pseudoDeck);

  return pseudoDeck;
};

const cardFromDeckToGraveyard = (deck: Deck) => {
  let pseudoDeck = deck;

  const transferCard = deck.deck[0];

  pseudoDeck.graveyard.push(transferCard);
  pseudoDeck.deck.shift();

  pseudoDeck = checkDeck(pseudoDeck);

  return pseudoDeck;
};

const cardSwoppedBetweenPlayers = (deck: Deck, cards: HandCard[]) => {
  let pseudoDeck = deck;

  const card1 = cards[0];
  const card2 = cards[1];

  pseudoDeck.hand = pseudoDeck.hand.map((c) => {
    if (c.id === card1.id) {
      return {
        ...c,
        player: card2.player,
        slot: card2.slot,
      };
    } else if (c.id === card2.id) {
      return {
        ...c,
        player: card1.player,
        slot: card1.slot,
      };
    }
    {
      return c;
    }
  });

  pseudoDeck = checkDeck(pseudoDeck);

  return pseudoDeck;
};

const cardShiftedToPlayer = (deck: Deck, card: Card, oldCard: HandCard) => {
  let pseudoDeck = deck;

  pseudoDeck.hand = pseudoDeck.hand.map((c) => {
    if (c.id === card.id) {
      return {
        ...c,
        player: oldCard.player,
        slot: oldCard.slot,
      };
    } else {
      return c;
    }
  });

  pseudoDeck = checkDeck(pseudoDeck);

  return pseudoDeck;
};

const calcPlayerPoints = (
  players: Player[],
  deck: Deck,
  endingPlayer: PlayerID,
  endingByChoice: boolean,
) => {
  const thisRoundPoints: {
    id: PlayerID;
    points: number;
  }[] = [];
  let thisEndingPlayersRoundPoints = 0;
  let lastPlayerPrevPoints = 0;
  let lastPlayerPoints = 0;

  const pseudoPlayers = players.map((p) => {
    const oldPoints = p.points;
    let newPoints = 0;

    const wasFifty = oldPoints === 50 ? true : false;

    for (let i = 0; i < deck.hand.length; i++) {
      const card = deck.hand[i];

      if (card.player === p.id) {
        let cardVal = 0;

        switch (card.value) {
          case "Q":
          case "J":
            cardVal = 10;
            break;

          case "A":
            cardVal = 1;
            break;

          case "X":
            cardVal = 0;
            break;

          case "K":
            // red king
            if (card.color === 0 || card.color === 1) {
              cardVal = -1;
            } else {
              cardVal = 10;
            }

            break;

          default:
            cardVal = card.value;
            break;
        }

        newPoints += cardVal;
      }
    }

    let updatedPoints = oldPoints + newPoints;

    // jump backs
    if (updatedPoints === 50 && !wasFifty) {
      updatedPoints = 0;
    } else if (updatedPoints === 100) {
      updatedPoints = 50;
    }

    const newRoundPoints = p.roundPoints;
    newRoundPoints.push(newPoints);
    thisRoundPoints.push({
      id: p.id,
      points: newPoints,
    });

    if (p.id === endingPlayer) {
      thisEndingPlayersRoundPoints = newPoints;
      lastPlayerPrevPoints = p.points;
      lastPlayerPoints = newPoints;
    }

    return {
      ...p,
      points: updatedPoints,
      roundPoints: newRoundPoints,
    };
  });

  if (endingPlayer) {
    // if someone has less or the same amount of points add or remove points
    let checkIfSomeoneHadFever = false;
    let lastPlayerIndex = 0;

    for (let i = 0; i < thisRoundPoints.length; i++) {
      if (thisRoundPoints[i].id !== endingPlayer) {
        if (thisRoundPoints[i].points <= thisEndingPlayersRoundPoints) {
          checkIfSomeoneHadFever = true;
        }
      } else {
        lastPlayerIndex = i;
      }
    }

    if (checkIfSomeoneHadFever) {
      // add penalty points
      lastPlayerPoints += 30;
      if (lastPlayerPoints === 50) {
        lastPlayerPoints = 0;
      }
      if (lastPlayerPoints === 100) {
        lastPlayerPoints = 50;
      }
    } else if (endingByChoice) {
      lastPlayerPoints -= 5;
      if (lastPlayerPoints === 50) {
        lastPlayerPoints = 0;
      }
      if (lastPlayerPoints === 100) {
        lastPlayerPoints = 50;
      }
    }

    const newRoundPoints = pseudoPlayers[lastPlayerIndex].roundPoints;
    newRoundPoints[newRoundPoints.length - 1] = lastPlayerPoints;

    pseudoPlayers[lastPlayerIndex] = {
      ...pseudoPlayers[lastPlayerIndex],
      points: lastPlayerPrevPoints + lastPlayerPoints,
      roundPoints: newRoundPoints,
    };
  }

  return pseudoPlayers;
};

const calcIfEnded = (players: Player[]): boolean => {
  let hasEnded = false;

  for (let i = 0; i < players.length; i++) {
    if (players[i].points > 100) {
      hasEnded = true;
    }
  }

  return hasEnded;
};

const checkIfPlayerHasZeroCards = (players: Player[], deck: Deck) => {
  let hasZeroCards: PlayerID | false = false;

  for (let i = 0; i < players.length; i++) {
    let cardCount = 0;
    for (let c = 0; c < deck.hand.length; c++) {
      if (deck.hand[c].player === players[i].id) {
        cardCount++;
      }
    }
    if (cardCount <= 0) {
      hasZeroCards = players[i].id;
    }
  }

  return hasZeroCards;
};

export {
  checkIfPlayable,
  swopCardFromDeck,
  swopCardFromGraveyard,
  cardFromDeckToGraveyard,
  cardShiftedToPlayer,
  calcPlayerPoints,
  cardSwoppedBetweenPlayers,
  calcIfEnded,
  checkIfPlayerHasZeroCards,
};
