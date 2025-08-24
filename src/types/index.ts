export interface Player {
  id: string;
  name: string;
  totalScore: number;
  bidHistory: { round: number; bid: number; tricks: number; score: number }[];
  currentBid: number | null;
  currentTricks: number | null;
  streak: number;
  isBidSuccessful: boolean | null;
}

export interface BidSuggestion {
  suggestedBid: number;
  reasoning: string;
}
