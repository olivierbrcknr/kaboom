let positionCard = (id, handCards = false) => {
  const upperRow = [2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23];

  let slotsTaken = [];

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
      posX -= parseInt(k / 4);
      // odd --> right
    } else {
      posX += parseInt(k / 4) + 1;
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

let shuffleDeck = (array) => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

let createDefaultCardSet = () => {
  let defaultCardSet = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

  let cards = {
    graveyard: [],
    deck: [],
    hand: [],
  };

  // let cards = [];

  let cID = 0;

  for (let c = 0; c < 4; c++) {
    for (let i = 0; i < defaultCardSet.length; i++) {
      cards.deck.push({
        id: cID,
        color: c,
        value: defaultCardSet[i],
        // position: 'deck'
      });
      cID++;
    }
  }

  for (let j = 0; j < 3; j++) {
    cards.deck.push({
      id: cID,
      color: null,
      value: "X",
      // position: 'deck'
    });
    cID++;
  }

  cards.deck = shuffleDeck(cards.deck);

  return cards;
};

let distributeCards = (deck, players) => {
  let newDeck = deck;

  let lastOnTopID = 1;

  // for each player
  for (let i = 0; i < players.length; i++) {
    // four cards
    for (let k = 0; k < 4; k++) {
      let card = newDeck.deck[0];
      newDeck.hand.push({
        ...card,
        player: players[i].id,
        slot: positionCard(k),
      });
      newDeck.deck.shift();

      lastOnTopID++;
    }
  }

  let card = newDeck.deck[0];
  newDeck.graveyard.push(card);
  newDeck.deck.shift();

  return newDeck;
};

// check if deck is empty and reshuffle
let checkDeck = (deck) => {
  let pseudoDeck = deck;

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

let checkNextPlayer = (players, currentPlayer) => {
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

exports.createDefault = createDefaultCardSet;
exports.shuffle = shuffleDeck;
exports.distribute = distributeCards;
exports.positionCard = positionCard;
exports.checkDeck = checkDeck;
exports.checkNextPlayer = checkNextPlayer;
