import type {
  Player,
  FocusCard,
  Deck as DeckType,
  Card as CardType,
  HandCard,
  PlayerID,
  CardEffect,
  CardPosition,
  CardHighlightType,
} from "../../../types";

// TODO: need to add round values
type GameStateType = {
  players: Player[];
  isRunning: boolean;
  hasEnded: boolean;
};

type RoundStateType = {
  count: number;
  currentPlayer: PlayerID;
  isLastRound: PlayerID | false;
  isRunning: boolean;
};

export type { GameStateType, RoundStateType };
