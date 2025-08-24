"use client";

import type { Player } from '@/types';
import PlayerCard from './player-card';

interface ScoringViewProps {
  players: Player[];
  currentRound: number;
  startingCardCount: number;
  onTricksChange: (playerId: string, tricks: number | null) => void;
}

export default function ScoringView({
  players,
  currentRound,
  startingCardCount,
  onTricksChange,
}: ScoringViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          allPlayers={players}
          currentRound={currentRound}
          startingCardCount={startingCardCount}
          gamePhase="scoring"
          onBidChange={() => {}} // Not used in scoring view
          onTricksChange={onTricksChange}
        />
      ))}
    </div>
  );
}
