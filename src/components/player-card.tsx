"use client";

import { useState } from 'react';
import type { Player, BidSuggestion } from '@/types';
import { getAiBidSuggestion } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Wand2, Loader2, TrendingUp, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import NumberSelector from './number-selector';
import { Avatar, AvatarFallback } from './ui/avatar';

interface PlayerCardProps {
  player: Player;
  allPlayers: Player[];
  currentRound: number;
  startingCardCount: number;
  gamePhase: 'bidding' | 'scoring' | 'round-end' | 'game-over';
  onBidChange: (playerId: string, bid: number | null) => void;
  onTricksChange: (playerId: string, tricks: number | null) => void;
}

export default function PlayerCard({
  player,
  allPlayers,
  currentRound,
  startingCardCount,
  gamePhase,
  onBidChange,
  onTricksChange,
}: PlayerCardProps) {
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<BidSuggestion | null>(null);

  const handleGetAiSuggestion = async () => {
    setIsAiLoading(true);
    setAiSuggestion(null);
    const result = await getAiBidSuggestion({
      player,
      players: allPlayers,
      currentRound,
      startingCardCount,
    });
    setIsAiLoading(false);

    if ('error' in result) {
      toast({
        title: 'AI Advisor Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setAiSuggestion(result);
    }
  };

  const cardStateClass = cn({
    'border-green-500/50 border-2': player.isBidSuccessful === true,
    'border-red-500/50 border-2': player.isBidSuccessful === false,
  });

  const cardsThisRound = startingCardCount - currentRound + 1;

  return (
    <Card className={cn("flex flex-col bg-card/80 backdrop-blur-sm transition-all", cardStateClass)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                 <Avatar>
                    <AvatarFallback style={{backgroundColor: player.avatarColor}}>
                        {player.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <span>{player.name}</span>
                     <CardDescription>
                      <span className="font-code text-2xl font-bold">{player.totalScore} pts</span>
                    </CardDescription>
                </div>
            </div>
          
          {player.streak >= 3 && (
            <Badge variant="destructive" className="flex items-center gap-1 bg-accent text-accent-foreground">
              <Flame className="h-4 w-4" /> {player.streak}
            </Badge>
          )}
        </CardTitle>
       
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`bid-${player.id}`}>Bid</Label>
            {gamePhase === 'bidding' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleGetAiSuggestion} disabled={isAiLoading} className="h-8 w-8">
                    {isAiLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                  </Button>
                </PopoverTrigger>
                {aiSuggestion && (
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">AI Bid Suggestion</h4>
                        <p className="text-sm text-muted-foreground">
                          Suggested Bid: <strong className="font-code">{aiSuggestion.suggestedBid}</strong>
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-muted-foreground">{aiSuggestion.reasoning}</p>
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            )}
          </div>
          <NumberSelector
            value={player.currentBid}
            onChange={(value) => onBidChange(player.id, value)}
            min={0}
            max={cardsThisRound}
            disabled={gamePhase !== 'bidding'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`tricks-${player.id}`}>Tricks Taken</Label>
          <NumberSelector
            value={player.currentTricks}
            onChange={(value) => onTricksChange(player.id, value)}
            min={0}
            max={cardsThisRound}
            disabled={gamePhase !== 'scoring'}
          />
        </div>
      </CardContent>
       <CardFooter>
          {player.bidHistory.length > 0 &&
            <p className="text-xs text-muted-foreground">
              Last Round: Bid {player.bidHistory.slice(-1)[0].bid}, Took {player.bidHistory.slice(-1)[0].tricks}
            </p>
          }
       </CardFooter>
    </Card>
  );
}
