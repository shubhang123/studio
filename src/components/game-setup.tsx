
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import type { PlayerSetup, GameConfig } from "@/types";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { findUserByEmail } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";

interface GameSetupProps {
  onStartGame: (players: PlayerSetup[], startingCardCount: number, config: GameConfig) => void;
}

const AVATAR_COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', 
    '#A133FF', '#33FFA1', '#FFC300', '#FF3333'
];

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerSetup[]>([]);
  const [startingCardCount, setStartingCardCount] = useState(13);
  const [config, setConfig] = useState<GameConfig>({
    enableStreakBonus: true,
    enablePerfectGameBonus: true,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleAddPlayer = async () => {
    if (!inviteEmail) return;
    if (players.length >= 8) {
      toast({ title: "Maximum Players", description: "You can have a maximum of 8 players.", variant: "destructive" });
      return;
    }
    if (players.some(p => p.email === inviteEmail) || user?.email === inviteEmail) {
      toast({ title: "Player Already Added", description: "This player is already in the game.", variant: "destructive" });
      setInviteEmail("");
      return;
    }

    setIsSearching(true);
    const foundUser = await findUserByEmail(inviteEmail);
    setIsSearching(false);

    if (foundUser) {
      const nextColor = AVATAR_COLORS[players.length % AVATAR_COLORS.length];
      setPlayers([...players, { 
        uid: foundUser.uid, 
        name: foundUser.name, 
        email: foundUser.email,
        avatarColor: nextColor 
      }]);
      setInviteEmail("");
    } else {
      toast({
        title: "User Not Found",
        description: "No registered user found with that email address.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlayer = (uid: string) => {
    setPlayers(players.filter(p => p.uid !== uid));
  };

  const handleConfigChange = (key: keyof GameConfig, value: boolean) => {
    setConfig(prev => ({...prev, [key]: value}));
  };

  const handleStartGame = () => {
    if (!user) {
        toast({ title: "Not Logged In", description: "You must be logged in to start a game.", variant: "destructive" });
        return;
    }
    
    // Add the host to the player list
    const hostPlayer: PlayerSetup = {
        uid: user.uid,
        name: user.email?.split('@')[0] || 'Host',
        email: user.email!,
        avatarColor: AVATAR_COLORS[players.length % AVATAR_COLORS.length]
    };

    const allPlayers = [hostPlayer, ...players];

    if (allPlayers.length < 2) {
      toast({ title: "Invalid Setup", description: "You need at least two players to start a game.", variant: "destructive" });
      return;
    }

    onStartGame(allPlayers, startingCardCount, config);
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
            {/* Display invited players */}
            {players.map((player) => (
              <div key={player.uid} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                <Avatar className="h-8 w-8">
                    <AvatarFallback style={{backgroundColor: player.avatarColor, color: '#fff'}}>
                        {player.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p className="font-medium">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePlayer(player.uid)}
                  aria-label={`Remove ${player.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
           <div className="flex items-center gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter player's email to invite"
                  disabled={isSearching}
                />
                <Button onClick={handleAddPlayer} disabled={players.length >= 7 || isSearching}>
                  {isSearching ? <Loader2 className="animate-spin" /> : <UserPlus />}
                  Add
                </Button>
            </div>
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
