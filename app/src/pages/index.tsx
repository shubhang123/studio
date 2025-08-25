"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Play, Trophy } from "lucide-react";
import { DiamondIcon } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import type { GameState } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

function GameListSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeGames, setActiveGames] = useState<GameState[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (user) {
        setLoadingGames(true);
        fetch(`/api/games/active?userId=${user.uid}`)
            .then(res => res.json())
            .then(games => {
                setActiveGames(games);
                setLoadingGames(false);
            });
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><GameListSkeleton /></div>;
  }

  const handleStartNewGame = () => {
    router.push("/setup");
  };
  
  const handleResumeGame = (gameId: string) => {
    router.push(`/game?id=${gameId}`);
  }
  
  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
      <header className="w-full max-w-7xl flex items-center justify-center mb-8 pt-8">
        <DiamondIcon className="h-10 w-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold ml-4">
          Trickster
        </h1>
      </header>
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
           {loadingGames ? (
             <GameListSkeleton />
           ) : activeGames.length > 0 ? (
            <div className="space-y-4">
              <Card className="bg-secondary/80 backdrop-blur-sm text-center p-6 border-accent">
                <CardHeader>
                    <CardTitle>Your Active Games</CardTitle>
                    <CardDescription>
                      Select a game to resume playing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {activeGames.map(game => (
                       <Button 
                         key={game.id} 
                         size="lg" 
                         onClick={() => handleResumeGame(game.id)} 
                         variant="default" 
                         className="bg-accent text-accent-foreground hover:bg-accent/90 w-full justify-between"
                       >
                           <span>
                                <Play className="mr-2 inline" /> 
                                Game with {game.players.map(p => p.name).join(', ')}
                           </span>
                           <span className="text-sm opacity-80">
                               Round {game.currentRound}
                           </span>
                       </Button>
                    ))}
                </CardContent>
              </Card>
               <Button size="lg" onClick={handleStartNewGame} variant="outline" className="w-full">
                Start a New Game
              </Button>
            </div>
          ) : (
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleStartNewGame} className="w-full sm:w-1/2">
                    <Play className="mr-2" /> Start New Game
                </Button>
                <Button size="lg" onClick={handleViewLeaderboard} variant="secondary" className="w-full sm:w-1/2">
                    <Trophy className="mr-2" /> View Leaderboard
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
