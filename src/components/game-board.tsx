"use client";

import { useState, useMemo } from 'react';
import type { Player } from '@/types';
import PlayerCard from './player-card';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { calculateScores, checkForPerfectGameBonus } from '@/lib/game-logic';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Award, RotateCcw } from 'lucide-react';

interface GameBoardProps {
  initialPlayers: Player[];
  onRestartGame: () => void;
}

type GamePhase = 'bidding' | 'scoring' | 'round-end' | 'game-over';
const STARTING_CARD_COUNT = 13;

export default function GameBoard({ initialPlayers, onRestartGame }: GameBoardProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentRound, setCurrentRound] = useState(1);
  const [gamePhase, setGamePhase] = useState<GamePhase>('bidding');

  const handleBidChange = (playerId: string, bid: number | null) => {
    setPlayers(players.map(p => (p.id === playerId ? { ...p, currentBid: bid } : p)));
  };

  const handleTricksChange = (playerId: string, tricks: number | null) => {
    setPlayers(players.map(p => (p.id === playerId ? { ...p, currentTricks: tricks } : p)));
  };

  const allBidsIn = useMemo(() => players.every(p => p.currentBid !== null), [players]);
  const allTricksIn = useMemo(() => players.every(p => p.currentTricks !== null), [players]);

  const handleScoreRound = () => {
    const updatedPlayers = calculateScores(players, currentRound);
    setPlayers(updatedPlayers);
    setGamePhase('round-end');
  };

  const handleNextRound = () => {
    if (currentRound === STARTING_CARD_COUNT) {
        let finalPlayers = checkForPerfectGameBonus(players);
        setPlayers(finalPlayers);
        setGamePhase('game-over');
    } else {
        setPlayers(players.map(p => ({ ...p, currentBid: null, currentTricks: null, isBidSuccessful: null })));
        setCurrentRound(currentRound + 1);
        setGamePhase('bidding');
    }
  };
  
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.totalScore - a.totalScore), [players]);
  const winner = gamePhase === 'game-over' ? sortedPlayers[0] : null;


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Round {currentRound} / {STARTING_CARD_COUNT}</CardTitle>
            <CardDescription>Cards per hand: {STARTING_CARD_COUNT - currentRound + 1}</CardDescription>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline"><RotateCcw className="mr-2" />Restart Game</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end the current game and return to the setup screen. All progress will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onRestartGame}>Restart</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {gamePhase === 'bidding' && (
              <Button onClick={() => setGamePhase('scoring')} disabled={!allBidsIn}>
                Start Scoring
              </Button>
            )}
            {gamePhase === 'scoring' && (
              <Button onClick={handleScoreRound} disabled={!allTricksIn}>
                Score Round
              </Button>
            )}
            {gamePhase === 'round-end' && (
              <Button onClick={handleNextRound}>
                Next Round
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

       {gamePhase === 'game-over' && winner && (
        <Card className="bg-secondary text-secondary-foreground text-center p-6">
            <CardHeader>
                <div className="flex justify-center items-center gap-4">
                    <Award className="w-12 h-12 text-accent" />
                    <div>
                        <CardTitle className="text-3xl">Game Over!</CardTitle>
                        <CardDescription className="text-xl">
                            {winner.name} wins with {winner.totalScore} points!
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            allPlayers={players}
            currentRound={currentRound}
            startingCardCount={STARTING_CARD_COUNT}
            gamePhase={gamePhase}
            onBidChange={handleBidChange}
            onTricksChange={handleTricksChange}
          />
        ))}
      </div>
    </div>
  );
}
