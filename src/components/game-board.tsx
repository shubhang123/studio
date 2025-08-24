"use client";

import { useState, useMemo } from 'react';
import type { Player } from '@/types';
import GameHistory from './game-history';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { calculateScores, checkForPerfectGameBonus } from '@/lib/game-logic';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Award, RotateCcw, Swords, Hand } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import BiddingView from './bidding-view';
import ScoringView from './scoring-view';

interface GameBoardProps {
  initialPlayers: Player[];
  startingCardCount: number;
  onRestartGame: () => void;
}

type GamePhase = 'bidding' | 'scoring' | 'round-end' | 'game-over';

export default function GameBoard({ initialPlayers, startingCardCount, onRestartGame }: GameBoardProps) {
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
  
  const cardsThisRound = startingCardCount - currentRound + 1;
  const totalBids = useMemo(() => players.reduce((acc, player) => acc + (player.currentBid ?? 0), 0), [players]);


  const handleStartScoring = () => {
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
    if (currentRound === startingCardCount) {
        let finalPlayers = checkForPerfectGameBonus(players);
        setPlayers(finalPlayers);
        setGamePhase('game-over');
    } else {
        const nextRound = currentRound + 1;
        const dealerIndex = (nextRound - 1) % players.length;
        const turnIndex = (dealerIndex + 1) % players.length;
        setPlayers(players.map((p, index) => ({ 
          ...p, 
          currentBid: null, 
          currentTricks: null, 
          isBidSuccessful: null,
          isDealer: index === dealerIndex,
          isTurn: index === turnIndex
        })));
        setCurrentRound(nextRound);
        setGamePhase('bidding');
    }
  };
  
  const sortedPlayersByScore = useMemo(() => [...players].sort((a, b) => b.totalScore - a.totalScore), [players]);
  const winner = gamePhase === 'game-over' ? sortedPlayersByScore[0] : null;

  const renderPhaseTitle = () => {
    switch(gamePhase) {
      case 'bidding':
        return <><Hand className="mr-2" /> Place Your Bids</>
      case 'scoring':
        return <><Swords className="mr-2" /> Record Tricks Taken</>
      case 'round-end':
      case 'game-over':
        return 'Round Over'
      default:
        return ''
    }
  }
  
  const renderGameView = () => {
    switch (gamePhase) {
      case 'bidding':
        return (
          <BiddingView
            players={players}
            allPlayers={players}
            currentRound={currentRound}
            startingCardCount={startingCardCount}
            onBidChange={handleBidChange}
          />
        );
      case 'scoring':
        return (
          <ScoringView
            players={players}
            allPlayers={players}
            currentRound={currentRound}
            startingCardCount={startingCardCount}
            onTricksChange={handleTricksChange}
          />
        );
      case 'round-end':
      case 'game-over':
        // In a real scenario, you might have a dedicated round-end/game-over view
        // For now, we'll show the history which serves as a summary
        return <GameHistory players={sortedPlayersByScore} currentRound={currentRound} totalRounds={startingCardCount} />;
      default:
        return null;
    }
  };


  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center text-2xl">{renderPhaseTitle()}</CardTitle>
            <CardDescription>Round {currentRound} / {startingCardCount}</CardDescription>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-4 bg-secondary/50 p-2 rounded-md">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">CARDS</div>
                    <div className="text-2xl font-bold font-code">{cardsThisRound}</div>
                </div>
                {gamePhase === 'bidding' && (
                    <>
                        <div className="h-8 w-px bg-border"></div>
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground">TOTAL BIDS</div>
                            <div className={cn("text-2xl font-bold font-code", totalBids === cardsThisRound && "text-destructive")}>{totalBids}</div>
                        </div>
                    </>
                )}
            </div>
            <div className="flex gap-2 ml-auto">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline"><RotateCcw />Restart</Button>
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
                    Record Tricks
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
          </div>
        </CardHeader>
      </Card>

       {gamePhase === 'game-over' && winner && (
        <Card className="bg-secondary/80 backdrop-blur-sm text-secondary-foreground text-center p-6 border-accent">
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
        <div className="md:col-span-3">
            {renderGameView()}
        </div>
        <div className="md:col-span-3">
          <GameHistory players={sortedPlayersByScore} currentRound={currentRound} totalRounds={startingCardCount} />
        </div>
      </div>
    </div>
  );
}
