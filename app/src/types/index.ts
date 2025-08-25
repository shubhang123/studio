
export interface PlayerSetup {
  uid?: string; // Optional for guest players
  name: string;
  email?: string; // Optional for guest players
  avatarColor: string;
  isGuest: boolean;
}

export interface Player extends PlayerSetup {
  id: string; // Unique identifier for the player in the game (can be UID or a generated ID)
  totalScore: number;
  bidHistory: { round: number; bid: number; tricks: number; score: number }[];
  currentBid: number | null;
  currentTricks: number | null;
  streak: number;
  isBidSuccessful: boolean | null;
  isDealer: boolean;
}

export interface GameConfig {
  enableStreakBonus: boolean;
  enablePerfectGameBonus: boolean;
}

export interface GameState {
  id: string;
  players: Player[];
  playerIds: string[];
  hostId: string;
  currentRound: number;
  startingCardCount: number;
  gamePhase: 'setup' | 'bidding' | 'scoring' | 'round-end' | 'game-over';
  timestamp: number;
  config: GameConfig;
}

export interface BidSuggestion {
  suggestedBid: number;
  reasoning: string;
}

export interface NumberSelectorProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export interface LeaderboardPlayer {
    uid: string;
    name: string;
    email: string;
    gamesPlayed: number;
    gamesWon: number;
    totalPoints: number;
    totalBidsMade: number;
    totalBidsSuccess: number;
}
