"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameSetupProps {
  onStartGame: (playerNames: string[]) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2"]);
  const { toast } = useToast();

  const handleAddPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    } else {
      toast({
        title: "Maximum Players",
        description: "You can have a maximum of 8 players.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length > 2) {
      const newPlayerNames = [...playerNames];
      newPlayerNames.splice(index, 1);
      setPlayerNames(newPlayerNames);
    } else {
       toast({
        title: "Minimum Players",
        description: "You need at least 2 players to start.",
        variant: "destructive",
      });
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const handleStartGame = () => {
    const validPlayerNames = playerNames.filter((name) => name.trim() !== "");
    if (validPlayerNames.length < 2) {
      toast({
        title: "Invalid Setup",
        description: "Please enter names for at least two players.",
        variant: "destructive",
      });
      return;
    }
    if (new Set(validPlayerNames).size !== validPlayerNames.length) {
      toast({
        title: "Duplicate Names",
        description: "Player names must be unique.",
        variant: "destructive",
      });
      return;
    }
    onStartGame(validPlayerNames);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Game Setup</CardTitle>
        <CardDescription>Add players to start a new game of Trickster. (2-8 players)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Players</Label>
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePlayer(index)}
                disabled={playerNames.length <= 2}
                aria-label={`Remove Player ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={handleAddPlayer} disabled={playerNames.length >= 8} className="w-full">
          <UserPlus className="mr-2" />
          Add Player
        </Button>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartGame} className="w-full">
          Start Game
        </Button>
      </CardFooter>
    </Card>
  );
}
