

let checkIfPlayable = (deck,card) => {

  let currentCard = deck.find(c => c.isCurrent);

  let pseudoDeck = deck;

  if( currentCard.value === card.value ){

    pseudoDeck[ card.id ] = {
      ...deck[ card.id ],
      position: 'graveyard',
      isCurrent: true,
    }

    pseudoDeck[ currentCard.id ] = {
      ...deck[ currentCard.id ],
      isCurrent: false,
    }

  }else{

    // strafkarte

  }

  return pseudoDeck;
}


exports.checkIfPlayable = checkIfPlayable;
