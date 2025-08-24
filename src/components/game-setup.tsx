
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import type { PlayerSetup, GameConfig } from "@/types";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";

interface GameSetupProps {
  onStartGame: (players: PlayerSetup[], startingCardCount: number, config: GameConfig) => void;
}

const AVATAR_COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', 
    '#A133FF', '#33FFA1', '#FFC300', '#FF3333'
];

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: "Player 1", avatarColor: AVATAR_COLORS[0] }, 
    { name: "Player 2", avatarColor: AVATAR_COLORS[1] }, 
    { name: "Player 3", avatarColor: AVATAR_COLORS[2] }
]);
  const [startingCardCount, setStartingCardCount] = useState(13);
  const [config, setConfig] = useState<GameConfig>({
    enableStreakBonus: true,
    enablePerfectGameBonus: true,
  });
  const { toast } = useToast();

  const handleAddPlayer = () => {
    if (players.length < 8) {
        const nextColor = AVATAR_COLORS[players.length % AVATAR_COLORS.length];
        setPlayers([...players, { name: `Player ${players.length + 1}`, avatarColor: nextColor }]);
    } else {
      toast({
        title: "Maximum Players",
        description: "You can have a maximum of 8 players.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 2) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);
    } else {
       toast({
        title: "Minimum Players",
        description: "You need at least 2 players to start.",
        variant: "destructive",
      });
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handleConfigChange = (key: keyof GameConfig, value: boolean) => {
    setConfig(prev => ({...prev, [key]: value}));
  };

  const handleStartGame = () => {
    const validPlayers = players.filter((p) => p.name.trim() !== "");
    if (validPlayers.length < 2) {
      toast({
        title: "Invalid Setup",
        description: "Please enter names for at least two players.",
        variant: "destructive",
      });
      return;
    }
    const playerNames = validPlayers.map(p => p.name);
    if (new Set(playerNames).size !== playerNames.length) {
      toast({
        title: "Duplicate Names",
        description: "Player names must be unique.",
        variant: "destructive",
      });
      return;
    }
    onStartGame(validPlayers, startingCardCount, config);
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Game Setup</CardTitle>
        <CardDescription>Configure players and game rules to start a new game of Trickster.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Players (2-8)</Label>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarFallback style={{backgroundColor: player.avatarColor, color: '#fff'}}>
                        {player.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <Input
                  type="text"
                  value={player.name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePlayer(index)}
                  disabled={players.length <= 2}
                  aria-label={`Remove Player ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={handleAddPlayer} disabled={players.length >= 8} className="w-full">
            <UserPlus className="mr-2" />
            Add Player
          </Button>
        </div>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <Label>Starting Cards</Label>
                 <span className="font-code text-lg font-bold">{startingCardCount}</span>
            </div>
            <Slider
                value={[startingCardCount]}
                onValueChange={(value) => setStartingCardCount(value[0])}
                min={7}
                max={15}
                step={1}
            />
        </div>
        <div className="space-y-4">
            <Label>Game Rules</Label>
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <Label htmlFor="streak-bonus" className="flex flex-col space-y-1">
                    <span>Streak Bonuses</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Award extra points for consecutive successful bids.
                    </span>
                </Label>
                <Switch 
                    id="streak-bonus" 
                    checked={config.enableStreakBonus} 
                    onCheckedChange={(value) => handleConfigChange('enableStreakBonus', value)}
                />
            </div>
             <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <Label htmlFor="perfect-game-bonus" className="flex flex-col space-y-1">
                    <span>Perfect Game Bonus</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Award 50 bonus points for a flawless game.
                    </span>
                </Label>
                <Switch 
                    id="perfect-game-bonus" 
                    checked={config.enablePerfectGameBonus}
                    onCheckedChange={(value) => handleConfigChange('enablePerfectGameBonus', value)}
                />
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartGame} className="w-full">
          Start Game
        </Button>
      </CardFooter>
    </Card>
  );
}
