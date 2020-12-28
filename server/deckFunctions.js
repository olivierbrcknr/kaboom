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

  let cards = [];

  let cID = 0;

  for ( let c = 0; c < 4; c++ ){
    for( let i = 0; i < defaultCardSet.length; i++ ){
      cards.push( {
        id: cID,
        color: c,
        value: defaultCardSet[i],
        position: 'deck'
      } );
      cID++;
    }
  }

  for ( let j = 0; j < 3; j++ ){
    cards.push( {
      id: cID,
      color: null,
      value: 'X',
      position: 'deck'
    } );
    cID++;
  }

  cards = shuffleDeck(cards);

  return cards;
}


let distributeCards = ( deck, players ) => {

  let newDeck = deck;

  let lastOnTopID = 1;

  // four cards

    // for each player
  for ( let i = 0; i < players.length; i++ ){

    for ( let k = 0; k < 4; k++ ){

      let num = i*4 + k;

      newDeck[num] = {
        ...newDeck[num],
        position: players[i].id
      }

      lastOnTopID++;
    }
  }

  newDeck[lastOnTopID] = {
    ...newDeck[lastOnTopID],
    position: 'graveyard',
    isCurrent: true
  }

  return newDeck;

}




exports.createDefault = createDefaultCardSet;
exports.shuffle = shuffleDeck;
exports.distribute = distributeCards;
