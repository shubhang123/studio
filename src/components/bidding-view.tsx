"use client";

import type { Player } from '@/types';
import PlayerCard from './player-card';

interface BiddingViewProps {
  players: Player[];
  allPlayers: Player[];
  currentRound: number;
  startingCardCount: number;
  onBidChange: (playerId: string, bid: number | null) => void;
}

export default function BiddingView({
  players,
  allPlayers,
  currentRound,
  startingCardCount,
  onBidChange,
}: BiddingViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          allPlayers={allPlayers}
          currentRound={currentRound}
          startingCardCount={startingCardCount}
          gamePhase="bidding"
          onBidChange={onBidChange}
          onTricksChange={() => {}} // Not used in bidding view
        />
      ))}
    </div>
  );
}
