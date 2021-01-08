import React, {useState, useEffect} from 'react'

import styles from './Game.module.css';

import Deck from '../Deck'
import DisplayPlayers from '../DisplayPlayers'
import PlayerUI from '../PlayerUI'

import PlayerSelection from '../PlayerSelection'

import socket from "../socket";

const isDev = process.env.NODE_ENV !== 'production'

const Game = (props) => {

  const [myState,setMyState] = useState({
    id: null,
    name: null,
  });
  const [players,setPlayers] = useState([]);
  const [gameIsRunning,setGameIsRunning] = useState(false);
  const [gameHasEnded,setGameHasEnded] = useState(false);
  const [playEffect,setPlayEffect] = useState(false);
  const [lastRound,setLastRound] = useState(false);

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

  const [roundState,setRoundState] = useState({
    count: 0,
    isRunning: false
  })

  let classes = [styles.Game];
  classes.push(props.className);

  let iAmPlaying = true;
  for( let i = 0; i < players.length; i++ ){
    if( players[i].id == myState.id ){
      iAmPlaying = players[i].isPlaying
    }
  }

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

    socket.on('roundUpdate', (roundCount, roundIsRunning) => {
      setRoundState({
        count: roundCount,
        isRunning: roundIsRunning
      });
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

    socket.on('gameHasEnded', (type)=>{
      console.log('game has ended')
      setGameHasEnded(true);
    });

    socket.on('endingPlayerID', (pID)=>{
      setLastRound(pID);
    });

    return () => {
      // detach listeners
      socket.off('getDeck');
      socket.off('playersUpdated');
      socket.off('gameIsRunningUpdate');
      socket.off('roundUpdate');
      socket.off('currentPlayer');
      socket.off('playEffect');
      socket.off('selectCardToSwop');
      socket.off('highlightSwop');
      socket.off('highlightDeck');
      socket.off('gameHasEnded');
      socket.off('endingPlayerID');
    }
  }, []);


  useEffect( ()=>{
    if(!gameIsRunning){
      setGameHasEnded(false);
    }
  }, [gameIsRunning] );


  useEffect( ()=>{

    if( roundState.isRunning ){

      setTimeout(()=>{
        setEffectContainer({
          effect: 'initialBottomRow',
          cards: [],
          timer: 5000,
          needsInteraction: false
        });
      },500);

    }

  }, [roundState.isRunning] );

  useEffect( ()=>{

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

          if( effectContainer.effect !== 'initialBottomRow' ){
            socket.emit('nextTurn');
          }

        }

      },effectContainer.timer);
    }

  }, [effectContainer] );


  let cardClick = (card) => {

    if( !iAmPlaying || !roundState.isRunning ){
      console.log('nenenenenenenene..')
      return;
    }

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
          if( effectContainer.effect !== 'swop' && cards.length <= 1 ){
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

    if( !iAmPlaying || !roundState.isRunning ){
      console.log('nenenenenenenene..')
      return;
    }

    setFocusCard({
      ...currentDeck.deck[0],
      position: 'deck'
    });

    socket.emit('drawCard','deck');
  }

  let graveyardClick = () => {

    if( !iAmPlaying || !roundState.isRunning ){
      console.log('nenenenenenenene..')
      return;
    }

    if( focusCard.position === 'deck' ){

      socket.emit('drawCard',false);
      socket.emit('cardFromDeckToGraveyard');

    // regular getting rid of card
    }else if( myState.id === currentPlayer && roundState.isRunning && !focusCard.value ){

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

  let playerToggle = (pID) => {
    socket.emit('playerToggle',pID);
  }


  if( gameIsRunning ){

    let playerUIs = null;
    let myPos = players.findIndex(p => p.id === myState.id);

    let playerNo = 0;

    playerUIs = players.map( (p,k) => {

      if( p.isPlaying === false ){
        return null;
      }

      let isHighlight = highlight.otherCards;
      let cards = [];
      let isSelf = false;

      if( currentDeck.hand ){
        cards = currentDeck.hand.filter( (c) => c.player === p.id );
      }

      if( p.id == myState.id ){
        isHighlight = highlight.ownCards;
        isSelf = true;
      }

      if( p.isPlaying ){
        playerNo++;
      }

      return <PlayerUI
        effects={effectContainer}
        swopHighlight={swopHighlightCards}
        startingPos={myPos}
        key={'player-no_'+k}
        k={k}
        playerNo={playerNo-1}
        player={p}
        isMainPlayer={isSelf}
        isCurrent={ p.id === currentPlayer && roundState.isRunning ? true : false }
        cards={cards}
        spectatorMode={ ( !iAmPlaying || !roundState.isRunning ) ? true : false }
        onClick={  (c)=>cardClick(c) }
        isHighlight={ isHighlight } />;
    } )

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

    let startRoundButton = <div className={styles.StartRoundContainer}>
      <div className={styles.StartRoundButton} onClick={ () => socket.emit('startRound') }>
        Start {roundState.count > 0 ? 'Next' : null} Round
      </div>
    </div>;

    let gameEndedDisplay = null;

    if(gameHasEnded){

      let podiumPlayers = players.sort( (p1,p2)=>{

        let comparison = 0;
        if (p1.points > p2.points) {
          comparison = 1;
        } else if (p1.points < p2.points) {
          comparison = -1;
        }
        return comparison;

      } );

      let podiumList = podiumPlayers.map( (player,k)=>{
        return(<li key={'podium-'+k} className={ player.id === myState.id ? styles.isCurrent : '' }>
            {player.name} [{player.points}]
          </li>)
      } )

      let podium = <ol className={styles.Podium}>{podiumList}</ol>

      gameEndedDisplay = <div className={styles.EndGameContainer}>

        {podium}

        <div className={styles.EndGameButton} onClick={ () => socket.emit('endGame') }>
          End Game
        </div>

      </div>
    }


    let endingButton = <div className={styles.IEndButton} onClick={ () => {
      socket.emit('playerIsEnding',myState.id);  // set I want to end
      socket.emit('nextTurn'); // next person's turn
    } }>
      I Want To End
    </div>;

    let devButtons = (<div style={{zIndex: 1000}}>
        <button onClick={()=>{ socket.emit('endGame'); }} >End Game</button>

        <button onClick={()=>{ socket.emit('nextTurn'); }}>Next Turn</button>

        <button onClick={()=>{ socket.emit('endRound'); }}>End Round</button>

        <button onClick={()=>{ socket.emit('startRound'); }}>Start Round</button>
      </div>)

    return (
      <div className={classes.join(" ")}>

        <div className={styles.PlayerUIsContainer}>
          {playerUIs}
        </div>

        <Deck
          deck={currentDeck}
          drawCard={()=>{drawCardFn()}}
          clickGraveyard={()=>{graveyardClick()}}
          isCurrent={ myState.id === currentPlayer && roundState.isRunning ? true : false }
          isHighlight={ highlight }
          swopHighlight={ highlightDeck } />

        { effectDisplay}

        <DisplayPlayers
          isID={myState.id}
          currentPlayer={currentPlayer}
          gameIsRunning={roundState.isRunning}
          players={players} />

        { currentPlayer === myState.id && !lastRound && !playEffect && highlight.deck ? endingButton : null}

        { isDev ? devButtons : null}

        { !roundState.isRunning && !gameHasEnded ? startRoundButton : null }

        { gameHasEnded ? gameEndedDisplay : null }

      </div>
    )

  }else{

    classes.push(styles.isStartScreen);

    return (
      <div className={classes.join(" ")}>

        <h1>
          Kaboom
        </h1>

        <PlayerSelection
          onNameChange={ (name) => changeName(name) }
          onPlayerToggle={ (pID) => playerToggle(pID) }
          isID={myState.id}
          players={players} />

        <div className={styles.StartButton} onClick={()=>{ socket.emit('startGame'); }}>
          Start Game
        </div>

      </div>
    )

  }


}

export default Game
