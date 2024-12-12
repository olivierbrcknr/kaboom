import React, { useState, useEffect } from "react";

import type {
  Player,
  FocusCard,
  Deck as DeckType,
  Card,
  PlayerID,
} from "../../../types";
import Deck from "../Deck";
import DisplayPlayers from "../DisplayPlayers";
import PlayerSelection from "../PlayerSelection";
import PlayerUI from "../PlayerUI";
import socket from "../socket";

import styles from "./Game.module.scss";

const isDev = process.env.NODE_ENV !== "production";

interface GameProps {
  className?: string;
}

const Game = ({ className }: GameProps) => {
  const [myState, setMyState] = useState<{
    id: PlayerID;
    name?: string;
  }>({
    id: undefined,
    name: undefined,
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameIsRunning, setGameIsRunning] = useState(false);
  const [gameHasEnded, setGameHasEnded] = useState(false);
  const [playEffect, setPlayEffect] = useState(false);
  const [lastRound, setLastRound] = useState<string | false>(false);

  const [effectContainer, setEffectContainer] = useState<{
    effect: string;
    cards: Card[];
    timer: number;
    needsInteraction: boolean;
  }>({
    cards: [],
    effect: "",
    needsInteraction: false,
    timer: 2000,
  });

  const [currentPlayer, setCurrentPlayer] = useState<PlayerID | undefined>(
    undefined,
  );
  const [currentDeck, setCurrentDeck] = useState<DeckType | undefined>(
    undefined,
  );
  const [highlight, setHighlight] = useState({
    deck: false,
    dueToEffect: false,
    graveyard: false,
    otherCards: false,
    ownCards: false,
  });

  const [focusCard, setFocusCard] = useState<FocusCard | undefined>(undefined);

  const [swopHighlightCards, setSwopHighlightCards] = useState({
    cards: [],
    type: null,
  });

  const [highlightDeck, setHighlightDeck] = useState(false);

  const [roundState, setRoundState] = useState({
    count: 0,
    isRunning: false,
  });

  const classes = [styles.Game];
  className && classes.push(className);

  let iAmPlaying = true;
  for (let i = 0; i < players.length; i++) {
    if (players[i].id == myState.id) {
      iAmPlaying = players[i].isPlaying;
    }
  }

  // Init new state
  useEffect(() => {
    setMyState({
      ...myState,
      id: socket.id,
    });

    socket.emit("initialSetup");

    socket.on("getDeck", (data) => {
      setCurrentDeck(data);
    });

    socket.on("playersUpdated", (data) => {
      setPlayers(data);
      const myPlayerData = data.find((p) => p.id === socket.id);

      setMyState({
        ...myState,
        id: socket.id,
        name: myPlayerData.name,
      });
    });

    socket.on("gameIsRunningUpdate", (data) => {
      setGameIsRunning(data);
    });

    socket.on("roundUpdate", (roundCount, roundIsRunning) => {
      setRoundState({
        count: roundCount,
        isRunning: roundIsRunning,
      });
    });

    socket.on("currentPlayer", (pID) => {
      setCurrentPlayer(pID);
    });

    socket.on("playEffect", () => {
      setPlayEffect(true);
    });

    socket.on("selectCardToSwop", (targetCard) => {
      setFocusCard({
        ...targetCard,
        position: "swop",
      });
    });

    socket.on("highlightSwop", (cards, type = null) => {
      setSwopHighlightCards({
        cards: cards,
        type: type,
      });
    });

    socket.on("highlightDeck", (type) => {
      setHighlightDeck(type);
    });

    socket.on("gameHasEnded", (type) => {
      console.log("game has ended");
      setGameHasEnded(true);
    });

    socket.on("endingPlayerID", (pID) => {
      setLastRound(pID);
    });

    return () => {
      // detach listeners
      socket.off("getDeck");
      socket.off("playersUpdated");
      socket.off("gameIsRunningUpdate");
      socket.off("roundUpdate");
      socket.off("currentPlayer");
      socket.off("playEffect");
      socket.off("selectCardToSwop");
      socket.off("highlightSwop");
      socket.off("highlightDeck");
      socket.off("gameHasEnded");
      socket.off("endingPlayerID");
    };
  }, []);

  useEffect(() => {
    if (!currentDeck) {
      console.log("No deck");
      return;
    }

    if (Array.isArray(currentDeck.hand)) {
      let cardsOnHand = 0;

      for (let i = 0; i < currentDeck.hand.length; i++) {
        if (currentDeck.hand[i].player === myState.id) {
          cardsOnHand++;
        }
      }

      // console.log('I have '+cardsOnHand+' on my hand')

      if (cardsOnHand === 0) {
        socket.emit("playerIsEnding", myState.id);
      }
    }
  }, [myState.id, currentDeck?.hand]);

  useEffect(() => {
    if (!gameIsRunning) {
      setGameHasEnded(false);
    }
  }, [gameIsRunning]);

  useEffect(() => {
    console.log(lastRound);
  }, [lastRound]);

  useEffect(() => {
    if (roundState.isRunning) {
      setTimeout(() => {
        setEffectContainer({
          cards: [],
          effect: "initialBottomRow",
          needsInteraction: false,
          timer: 5000,
        });
      }, 500);
    }
  }, [roundState.isRunning]);

  useEffect(() => {
    // hide highlight after 2sec
    if (swopHighlightCards.cards.length > 0) {
      setTimeout(() => {
        setSwopHighlightCards({
          cards: [],
          type: null,
        });

        setHighlightDeck(false);
      }, 2000);
    }
  }, [swopHighlightCards]);

  useEffect(() => {
    if (isDev) {
      // only log deck in development
      console.log(currentDeck);
    }

    if (playEffect) {
      // @ts-ignore
      executeEffect(currentDeck.graveyard[currentDeck.graveyard.length - 1]);
    }
  }, [currentDeck, playEffect]);

  useEffect(() => {
    if (currentPlayer === myState.id) {
      setHighlight({
        deck: true,
        dueToEffect: false,
        graveyard: true,
        otherCards: false,
        ownCards: false,
      });
    } else {
      // empty highlights
      setHighlight({
        deck: false,
        dueToEffect: false,
        graveyard: false,
        otherCards: false,
        ownCards: false,
      });

      // empty focus card, just in case...
      // setFocusCard({
      //   value: null,
      //   color: null,
      //   position: null,
      //   slot: {
      //     x: null,
      //     y: null,
      //   },
      // });

      // turn off effect, just in case...
      setPlayEffect(false);

      // empty effectContainer, just in case...
      setEffectContainer({
        cards: [],
        effect: "",
        needsInteraction: false,
        timer: 2000,
      });
    }
  }, [currentPlayer, myState.id, roundState.isRunning]);

  useEffect(() => {
    if (!focusCard) {
      console.log("No card in focus");
      return;
    }

    switch (focusCard.position) {
      case "deck":
        setHighlight({
          ...highlight,
          deck: false,
          graveyard: true,
          otherCards: false,
          ownCards: true,
        });
        break;
      case "swop":
      case "graveyard":
        setHighlight({
          ...highlight,
          deck: false,
          graveyard: false,
          otherCards: false,
          ownCards: true,
        });
        break;
      default:
        setHighlight({
          ...highlight,
          deck: false,
          graveyard: false,
          otherCards: false,
          ownCards: false,
        });
        break;
    }
  }, [focusCard]);

  useEffect(() => {
    if (
      effectContainer.effect &&
      effectContainer.effect !== "" &&
      !effectContainer.needsInteraction
    ) {
      setTimeout(() => {
        if (effectContainer.effect === "lookAtKing") {
          setEffectContainer({
            cards: [],
            effect: "swop",
            needsInteraction: true,
            timer: 500,
          });
        } else {
          if (effectContainer.effect === "swop") {
            socket.emit("cardSwoppedBetweenPlayers", effectContainer.cards);
          }

          // empty effect container again
          // show card only for x seconds
          setEffectContainer({
            cards: [],
            effect: "",
            needsInteraction: false,
            timer: 2000,
          });

          if (effectContainer.effect !== "initialBottomRow") {
            socket.emit("nextTurn");
          }
        }
      }, effectContainer.timer);
    }
  }, [effectContainer]);

  const cardClick = (card: Card, isEffect = false) => {
    if (!iAmPlaying || !roundState.isRunning) {
      console.log("nenenenenenenene..");
      return;
    }

    if (!focusCard) {
      console.log("no card in focus");
      return;
    }

    if (playEffect && isEffect) {
      switch (focusCard.value.toString()) {
        case "7":
        case "8":
        case "9":
        case "10":
          if (effectContainer.cards.length < 1) {
            var cards = [card];
            setEffectContainer({
              cards: cards,
              effect: "lookAt",
              needsInteraction: false,
              timer: 2000,
            });
            socket.emit("highlightCard", cards, "lookAt");
          }
          break;

        case "J":
        case "Q":
          var cards = effectContainer.cards;
          cards.push(card);
          setEffectContainer({
            cards: cards,
            effect: "swop",
            needsInteraction: cards.length < 2 ? true : false,
            timer: 500,
          });
          break;

        case "K":
          var cards = effectContainer.cards;
          cards.push(card);
          if (effectContainer.effect !== "swop" && cards.length <= 1) {
            setEffectContainer({
              cards: cards,
              effect: "lookAtKing",
              needsInteraction: false,
              timer: 2000,
            });
            socket.emit("highlightCard", cards, "lookAt");
          } else {
            setEffectContainer({
              cards: cards,
              effect: "swop",
              needsInteraction: cards.length < 2 ? true : false,
              timer: 500,
            });
          }
          break;

        default:
          // nothing
          break;
      }
    } else if (playEffect && !isEffect) {
      socket.emit("cardPlayed", card);
    } else {
      switch (focusCard.position) {
        // swopped with deck
        case "deck":
          socket.emit("cardSwoppedFromDeck", card);

          socket.emit("nextTurn");

          break;

        // swopped with graveyard
        case "graveyard":
          socket.emit("cardSwoppedFromGraveyard", card);

          socket.emit("nextTurn");

          break;

        // select to swop
        case "swop":
          socket.emit("cardShiftedToPlayer", card, focusCard);
          setFocusCard({
            ...focusCard,
            position: null,
          });

          break;

        // regular getting rid of card
        default:
          socket.emit("cardPlayed", card);

          break;
      }
    }
  };

  const drawCardFn = () => {
    if (!iAmPlaying || !roundState.isRunning) {
      console.log("nenenenenenenene..");
      return;
    }

    if (!currentDeck) {
      console.log("Deck is not defined");
      return;
    }

    // @ts-ignore
    setFocusCard({
      ...currentDeck.deck[0],
      position: "deck",
    });

    socket.emit("drawCard", "deck");
  };

  const graveyardClick = () => {
    if (!iAmPlaying || !roundState.isRunning) {
      console.log("nenenenenenenene..");
      return;
    }

    if (!focusCard) {
      console.log("FocusCard is not defined");
      return;
    }
    if (!currentDeck) {
      console.log("Deck is not defined");
      return;
    }

    if (focusCard.position === "deck") {
      socket.emit("drawCard", false);
      socket.emit("cardFromDeckToGraveyard");

      // regular getting rid of card
    } else if (
      myState.id === currentPlayer &&
      roundState.isRunning &&
      !focusCard.value
    ) {
      socket.emit("drawCard", "graveyard");

      // @ts-ignore
      setFocusCard({
        ...currentDeck.graveyard[currentDeck.graveyard.length - 1],
        position: "graveyard",
      });
    } else {
      // do nothing
    }
  };

  const executeEffect = (card) => {
    switch (card.value.toString()) {
      case "7":
      case "8":
        console.log("Look at own card");
        setHighlight({
          deck: false,
          dueToEffect: true,
          graveyard: false,
          otherCards: false,
          ownCards: true,
        });
        break;

      case "9":
      case "10":
        console.log("Look at opponent‘s card");
        setHighlight({
          deck: false,
          dueToEffect: true,
          graveyard: false,
          otherCards: true,
          ownCards: false,
        });
        break;

      case "J":
      case "Q":
        console.log("Swop 2 cards");
        setHighlight({
          deck: false,
          dueToEffect: true,
          graveyard: false,
          otherCards: true,
          ownCards: true,
        });
        break;

      case "K":
        setHighlight({
          deck: false,
          dueToEffect: true,
          graveyard: false,
          otherCards: true,
          ownCards: true,
        });
        console.log("Look at 1 card and swop 2 cards");
        break;

      default:
        // nothing, end turn
        socket.emit("nextTurn");
        break;
    }
  };

  const changeName = (name) => {
    socket.emit("nameChange", name);
  };

  const playerToggle = (pID) => {
    socket.emit("playerToggle", pID);
  };

  if (gameIsRunning) {
    let playerUIs: (React.JSX.Element | null)[] | null = null;
    const myPos = players.findIndex((p) => p.id === myState.id);

    let playerNo = 0;

    playerUIs = players.map((p, k) => {
      if (p.isPlaying === false) {
        return null;
      }

      if (!currentDeck) {
        console.log("Deck is not defined");
        return null;
      }

      let isHighlight = highlight.otherCards;
      let cards: Card[] = [];
      let isSelf = false;

      if (currentDeck.hand) {
        cards = currentDeck.hand.filter((c) => c.player === p.id);
      }

      if (p.id == myState.id) {
        isHighlight = highlight.ownCards;
        isSelf = true;
      }

      if (p.isPlaying) {
        playerNo++;
      }

      return (
        <PlayerUI
          effects={effectContainer}
          swopHighlight={swopHighlightCards}
          startingPos={myPos}
          key={"player-no_" + k}
          k={k}
          playerNo={playerNo - 1}
          player={p}
          isMainPlayer={isSelf}
          isEndingPlayer={lastRound === p.id ? true : false}
          isCurrent={
            p.id === currentPlayer && roundState.isRunning ? true : false
          }
          cards={cards}
          spectatorMode={
            /*!iAmPlaying || isDev || */ !roundState.isRunning ? true : false
          }
          onClick={(c, e) => cardClick(c, e)}
          isHighlight={isHighlight}
          isHighlightDueToEffect={highlight.dueToEffect}
        />
      );
    });

    let effectDisplay: React.JSX.Element | null = null;

    if (playEffect) {
      let effectDisplayText: string | null = null;

      if (!currentDeck) {
        console.log("Deck is not defined");
        return null;
      }

      switch (
        currentDeck.graveyard[currentDeck.graveyard.length - 1].value.toString()
      ) {
        case "7":
        case "8":
          effectDisplayText = "Look at an own card";
          break;

        case "9":
        case "10":
          effectDisplayText = "Look at an opponent‘s card";
          break;

        case "J":
        case "Q":
          effectDisplayText = "Swop 2 cards";
          break;

        case "K":
          effectDisplayText = "Look at 1 card and swop 2 cards";
          break;

        default:
          // display nothing
          break;
      }

      effectDisplay = (
        <div className={styles.EffectDisplay}>{effectDisplayText}</div>
      );
    }

    const startRoundButton = (
      <div className={styles.StartRoundContainer}>
        <div
          className={styles.StartRoundButton}
          onClick={() => socket.emit("startRound")}
        >
          Start {roundState.count > 0 ? "Next" : null} Round
        </div>
      </div>
    );

    let gameEndedDisplay: React.JSX.Element | null = null;

    if (gameHasEnded) {
      const podiumPlayers = players.sort((p1, p2) => {
        let comparison = 0;
        if (p1.points > p2.points) {
          comparison = 1;
        } else if (p1.points < p2.points) {
          comparison = -1;
        }
        return comparison;
      });

      const podiumList = podiumPlayers.map((player, k) => {
        return (
          <li
            key={"podium-" + k}
            className={player.id === myState.id ? styles.isCurrent : ""}
          >
            {player.name} [{player.points}]
          </li>
        );
      });

      const podium = <ol className={styles.Podium}>{podiumList}</ol>;

      gameEndedDisplay = (
        <div className={styles.EndGameContainer}>
          {podium}

          <div
            className={styles.EndGameButton}
            onClick={() => socket.emit("endGame")}
          >
            End Game
          </div>
        </div>
      );
    }

    const endingButton = (
      <div
        className={styles.IEndButton}
        onClick={() => {
          socket.emit("endRound", myState.id); // set I want to end
          // socket.emit('nextTurn'); // next person's turn
        }}
      >
        I Want To End
      </div>
    );

    const devButtons = (
      <div style={{ zIndex: 9 }}>
        <button
          onClick={() => {
            socket.emit("endGame");
          }}
        >
          End Game
        </button>

        <button
          onClick={() => {
            socket.emit("nextTurn");
          }}
        >
          Next Turn
        </button>

        <button
          onClick={() => {
            socket.emit("endRound");
          }}
        >
          End Round
        </button>

        <button
          onClick={() => {
            socket.emit("startRound");
          }}
        >
          Start Round
        </button>
      </div>
    );

    return (
      <div className={classes.join(" ")}>
        <div className={styles.PlayerUIsContainer}>{playerUIs}</div>

        <Deck
          deck={currentDeck}
          drawCard={() => {
            drawCardFn();
          }}
          clickGraveyard={() => {
            graveyardClick();
          }}
          isCurrent={
            myState.id === currentPlayer && roundState.isRunning ? true : false
          }
          isHighlight={highlight}
          swopHighlight={highlightDeck}
        />

        {effectDisplay}

        {lastRound ? (
          <div className={styles.LastRoundIndicator}>Last Round</div>
        ) : null}

        <DisplayPlayers
          id={myState.id}
          currentPlayerId={currentPlayer}
          gameIsRunning={roundState.isRunning}
          players={players}
        />

        {currentPlayer === myState.id &&
        !lastRound &&
        !playEffect &&
        highlight.deck
          ? endingButton
          : null}

        {isDev ? devButtons : null}

        {!roundState.isRunning && !gameHasEnded ? startRoundButton : null}

        {gameHasEnded ? gameEndedDisplay : null}

        <div
          style={{ zIndex: 10 }}
          onClick={() => {
            socket.emit("endGame");
          }}
          className={styles.ForceEndBtn}
        >
          Force End Game
        </div>
      </div>
    );
  } else {
    classes.push(styles.isStartScreen);

    const startBtnStyles = [styles.StartButton];
    let playingPlayers = 0;

    for (let i = 0; i < players.length; i++) {
      if (players[i].isPlaying) {
        playingPlayers++;
      }
    }

    if (playingPlayers < 2) {
      startBtnStyles.push(styles.StartButtonIsDisabled);
    }

    return (
      <div className={classes.join(" ")}>
        <h1>Kaboom</h1>

        <PlayerSelection
          onNameChange={changeName}
          onPlayerToggle={(pID) => playerToggle(pID)}
          id={myState.id}
          players={players}
        />

        <div
          className={startBtnStyles.join(" ")}
          onClick={() => {
            socket.emit("startGame");
          }}
        >
          Start Game
        </div>
      </div>
    );
  }
};

export default Game;
