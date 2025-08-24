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

export interface NumberSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  disabled?: boolean;
}
