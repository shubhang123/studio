"use client";

import type { Player } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge';
import { Flame, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from './ui/avatar';

interface GameHistoryProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
}

export default function GameHistory({ players, currentRound, totalRounds }: GameHistoryProps) {
  const getRoundResult = (player: Player, round: number) => {
    const history = player.bidHistory.find(h => h.round === round);
    if (!history) return <span className="text-muted-foreground">-</span>;

    const successful = history.bid === history.tricks;
    return (
      <div className={cn("text-center", successful ? "text-green-500" : "text-red-500")}>
         {history.bid} / {history.tricks}
      </div>
    );
  };
  
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
        <CardDescription>Live game scores and history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback style={{backgroundColor: player.avatarColor, fontSize: '0.75rem'}}>
                            {player.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    {player.name}
                    {player.streak >= 3 && (
                      <Badge variant="destructive" className="flex items-center gap-1 bg-accent text-accent-foreground">
                        <Flame className="h-3 w-3" /> {player.streak}
                      </Badge>
                    )}
                    {player.bidHistory.every(h => h.bid === h.tricks) && player.bidHistory.length === totalRounds && (
                       <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> Perfect
                       </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-code font-bold">{player.totalScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>View Full Score Sheet</AccordionTrigger>
            <AccordionContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Player</TableHead>
                                {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => (
                                    <TableHead key={round} className="text-center">{round}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {players.map(player => (
                                <TableRow key={player.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{player.name}</TableCell>
                                    {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => (
                                        <TableCell key={round} className="font-code">
                                           {getRoundResult(player, round)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
