let positionCard = (id) => {

  let posX = 0;
  let posY = 0;

  if( id % 2 == 0 ){
    posY = 1;
  }

  // columns
  switch (id){
    case 0:
      posX = 1;
      posY = 1;
      break;
    case 1:
      posX = 2;
      posY = 1;
      break;
    case 2:
      posX = 1;
      posY = 0;
      break;
    case 3:
      posX = 2;
      posY = 0;
      break;
    case 4:
      posX = 3;
      posY = 0;
      break;
    case 5:
      posX = 3;
      posY = 1;
      break;
    case 6:
      posX = 0;
      posY = 0;
      break;
    case 7:
      posX = 0;
      posY = 1;
      break;
  }

  return {
    x: posX,
    y: posY
  }

}


let shuffleDeck = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

let createDefaultCardSet = () => {

  let defaultCardSet = [
    2,3,4,5,6,7,8,9,10,'J','Q','K','A'
  ];

  let cards = {
    graveyard: [],
    deck: [],
    hand: []
  };

  // let cards = [];

  let cID = 0;

  for ( let c = 0; c < 4; c++ ){
    for( let i = 0; i < defaultCardSet.length; i++ ){
      cards.deck.push( {
        id: cID,
        color: c,
        value: defaultCardSet[i],
        // position: 'deck'
      } );
      cID++;
    }
  }

  for ( let j = 0; j < 3; j++ ){
    cards.deck.push( {
      id: cID,
      color: null,
      value: 'X',
      // position: 'deck'
    } );
    cID++;
  }

  cards.deck = shuffleDeck(cards.deck);

  return cards;
}


let distributeCards = ( deck, players ) => {

  let newDeck = deck;

  let lastOnTopID = 1;

  // for each player
  for ( let i = 0; i < players.length; i++ ){

    // four cards
    for ( let k = 0; k < 4; k++ ){

      let card = newDeck.deck[0];
      newDeck.hand.push( {
        ...card,
        player: players[i].id,
        slot: positionCard(k)
      } );
      newDeck.deck.shift();

      lastOnTopID++;
    }
  }

  let card = newDeck.deck[0];
  newDeck.graveyard.push( card );
  newDeck.deck.shift();

  return newDeck;

}




exports.createDefault = createDefaultCardSet;
exports.shuffle = shuffleDeck;
exports.distribute = distributeCards;
