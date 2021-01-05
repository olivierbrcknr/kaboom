import React, {useState, useEffect} from 'react'

import styles from './Game.module.css';

import Deck from '../Deck'
import DisplayPlayers from '../DisplayPlayers'
import PlayerUI from '../PlayerUI'

import socket from "../socket";

const isDev = process.env.NODE_ENV !== 'production'

const Game = (props) => {

  const [myState,setMyState] = useState({
    id: null,
    name: null,
  });
  const [players,setPlayers] = useState([]);
  const [gameIsRunning,setGameIsRunning] = useState(false);
  const [playEffect,setPlayEffect] = useState(false);

  const [effectContainer,setEffectContainer] = useState({
    effect: '',
    cards: [],
    timer: 2000,
    needsInteraction: false
  });

  const [currentPlayer,setCurrentPlayer] = useState('');
  const [currentDeck,setCurrentDeck] = useState([]);
  const [highlight,setHighlight] = useState({
    ownCards: false,
    otherCards: false,
    graveyard: false,
    deck: false
  });

  const [focusCard,setFocusCard] = useState({
    value: null,
    color: null,
    position: null,
    slot: {
      x: null,
      y: null,
    }
  });

  const [swopHighlightCards,setSwopHighlightCards] = useState({
    cards: [],
    type: null
  });

  const [highlightDeck,setHighlightDeck] = useState(false);

  let classes = [styles.Game];
  classes.push(props.className);

  // Init new state
  useEffect(() => {

    setMyState({
      ...myState,
      id: socket.id
    });

    socket.emit('initialSetup');

    socket.on('getDeck', (data) => {
      setCurrentDeck(data)
    });

    socket.on('playersUpdated', (data) => {
      setPlayers( data );
      let myPlayerData = data.find( p => p.id === socket.id );

      setMyState({
        ...myState,
        id: socket.id,
        name: myPlayerData.name
      });
    });

    socket.on('gameIsRunningUpdate', (data) => {
      setGameIsRunning( data );
    });

    socket.on('currentPlayer', (pID) => {
      setCurrentPlayer(pID);
    });

    socket.on('playEffect', () => {
      setPlayEffect(true);
    });

    socket.on('selectCardToSwop', (targetCard) => {
      setFocusCard({
        ...targetCard,
        position: 'swop'
      });
    });

    socket.on('highlightSwop', (cards,type=null) => {
      setSwopHighlightCards({
        cards: cards,
        type: type
      });
    });

    socket.on('highlightDeck', (type)=>{
      setHighlightDeck(type);
    });

    return () => {
      // detach listeners
      socket.off('getDeck');
      socket.off('playersUpdated');
      socket.off('gameIsRunningUpdate');
      socket.off('currentPlayer');
      socket.off('playEffect');
      socket.off('selectCardToSwop');
      socket.off('highlightSwop');
      socket.off('highlightDeck');
    }
  }, []);


  useEffect( ()=>{

    if( gameIsRunning ){

      setTimeout(()=>{
        setEffectContainer({
          effect: 'initialBottomRow',
          cards: [],
          timer: 5000,
          needsInteraction: false
        });
      },500);

    }else{

      setEffectContainer({
        effect: 'endRound',
        cards: [],
        timer: 10*1000,
        needsInteraction: false
      });
    }

  }, [gameIsRunning] );

  useEffect( ()=>{

    console.log(swopHighlightCards)

    // hide highlight after 2sec
    if( swopHighlightCards.cards.length > 0 ){

      setTimeout(()=>{

        setSwopHighlightCards({
          cards: [],
          type: null,
        });

        setHighlightDeck(false);

      },2000);
    }

  }, [swopHighlightCards] );

  useEffect( ()=>{

    if(isDev){
      // only log deck in development
      console.log(currentDeck)
    }

    if( playEffect ){
      executeEffect( currentDeck.graveyard[ currentDeck.graveyard.length-1 ] );
    }

  }, [currentDeck,playEffect] );

  useEffect( ()=>{

    if( currentPlayer === myState.id ){
      setHighlight({
        ownCards: false,
        otherCards: false,
        graveyard: true,
        deck: true
      });
    }else{
      // empty highlights
      setHighlight({
        ownCards: false,
        otherCards: false,
        graveyard: false,
        deck: false
      });

      // empty focus card, just in case...
      setFocusCard({
        value: null,
        color: null,
        position: null,
        slot: {
          x: null,
          y: null,
        }
      });

      // turn off effect, just in case...
      setPlayEffect(false);

      // empty effectContainer, just in case...
      setEffectContainer({
        effect: '',
        cards: [],
        timer: 2000,
        needsInteraction: false
      });
    }

  }, [currentPlayer,myState.id] );

  useEffect( ()=>{

    switch( focusCard.position){
      case 'deck':
        setHighlight({
          ownCards: true,
          otherCards: false,
          graveyard: true,
          deck: false,
        });
        break;
      case 'swop':
      case 'graveyard':
        setHighlight({
          ownCards: true,
          otherCards: false,
          graveyard: false,
          deck: false,
        });
        break;
      default:
        setHighlight({
          ownCards: false,
          otherCards: false,
          graveyard: false,
          deck: false,
        });
        break;
    }

  }, [focusCard] );


  useEffect( ()=>{

    if( effectContainer.effect && effectContainer.effect !== '' && !effectContainer.needsInteraction ){

      setTimeout(()=>{

        if( effectContainer.effect === 'lookAtKing' ){

          setEffectContainer({
            effect: 'swop',
            cards: [],
            timer: 500,
            needsInteraction: true
          });

        }else{

          if( effectContainer.effect === 'swop' ){
            socket.emit('cardSwoppedBetweenPlayers',effectContainer.cards);
          }

          // empty effect container again
          // show card only for x seconds
          setEffectContainer({
            effect: '',
            cards: [],
            timer: 2000,
            needsInteraction: false
          });

          socket.emit('nextTurn');
        }

      },effectContainer.timer);
    }

  }, [effectContainer] );


  let cardClick = (card) => {

    if( playEffect ){

      switch(focusCard.value.toString()){

        case '7':
        case '8':
        case '9':
        case '10':
          if( effectContainer.cards.length < 1 ){
            var cards = [card];
            setEffectContainer({
              effect: 'lookAt',
              cards: cards,
              timer: 2000,
              needsInteraction: false
            });
            socket.emit('highlightCard',cards,'lookAt');
          }
          break;

        case 'J':
        case 'Q':
          var cards = effectContainer.cards;
          cards.push(card)
          setEffectContainer({
            effect: 'swop',
            cards: cards,
            timer: 500,
            needsInteraction: (cards.length < 2) ? true : false
          });
          break;

        case 'K':
          var cards = effectContainer.cards;
          cards.push(card);
          if( effectContainer.effect !== 'swop' && cards.length < 1 ){
            setEffectContainer({
              effect: 'lookAtKing',
              cards: cards,
              timer: 2000,
              needsInteraction: false
            });
            socket.emit('highlightCard',cards,'lookAt');
          }else{
            setEffectContainer({
              effect: 'swop',
              cards: cards,
              timer: 500,
              needsInteraction: (cards.length < 2) ? true : false
            });
          }
          break;

        default:
          // nothing
          break;
      }

    }else{

      switch(focusCard.position){

      // swopped with deck
      case 'deck':

        socket.emit('cardSwoppedFromDeck', card);

        socket.emit('nextTurn');

        break;

      // swopped with graveyard
      case 'graveyard':

        socket.emit('cardSwoppedFromGraveyard', card);

        socket.emit('nextTurn');

        break;

      // select to swop
      case 'swop':

        socket.emit('cardShiftedToPlayer', card, focusCard);
        setFocusCard({
          position: null,
        });

        break;

      // regular getting rid of card
      default:
        socket.emit('cardPlayed', card);

        break;
      }
    }
  }

  let drawCardFn = () => {

    setFocusCard({
      ...currentDeck.deck[0],
      position: 'deck'
    });

    socket.emit('drawCard','deck');
  }

  let graveyardClick = () => {

    if( focusCard.position === 'deck' ){

      socket.emit('drawCard',false);
      socket.emit('cardFromDeckToGraveyard');

    // regular getting rid of card
    }else if( myState.id === currentPlayer && gameIsRunning && !focusCard.value ){

      socket.emit('drawCard','graveyard');
      setFocusCard({
        ...currentDeck.graveyard[ currentDeck.graveyard.length-1 ],
        position: 'graveyard'
      });

    }else{
      // do nothing
    }
  }


  let executeEffect = (card) => {

    switch( card.value.toString() ){

      case '7':
      case '8':
        console.log('Look at own card');
        setHighlight({
          ownCards: true,
          otherCards: false,
          graveyard: false,
          deck: false,
        });
        break;

      case '9':
      case '10':
        console.log('Look at opponent‘s card');
        setHighlight({
          ownCards: false,
          otherCards: true,
          graveyard: false,
          deck: false,
        });
        break;

      case 'J':
      case 'Q':
        console.log('Swop 2 cards');
        setHighlight({
          ownCards: true,
          otherCards: true,
          graveyard: false,
          deck: false,
        });
        break;

      case 'K':
        setHighlight({
          ownCards: true,
          otherCards: true,
          graveyard: false,
          deck: false,
        });
        console.log('Look at 1 card and swop 2 cards');
        break;

      default:
        // nothing, end turn
        socket.emit('nextTurn');
        break;
    }

  }


  let changeName = (name) => {
    socket.emit('nameChange',name);
  }


  let playerUIs = null;
  let myPos = players.findIndex(p => p.id === myState.id);

  playerUIs = players.map( (p,k) => {

    if( k>3 ){
      return null;
    }

    let isHighlight = highlight.otherCards;
    let cards = [];
    let isSelf = false;

    if( currentDeck.hand ){
      cards = currentDeck.hand.filter( (c) => c.player === p.id );
    }

    if( p.id == myState.id /* || k > 2 */ ){
      isHighlight = highlight.ownCards;
      isSelf = true;
    }

    return <PlayerUI
      effects={effectContainer}
      swopHighlight={swopHighlightCards}
      startingPos={myPos}
      key={'player-no_'+k}
      k={k}
      player={p}
      isMainPlayer={isSelf}
      onNameChange={ (name) => changeName(name) }
      isCurrent={ p.id === currentPlayer && gameIsRunning ? true : false }
      cards={cards}
      onClick={  (c)=>cardClick(c) }
      isHighlight={ isHighlight } />;
  } )

  // let buttons = [];

  let startButton = <button onClick={()=>{ socket.emit('startStop'); }} >{ gameIsRunning ? 'Stop Game' : 'Start Game' }</button>

  let effectDisplay = null;

  if( playEffect ){

    let effectDisplayText = null;

    switch( currentDeck.graveyard[ currentDeck.graveyard.length-1 ].value.toString() ){

      case '7':
      case '8':
        effectDisplayText = 'Look at an own card';
        break;

      case '9':
      case '10':
        effectDisplayText = 'Look at an opponent‘s card';
        break;

      case 'J':
      case 'Q':
        effectDisplayText = 'Swop 2 cards';
        break;

      case 'K':
        effectDisplayText = 'Look at 1 card and swop 2 cards';
        break;

      default:
        // display nothing
        break;
    }


    effectDisplay = (<div className={styles.EffectDisplay}>
                      {effectDisplayText}
                    </div>)
  }

  return (
    <div className={classes.join(" ")}>

      <div className={styles.PlayerUIsContainer}>
        {playerUIs}
      </div>

      <Deck
        deck={currentDeck}
        drawCard={()=>{drawCardFn()}}
        clickGraveyard={()=>{graveyardClick()}}
        isCurrent={ myState.id === currentPlayer && gameIsRunning ? true : false }
        isHighlight={ highlight }
        swopHighlight={ highlightDeck } />

      {effectDisplay}

      <DisplayPlayers
        currentPlayer={currentPlayer}
        gameIsRunning={gameIsRunning}
        players={players} />

      {startButton}

      <button onClick={()=>{ socket.emit('nextTurn'); }}>Next Turn</button>

      <button onClick={()=>{ socket.emit('endRound'); }}>End Round</button>

      <button onClick={()=>{ socket.emit('startRound'); }}>Start Round</button>

    </div>
  )
}

export default Game
