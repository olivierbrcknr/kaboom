const deckFn = require('./deckFunctions.js');

let checkIfPlayable = (deck,card,playerID,callback=()=>{}) => {

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

    // if is not from own hand
    if( card.player !== playerID ){
      callback( card );
    }

    let removeIndex = pseudoDeck.hand.map(item => item.id).indexOf(card.id);
    pseudoDeck.hand.splice(removeIndex, 1);

  // penalty card
  }else{

    let k = 0;
    let handCards = [];
    for(let i = 0; i < pseudoDeck.hand.length; i++){
      if( pseudoDeck.hand[i].player === playerID ){
        k++;
        handCards.push(pseudoDeck.hand[i]);
      }
    }

    pseudoDeck.hand.push({
      ...nextCard,
      player: playerID,
      slot: deckFn.positionCard(k,handCards)
    });
    pseudoDeck.deck.shift();

  }

  pseudoDeck = deckFn.checkDeck(pseudoDeck);

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

  pseudoDeck = deckFn.checkDeck(pseudoDeck);

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

  pseudoDeck = deckFn.checkDeck(pseudoDeck);

  return pseudoDeck;

}

let cardFromDeckToGraveyard = (deck) => {
  let pseudoDeck = deck;

  let transferCard = deck.deck[ 0 ];

  pseudoDeck.graveyard.push(transferCard);
  pseudoDeck.deck.shift();

  pseudoDeck = deckFn.checkDeck(pseudoDeck);

  return pseudoDeck;
}

let cardShiftedToPlayer = ( deck, card, oldCard ) => {

  let pseudoDeck = deck;

  pseudoDeck.hand = pseudoDeck.hand.map(c => {
    if( c.id === card.id ){
      return {
        ...c,
        player: oldCard.player,
        slot: oldCard.slot
      }
    }else{
      return c;
    }
  })

  pseudoDeck = deckFn.checkDeck(pseudoDeck);

  return pseudoDeck;

}

let calcPlayerPoints = ( players, deck ) => {

  let pseudoPlayers = players.map( (p,k)=>{

    let updatedPoints = p.points;

    for( let i = 0; i < deck.hand.length; i++ ){

      let card = deck.hand[i];

      if( card.player === p.id ){

        let cardVal = 0;

        switch( card.value ){

          case 'Q':
          case 'J':
            cardVal = 10;
            break;

          case 'A':
            cardVal = 1;
            break;

          case 'X':
            cardVal = 0;
            break;

          case 'K':
            // red king
            if( card.color === 0 || card.color === 1 ){
              cardVal = -1;
            }else{
              cardVal = 10;
            }

            break;

          default:
            cardVal = card.value;
            break;
        }


        updatedPoints+=cardVal;
      }
    }

    // jump backs
    if( updatedPoints === 50 ){
      updatedPoints = 0;
    }else if( updatedPoints === 100 ){
      updatedPoints = 50;
    }

    return {
      ...p,
      points: updatedPoints
    }

  } );

  return pseudoPlayers;
}


exports.checkIfPlayable = checkIfPlayable;
exports.swopCardFromDeck = swopCardFromDeck;
exports.swopCardFromGraveyard = swopCardFromGraveyard;
exports.cardFromDeckToGraveyard = cardFromDeckToGraveyard;
exports.cardShiftedToPlayer = cardShiftedToPlayer;
exports.calcPlayerPoints = calcPlayerPoints;
