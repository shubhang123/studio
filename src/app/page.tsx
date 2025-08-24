"use client";

import { useState } from 'react';
import type { Player } from '@/types';
import GameSetup from '@/components/game-setup';
import GameBoard from '@/components/game-board';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiamondIcon } from '@/components/icons';

type GamePhase = 'setup' | 'playing' | 'finished';

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState(Date.now()); // Used to reset the game

  const startGame = (playerNames: string[]) => {
    setPlayers(
      playerNames.map((name) => ({
        id: crypto.randomUUID(),
        name,
        totalScore: 0,
        bidHistory: [],
        currentBid: null,
        currentTricks: null,
        streak: 0,
        isBidSuccessful: null,
      }))
    );
    setGamePhase('playing');
  };

  const restartGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setGameKey(Date.now());
  };

  const renderGamePhase = () => {
    switch (gamePhase) {
      case 'setup':
        return <GameSetup onStartGame={startGame} />;
      case 'playing':
        return <GameBoard key={gameKey} initialPlayers={players} onRestartGame={restartGame} />;
      default:
        return <GameSetup onStartGame={startGame} />;
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-muted/40">
      <header className="w-full max-w-7xl flex items-center justify-center mb-8">
        <DiamondIcon className="h-10 w-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold ml-4">
          Trickster
        </h1>
      </header>
      <div className="w-full max-w-7xl">
        {renderGamePhase()}
      </div>
    </main>
  );
}
