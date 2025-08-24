
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLeaderboard } from '@/app/actions';
import { DiamondIcon } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import type { LeaderboardPlayer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const AVATAR_COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', 
    '#A133FF', '#33FFA1', '#FFC300', '#FF3333'
];

function LeaderboardSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function LeaderboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
        } else if (user) {
            const fetchLeaderboard = async () => {
                setLoading(true);
                const data = await getLeaderboard();
                setLeaderboard(data);
                setLoading(false);
            };
            fetchLeaderboard();
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
            <header className="w-full max-w-7xl flex items-center justify-center mb-8 pt-8">
                <DiamondIcon className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-headline font-bold ml-4">
                Trickster
                </h1>
            </header>
            <div className="w-full max-w-4xl">
                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Global Leaderboard</CardTitle>
                        <CardDescription>See how you rank against players worldwide.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                           <LeaderboardSkeleton />
                        ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Rank</TableHead>
                                        <TableHead>Player</TableHead>
                                        <TableHead className="text-center">Games Won</TableHead>
                                        <TableHead className="text-center">Games Played</TableHead>
                                        <TableHead className="text-center">Win Rate</TableHead>
                                        <TableHead className="text-right">Total Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboard.map((player, index) => (
                                        <TableRow key={player.uid}>
                                            <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length]}}>
                                                            {player.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{player.name}</p>
                                                        <p className="text-xs text-muted-foreground">{player.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-code">{player.gamesWon}</TableCell>
                                            <TableCell className="text-center font-code">{player.gamesPlayed}</TableCell>
                                            <TableCell className="text-center font-code">
                                                {player.gamesPlayed > 0 ? `${Math.round((player.gamesWon / player.gamesPlayed) * 100)}%` : '0%'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold font-code">{player.totalPoints}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                         {!loading && leaderboard.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">The leaderboard is empty.</p>
                                <p className="text-sm text-muted-foreground">Complete a game to see your name here!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="text-center mt-8">
                    <Button variant="outline" onClick={() => router.push('/')}>Back to Dashboard</Button>
                </div>
            </div>
        </div>
    )
}
