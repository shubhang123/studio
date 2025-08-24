"use client";

import { useState, useMemo } from 'react';
import type { Player } from '@/types';
import PlayerCard from './player-card';
import GameHistory from './game-history';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { calculateScores, checkForPerfectGameBonus } from '@/lib/game-logic';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Award, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleBidChange = (playerId: string, bid: number | null) => {
    setPlayers(players.map(p => (p.id === playerId ? { ...p, currentBid: bid } : p)));
  };

  const handleTricksChange = (playerId: string, tricks: number | null) => {
    setPlayers(players.map(p => (p.id === playerId ? { ...p, currentTricks: tricks } : p)));
  };

  const allBidsIn = useMemo(() => players.every(p => p.currentBid !== null), [players]);
  const allTricksIn = useMemo(() => players.every(p => p.currentTricks !== null), [players]);
  
  const cardsThisRound = STARTING_CARD_COUNT - currentRound + 1;

  const handleStartScoring = () => {
    const totalBids = players.reduce((acc, player) => acc + (player.currentBid ?? 0), 0);
    if (totalBids === cardsThisRound) {
        toast({
            title: "Invalid Bids",
            description: `The total number of bids (${totalBids}) cannot equal the number of cards in hand (${cardsThisRound}). Someone has to break!`,
            variant: "destructive",
        });
        return;
    }
    setGamePhase('scoring');
  };

  const handleScoreRound = () => {
    const totalTricksTaken = players.reduce((acc, player) => acc + (player.currentTricks ?? 0), 0);
    if (totalTricksTaken !== cardsThisRound) {
        toast({
            title: "Invalid Trick Count",
            description: `The total number of tricks taken (${totalTricksTaken}) must equal the number of cards in hand (${cardsThisRound}).`,
            variant: "destructive",
        });
        return;
    }

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
  
  const sortedPlayersByScore = useMemo(() => [...players].sort((a, b) => b.totalScore - a.totalScore), [players]);
  const winner = gamePhase === 'game-over' ? sortedPlayersByScore[0] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Round {currentRound} / {STARTING_CARD_COUNT}</CardTitle>
            <CardDescription>Cards per hand: {cardsThisRound}</CardDescription>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline"><RotateCcw />Restart Game</Button>
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
              <Button onClick={handleStartScoring} disabled={!allBidsIn}>
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
                        <CardDescription className="text-xl text-secondary-foreground/80">
                            {winner.name} wins with {winner.totalScore} points!
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="md:col-span-1">
          <GameHistory players={sortedPlayersByScore} currentRound={currentRound} totalRounds={STARTING_CARD_COUNT} />
        </div>
      </div>
    </div>
  );
}
