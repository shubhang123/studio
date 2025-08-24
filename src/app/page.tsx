
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { BarChart, Gamepad2, Play, Users, Trophy } from "lucide-react";
import { DiamondIcon } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { gameHistory, startNewGame, currentGame, isInitialized } = useGameStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const totalGamesPlayed = gameHistory.length;
  const uniquePlayers = new Set(
    gameHistory.flatMap((game) => game.players.map((p) => p.name))
  );

  const allBids = gameHistory.flatMap((game) =>
    game.players.flatMap((p) => p.bidHistory)
  );
  const successfulBids = allBids.filter((h) => h.bid === h.tricks).length;
  const bidSuccessRate =
    allBids.length > 0
      ? Math.round((successfulBids / allBids.length) * 100)
      : 0;

  const handleStartNewGame = () => {
    startNewGame();
    router.push("/setup");
  };
  
  const handleResumeGame = () => {
    router.push('/game');
  }
  
  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
  }

  if (loading || !user || !isInitialized) {
    return null; // Or a loading spinner
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Games Played
              </CardTitle>
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGamesPlayed}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Players
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniquePlayers.size}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bid Success Rate
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bidSuccessRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 text-center">
           {currentGame && currentGame.players.length > 0 ? (
            <div className="space-y-4">
              <Card className="bg-secondary/80 backdrop-blur-sm text-center p-6 border-accent">
                <CardHeader>
                    <CardTitle>Game in Progress</CardTitle>
                    <p className="text-muted-foreground">
                      Round {currentGame.currentRound} with {currentGame.players.map(p => p.name).join(', ')}
                    </p>
                </CardHeader>
                <CardContent>
                    <Button size="lg" onClick={handleResumeGame} variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Play className="mr-2" /> Resume Game
                    </Button>
                </CardContent>
              </Card>
               <Button size="lg" onClick={handleStartNewGame} variant="outline" className="w-full">
                Start New Game
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
