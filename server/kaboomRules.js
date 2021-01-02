

let checkIfPlayable = (deck,card) => {

  let currentCard = deck.graveyard[ deck.graveyard.length-1 ];
  let nextCard = deck.deck[ 0 ];

  let pseudoDeck = deck;

  // has same value as current card
  if( currentCard.value === card.value ){

    pseudoDeck.graveyard.push({
      id: card.id,
      value: card.value,
      color: card.color
    });

    let removeIndex = pseudoDeck.hand.map(item => item.id).indexOf(card.id);
    pseudoDeck.hand.splice(removeIndex, 1);

  // penalty card
  }else{

    pseudoDeck.hand.push({
      ...nextCard,
      player: card.player
    });
    pseudoDeck.deck.shift();

  }
  return pseudoDeck;
}

let swopCardFromDeck = (deck,card) => {

  let nextCard = deck.deck[ 0 ];

  let pseudoDeck = deck;

  pseudoDeck.hand = pseudoDeck.hand.map(c => {
    if( c.id === card.id ){
      return {
        ...c,
        id: nextCard.id,
        color: nextCard.color,
        value: nextCard.value
      }
    }else{
      return c;
    }
  })

  pseudoDeck.deck.shift();

  pseudoDeck.graveyard.push({
    id: card.id,
    value: card.value,
    color: card.color
  });

  return pseudoDeck;

}


let swopCardFromGraveyard = (deck,card) => {

  let currentCard = deck.graveyard[ deck.graveyard.length-1 ];

  let pseudoDeck = deck;

  pseudoDeck.hand = pseudoDeck.hand.map(c => {
    if( c.id === card.id ){
      return {
        ...c,
        id: currentCard.id,
        color: currentCard.color,
        value: currentCard.value
      }
    }else{
      return c;
    }
  })

  pseudoDeck.graveyard.pop();

  pseudoDeck.graveyard.push({
    id: card.id,
    value: card.value,
    color: card.color
  });

  return pseudoDeck;

}

let cardFromDeckToGraveyard = (deck) => {
  let pseudoDeck = deck;

  let transferCard = deck.deck[ 0 ];

  pseudoDeck.graveyard.push(transferCard);
  pseudoDeck.deck.shift();

  return pseudoDeck;
}


exports.checkIfPlayable = checkIfPlayable;
exports.swopCardFromDeck = swopCardFromDeck;
exports.swopCardFromGraveyard = swopCardFromGraveyard;
exports.cardFromDeckToGraveyard = cardFromDeckToGraveyard;
